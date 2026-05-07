import os
from app import create_app, db
from app.models import User, Vehicle, Driver

app = create_app()

# Move database creation outside the if block so Gunicorn runs it on Heroku
with app.app_context():
    db.create_all()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Vehicle': Vehicle, 'Driver': Driver}

if __name__ == '__main__':
    # Only run in debug mode locally, not on Heroku
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    port = int(os.getenv('PORT', 5000))
    
    app.run(debug=debug_mode, port=port, host='0.0.0.0')
