# Importando bibliotecas necessárias
from flask_sqlalchemy import SQLAlchemy

# Instanciando o objeto SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    # Configurando o banco de dados SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///clube.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Inicializando o SQLAlchemy com o app Flask
    db.init_app(app)
    # Criando as tabelas no banco de dados
    with app.app_context():
        db.create_all()