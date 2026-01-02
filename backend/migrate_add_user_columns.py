from app import create_app
from app.extensions import db
from sqlalchemy import inspect, text

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        inspector = inspect(db.engine)
        if 'users' in inspector.get_table_names():
            cols = [c['name'] for c in inspector.get_columns('users')]
            stmts = []
            if 'cancel_count' not in cols:
                stmts.append("ALTER TABLE users ADD COLUMN cancel_count INTEGER DEFAULT 0")
            if 'last_cancel_at' not in cols:
                stmts.append("ALTER TABLE users ADD COLUMN last_cancel_at TIMESTAMP NULL")
            if not stmts:
                print('No changes required; columns already present')
            for s in stmts:
                try:
                    print('Running:', s)
                    db.session.execute(text(s))
                    db.session.commit()
                    print('Success')
                except Exception as e:
                    db.session.rollback()
                    print('Failed to execute:', s)
                    print(e)
        else:
            print('users table not found; ensure you have run migrations/seeds')