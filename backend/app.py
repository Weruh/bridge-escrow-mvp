import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
from seeds import seed_database

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    if app.config['APP_ENV'] == 'hosted':
        if not os.environ.get('DATABASE_URL') or not os.environ['DATABASE_URL'].startswith('postgresql://'):
            raise RuntimeError('Hosted deployments require a PostgreSQL DATABASE_URL.')
        if not app.config['SECRET_KEY'] or not app.config['JWT_SECRET_KEY'] or app.config['SECRET_KEY'] == 'bridge-escrow-dev-super-secret-key-2026' or app.config['JWT_SECRET_KEY'] == 'jwt-dev-secret-token-key-2026':
            raise RuntimeError('Hosted deployments require unique SECRET_KEY and JWT_SECRET_KEY values.')
    
    origins = [origin.strip().rstrip('/') for origin in app.config['CORS_ORIGINS'].split(',') if origin.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins}})
    
    # Initialize extensions
    db.init_app(app)
    
    # Import and register blueprints
    from routes.auth_bp import auth_bp
    from routes.transactions_bp import transactions_bp
    from routes.payments_bp import payments_bp
    from routes.delivery_bp import delivery_bp
    from routes.disputes_bp import disputes_bp
    from routes.admin_bp import admin_bp
    from routes.wallet_bp import wallet_bp
    from routes.notifications_bp import notifications_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(delivery_bp, url_prefix='/api/delivery')
    app.register_blueprint(disputes_bp, url_prefix='/api/disputes')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(wallet_bp, url_prefix='/api/wallet')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'application': 'BridgeEscrow API',
            'version': '1.0.0',
            'environment': app.config.get('MPESA_ENV', 'sandbox'),
            'currency': 'KES'
        }), 200

    @app.cli.command("seed-db")
    def seed_cmd():
        seed_database()
        print("Database seeded successfully via CLI.")
        
    # Auto initialize SQLite tables and seed if brand new
    with app.app_context():
        db.create_all()
        # Seed if users table is empty
        from models.user import User
        if app.config['SEED_DEMO_DATA'] and User.query.count() == 0:
            seed_database()
            
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
