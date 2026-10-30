from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models.transaction import Transaction
from models.payment import Payment
from services.auth_service import jwt_required
from services.mpesa_service import (
    initiate_mpesa_stk_push, process_mpesa_callback, simulate_complete_payment
)

payments_bp = Blueprint('payments_bp', __name__)

@payments_bp.route('', methods=['GET'])
@jwt_required
def list_my_payments():
    payments = Payment.query.filter_by(user_id=request.current_user.id).order_by(Payment.created_at.desc()).all()
    return jsonify({'payments': [p.to_dict() for p in payments]}), 200

@payments_bp.route('/initiate', methods=['POST'])
@jwt_required
def initiate_payment():
    user = request.current_user
    data = request.get_json() or {}
    
    transaction_ref = data.get('transaction_ref')
    phone_number = data.get('phone_number') or user.phone_number
    
    if not transaction_ref:
        return jsonify({'error': 'Transaction reference is required.'}), 400
        
    tx = Transaction.query.filter_by(reference=transaction_ref).first()
    if not tx:
        return jsonify({'error': 'Transaction not found.'}), 404
        
    if tx.buyer_id != user.id:
        return jsonify({'error': 'Only the buyer is authorized to fund this escrow deal.'}), 403
        
    if tx.status != 'pending_payment':
        return jsonify({'error': f"Transaction cannot be funded in current status '{tx.status}'."}), 400
        
    success, message, payment_data = initiate_mpesa_stk_push(
        transaction_id=tx.id,
        user_id=user.id,
        phone_number=phone_number,
        amount=tx.total_amount
    )
    
    if not success:
        return jsonify({'error': message}), 400
        
    return jsonify({
        'message': message,
        'payment': payment_data,
        'transaction_ref': tx.reference,
        'amount': tx.total_amount
    }), 200

@payments_bp.route('/status/<checkout_id>', methods=['GET'])
@jwt_required
def check_status(checkout_id):
    payment = Payment.query.filter_by(checkout_request_id=checkout_id).first()
    if not payment:
        return jsonify({'error': 'Payment record not found.'}), 404
    if payment.user_id != request.current_user.id and request.current_user.role != 'admin':
        return jsonify({'error': 'You cannot view this payment.'}), 403
        
    return jsonify({
        'payment': payment.to_dict(),
        'transaction_status': payment.transaction.status if payment.transaction else None
    }), 200

@payments_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    Official Safaricom Daraja STK Push Callback Endpoint.
    Public endpoint hit by Safaricom servers.
    """
    if current_app.config.get('APP_ENV') == 'hosted':
        return jsonify({'error': 'Provider callbacks are disabled in this hosted demo.'}), 403
    callback_data = request.get_json() or {}
    success, message = process_mpesa_callback(callback_data)
    
    # Daraja expects standard acknowledgement
    return jsonify({
        'ResultCode': 0 if success else 1,
        'ResultDesc': message
    }), 200

@payments_bp.route('/simulate-confirm', methods=['POST'])
@jwt_required
def simulate_confirm():
    """
    Sandbox endpoint: Allows instant completion of an M-Pesa STK push in development mode.
    """
    data = request.get_json() or {}
    checkout_id = data.get('checkout_request_id')
    
    if not checkout_id:
        return jsonify({'error': 'checkout_request_id is required.'}), 400
        
    payment = Payment.query.filter_by(checkout_request_id=checkout_id).first()
    if not payment:
        return jsonify({'error': 'Payment record not found.'}), 404
    if current_app.config.get('MPESA_ENV') != 'sandbox':
        return jsonify({'error': 'Payment simulation is only available in sandbox mode.'}), 403
    if payment.provider != 'mpesa_sandbox_simulator':
        return jsonify({'error': 'This payment requires confirmation from M-Pesa.'}), 403
    if payment.user_id != request.current_user.id:
        return jsonify({'error': 'You cannot confirm another buyer’s payment.'}), 403
        
    success, message = simulate_complete_payment(checkout_id)
    if not success:
        return jsonify({'error': message}), 400
        
    return jsonify({
        'message': 'Payment confirmed successfully via M-Pesa Sandbox Adapter.',
        'payment': payment.to_dict(),
        'transaction_status': payment.transaction.status
    }), 200
