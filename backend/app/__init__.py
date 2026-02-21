from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from .config import Config

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.vehicles import vehicles_bp
    from .routes.drivers import drivers_bp
    from .routes.users import users_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vehicles_bp, url_prefix='/api/vehicles')
    app.register_blueprint(drivers_bp, url_prefix='/api/drivers')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    
    return app
