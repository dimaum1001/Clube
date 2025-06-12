# Importando o objeto db do database.py
from database import db
from datetime import datetime

class Associado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    cep = db.Column(db.String(9), nullable=True)  # Formato: 12345-678
    logradouro = db.Column(db.String(100), nullable=True)
    numero = db.Column(db.String(10), nullable=True)
    cidade = db.Column(db.String(50), nullable=True)
    estado = db.Column(db.String(2), nullable=True)
    status_pagamento = db.Column(db.String(20), default='Pendente')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    pagamentos = db.relationship('Pagamento', backref='associado', lazy=True)
    frequencias = db.relationship('Frequencia', backref='associado', lazy=True)
    dependentes = db.relationship('Dependente', backref='associado', lazy=True)

    # Relacionamentos
    pagamentos = db.relationship('Pagamento', backref='associado', lazy=True)
    frequencias = db.relationship('Frequencia', backref='associado', lazy=True)
    dependentes = db.relationship('Dependente', backref='associado', lazy=True)

# Modelo para Pagamentos
class Pagamento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    associado_id = db.Column(db.Integer, db.ForeignKey('associado.id'), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    data_pagamento = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Pendente')  # Pago ou Pendente
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Modelo para Frequência
class Frequencia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    associado_id = db.Column(db.Integer, db.ForeignKey('associado.id'), nullable=False)
    data_entrada = db.Column(db.DateTime, default=datetime.utcnow)

# Modelo para Funcionários
class Funcionario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    cargo = db.Column(db.String(50), nullable=False)
    cep = db.Column(db.String(9), nullable=True)  # Formato: 12345-678
    logradouro = db.Column(db.String(100), nullable=True)
    numero = db.Column(db.String(10), nullable=True)
    cidade = db.Column(db.String(50), nullable=True)
    estado = db.Column(db.String(2), nullable=True)  # UF, ex.: SP
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Modelo para Dependentes
class Dependente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    associado_id = db.Column(db.Integer, db.ForeignKey('associado.id'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    grau_parentesco = db.Column(db.String(50), nullable=False)  # Ex.: Filho, Cônjuge, Pai
    created_at = db.Column(db.DateTime, default=datetime.utcnow)