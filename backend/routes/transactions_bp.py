from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from models.transaction import Transaction
from models.verification import VerificationCode
from models.message import DealMessage
from models.events import DeliveryEvent
from services.notification_service import send_notification
from services.auth_service import jwt_required
from services.escrow_service import (
    create_escrow_deal, accept_deal_terms, mark_order_prepared, 
    buyer_accept_and_release, raise_dispute
)
from services.verification_service import generate_pickup_code, generate_handover_code

transactions_bp = Blueprint('transactions_bp', __name__)

@transactions_bp.route('', methods=['GET'])
@jwt_required
def list_transactions():
    user = request.current_user
    role_filter = request.args.get('role', '').lower()
    status_filter = request.args.get('status', '').strip()
    search = request.args.get('search', '').strip()
    
    query = Transaction.query
    
    # If admin and viewing all:
    if user.role == 'admin' and request.args.get('all') == 'true':
        pass
    else:
        # Default: user is buyer, seller, or assigned courier
        if role_filter == 'buyer':
            query = query.filter_by(buyer_id=user.id)
        elif role_filter == 'seller':
            query = query.filter_by(seller_id=user.id)
        elif role_filter == 'courier':
            query = query.filter_by(courier_id=user.id)
        else:
            query = query.filter(
                (Transaction.buyer_id == user.id) | 
                (Transaction.seller_id == user.id) | 
                (Transaction.courier_id == user.id)
            )
            
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    if search:
        query = query.filter(
            (Transaction.title.ilike(f"%{search}%")) |
            (Transaction.reference.ilike(f"%{search}%")) |
            (Transaction.description.ilike(f"%{search}%"))
        )
        
    transactions = query.order_by(Transaction.created_at.desc()).all()
    return jsonify({
        'transactions': [t.to_dict() for t in transactions],
        'total': len(transactions)
    }), 200

@transactions_bp.route('', methods=['POST'])
@jwt_required
def create_transaction():
    user = request.current_user
    data = request.get_json() or {}
    
    # Validation
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    category = data.get('category', 'goods_electronics')
    amount = float(data.get('amount', 0))
    delivery_fee = float(data.get('delivery_fee', 0))
    delivery_type = data.get('delivery_type', 'courier')
    creator_role = data.get('creator_role', 'buyer')
    if creator_role not in ['buyer', 'seller']:
        return jsonify({'error': 'Invalid creator role.'}), 400
    counterparty_identifier = str(data.get('buyer' if creator_role == 'seller' else 'seller', '')).strip()
    
    if not title or not description or amount <= 0:
        return jsonify({'error': 'Title, description, and a valid amount in KES are required.'}), 400
        
    if not counterparty_identifier:
        return jsonify({'error': 'Enter the counterparty email or phone number.'}), 400
    counterparty = User.query.filter(
        (User.email == counterparty_identifier.lower()) |
        (User.phone_number == counterparty_identifier)
    ).first()
    if not counterparty:
        return jsonify({'error': 'No account matches that email or phone number. Ask the other party to register first.'}), 404
    if counterparty.id == user.id:
        return jsonify({'error': 'You cannot create a deal with yourself.'}), 400
    buyer = counterparty if creator_role == 'seller' else user
    seller = user if creator_role == 'seller' else counterparty
        
    inspection_days = int(data.get('inspection_period_days', 3))
    
    tx = create_escrow_deal(
        buyer_id=buyer.id,
        seller_id=seller.id,
        title=title,
        description=description,
        category=category,
        amount=amount,
        delivery_fee=delivery_fee,
        delivery_type=delivery_type,
        inspection_period_days=inspection_days,
        acceptance_conditions=data.get('acceptance_conditions', ''),
        refund_conditions=data.get('refund_conditions', ''),
        release_requirements=data.get('release_requirements', ''),
        pickup_address=data.get('pickup_address', ''),
        dropoff_address=data.get('dropoff_address', ''),
        recipient_name=data.get('recipient_name', buyer.full_name),
        recipient_phone=data.get('recipient_phone', buyer.phone_number),
        creator_role=creator_role
    )
    
    return jsonify({
        'message': 'Escrow transaction deal created successfully.',
        'transaction': tx.to_dict()
    }), 201

@transactions_bp.route('/<ref>', methods=['GET'])
@jwt_required
def get_transaction_detail(ref):
    user = request.current_user
    tx = Transaction.query.filter_by(reference=ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
        
    # Authorization check
    is_admin = user.role == 'admin'
    is_party = user.id in [tx.buyer_id, tx.seller_id, tx.courier_id]
    if not is_admin and not is_party:
        return jsonify({'error': 'You are not authorized to view this transaction.'}), 403
        
    tx_dict = tx.to_dict()
    tx_dict['events'] = [e.to_dict() for e in tx.events]
    tx_dict['disputes'] = [d.to_dict() for d in tx.disputes]
    if is_admin or user.id in [tx.buyer_id, tx.seller_id]:
        tx_dict['messages'] = [m.to_dict() for m in DealMessage.query.filter_by(transaction_id=tx.id).order_by(DealMessage.created_at.asc(), DealMessage.id.asc()).all()]
    if tx.delivery_assignment:
        tx_dict['delivery_assignment'] = tx.delivery_assignment.to_dict()
        
    # Compute authorized actions for current user
    actions = {
        'can_accept_terms': tx.status == 'draft' and (
            (user.id == tx.buyer_id and not tx.terms.buyer_accepted) or
            (user.id == tx.seller_id and not tx.terms.seller_accepted)
        ),
        'can_pay': tx.status == 'pending_payment' and user.id == tx.buyer_id,
        'can_mark_ready': tx.status == 'payment_held' and user.id == tx.seller_id,
        'can_view_pickup_code': tx.status in ['payment_held', 'order_prepared'] and user.id == tx.seller_id,
        'can_view_handover_code': tx.status in ['order_prepared', 'in_transit'] and user.id == tx.buyer_id,
        'can_accept_and_release': tx.status in (['in_inspection'] if tx.delivery_type != 'digital_service' else ['payment_held', 'order_prepared', 'in_inspection']) and user.id == tx.buyer_id and not any(d.status in ['open', 'under_review'] for d in tx.disputes),
        'can_raise_dispute': tx.status in ['payment_held', 'order_prepared', 'in_transit', 'delivered', 'in_inspection'] and user.id in [tx.buyer_id, tx.seller_id] and not any(d.status in ['open', 'under_review'] for d in tx.disputes),
        'is_buyer': user.id == tx.buyer_id,
        'is_seller': user.id == tx.seller_id,
        'is_courier': user.id == tx.courier_id,
        'is_admin': is_admin
    }
    tx_dict['permissions'] = actions
    return jsonify({'transaction': tx_dict}), 200

@transactions_bp.route('/<ref>/messages', methods=['POST'])
@jwt_required
def send_deal_message(ref):
    user = request.current_user
    tx = Transaction.query.filter_by(reference=ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found.'}), 404
    if user.id not in [tx.buyer_id, tx.seller_id]:
        return jsonify({'error': 'Only the buyer and seller can message on this deal.'}), 403
    if tx.status in ['cancelled', 'refunded', 'completed']:
        return jsonify({'error': 'This deal is closed.'}), 400
    body = str((request.get_json() or {}).get('body', '')).strip()
    if not body or len(body) > 2000:
        return jsonify({'error': 'Enter a message of up to 2,000 characters.'}), 400
    message = DealMessage(transaction_id=tx.id, sender_id=user.id, body=body)
    db.session.add(message)
    DeliveryEvent.log(tx.id, 'deal_message', 'New deal message sent.', actor_id=user.id)
    recipient_id = tx.seller_id if user.id == tx.buyer_id else tx.buyer_id
    send_notification(recipient_id, f'New message on {tx.reference}', f'{user.full_name} sent a message about {tx.title}.', f'/transactions/{tx.reference}')
    db.session.commit()
    return jsonify({'message': message.to_dict()}), 201

@transactions_bp.route('/<ref>/accept-terms', methods=['POST'])
@jwt_required
def accept_terms(ref):
    user = request.current_user
    tx = Transaction.query.filter_by(reference=ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
        
    success, msg = accept_deal_terms(tx.id, user.id)
    if not success:
        return jsonify({'error': msg}), 400
        
    return jsonify({'message': msg, 'transaction': tx.to_dict()}), 200

@transactions_bp.route('/<ref>/mark-ready', methods=['POST'])
@jwt_required
def mark_ready(ref):
    user = request.current_user
    tx = Transaction.query.filter_by(reference=ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
        
    success, msg = mark_order_prepared(tx.id, user.id)
    if not success:
        return jsonify({'error': msg}), 400
        
    return jsonify({'message': msg, 'transaction': tx.to_dict()}), 200

@transactions_bp.route('/<ref>/pickup-code', methods=['GET'])
@jwt_required
def get_pickup_code(ref):
    """
    Authorized seller retrieves the 6-digit pickup verification code to show the courier.
    """
    user = request.current_user
    tx = Transaction.query.filter_by(reference=ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
        
    raw_code, msg = generate_pickup_code(tx.id, user.id)
    if not raw_code:
        return jsonify({'error': msg}), 400
        
    return jsonify({
        'code': raw_code,
        'code_type': 'pickup',
        'message': 'Provide this 6-digit code to the authorized courier at pickup.'
    }), 200

@transactions_bp.route('/<ref>/handover-code', methods=['GET'])
@jwt_required
def get_handover_code(ref):
    """
    Authorized buyer retrieves the 6-digit handover verification code to give to the courier.
    """
    user = request.current_user
    tx = Transaction.query.filter_by(reference=ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
        
    raw_code, msg = generate_handover_code(tx.id, user.id)
    if not raw_code:
        return jsonify({'error': msg}), 400
        
    return jsonify({
        'code': raw_code,
        'code_type': 'handover',
        'message': 'Give this 6-digit code to the courier when you physically receive your package.'
    }), 200

@transactions_bp.route('/<ref>/accept-and-release', methods=['POST'])
@jwt_required
def release_funds(ref):
    user = request.current_user
    tx = Transaction.query.filter_by(reference=ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
        
    success, msg = buyer_accept_and_release(tx.id, user.id)
    if not success:
        return jsonify({'error': msg}), 400
        
    return jsonify({'message': msg, 'transaction': tx.to_dict()}), 200

@transactions_bp.route('/<ref>/dispute', methods=['POST'])
@jwt_required
def open_dispute(ref):
    user = request.current_user
    tx = Transaction.query.filter_by(reference=ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
        
    data = request.get_json() or {}
    reason = data.get('reason', '').strip()
    description = data.get('description', '').strip()
    evidence_urls = data.get('evidence_urls', [])
    
    if not reason or not description:
        return jsonify({'error': 'Dispute reason and detailed description are required.'}), 400
        
    success, msg = raise_dispute(tx.id, user.id, reason, description, evidence_urls)
    if not success:
        return jsonify({'error': msg}), 400
        
    return jsonify({'message': msg, 'transaction': tx.to_dict()}), 200
