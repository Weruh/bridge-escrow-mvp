from datetime import datetime
from extensions import db


class DealMessage(db.Model):
    __tablename__ = 'deal_messages'

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=False, index=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    sender = db.relationship('User', foreign_keys=[sender_id])

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.full_name if self.sender else 'Unknown',
            'body': self.body,
            'created_at': self.created_at.isoformat(),
        }
