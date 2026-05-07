import os
from backend.app import create_app, db
from backend.app.models import User, Vehicle, Driver

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Vehicle': Vehicle, 'Driver': Driver}

if __name__ == '__main__':
    # Only run in debug mode locally, not on Heroku
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    port = int(os.getenv('PORT', 5000))
    
    with app.app_context():
        db.create_all()
    
    app.run(debug=debug_mode, port=port, host='0.0.0.0')
