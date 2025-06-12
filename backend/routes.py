# Importando bibliotecas necessárias
from flask import Blueprint, request, jsonify
from database import db
from models import Associado, Pagamento, Frequencia, Funcionario, Dependente
from datetime import datetime

# Criando o blueprint para as rotas
api = Blueprint('api', __name__)

# Rota para criar um associado
@api.route('/associados', methods=['POST'])
def criar_associado():
    data = request.get_json()
    try:
        novo_associado = Associado(
            nome=data['nome'],
            cpf=data['cpf'],
            data_nascimento=datetime.strptime(data['data_nascimento'], '%Y-%m-%d'),
            cep=data.get('cep'),
            logradouro=data.get('logradouro'),
            numero=data.get('numero'),
            cidade=data.get('cidade'),
            estado=data.get('estado'),
            status_pagamento=data.get('status_pagamento', 'Pendente')
        )
        db.session.add(novo_associado)
        db.session.commit()
        return jsonify({'message': 'Associado criado com sucesso', 'id': novo_associado.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Rota para listar associados
@api.route('/associados', methods=['GET'])
def listar_associados():
    associados = Associado.query.all()
    return jsonify([{
        'id': assoc.id,
        'nome': assoc.nome,
        'cpf': assoc.cpf,
        'data_nascimento': assoc.data_nascimento.strftime('%Y-%m-%d'),
        'cep': assoc.cep,
        'logradouro': assoc.logradouro,
        'numero': assoc.numero,
        'cidade': assoc.cidade,
        'estado': assoc.estado,
        'status_pagamento': assoc.status_pagamento
    } for assoc in associados]), 200

# Rota para registrar pagamento
@api.route('/pagamentos', methods=['POST'])
def registrar_pagamento():
    data = request.get_json()
    try:
        novo_pagamento = Pagamento(
            associado_id=data['associado_id'],
            valor=data['valor'],
            data_pagamento=datetime.strptime(data['data_pagamento'], '%Y-%m-%d'),
            status=data.get('status', 'Pendente')
        )
        db.session.add(novo_pagamento)
        db.session.commit()
        return jsonify({'message': 'Pagamento registrado com sucesso'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Rota para registrar frequência
@api.route('/frequencias', methods=['POST'])
def registrar_frequencia():
    data = request.get_json()
    try:
        nova_frequencia = Frequencia(
            associado_id=data['associado_id'],
            data_entrada=datetime.now()
        )
        db.session.add(nova_frequencia)
        db.session.commit()
        return jsonify({'message': 'Frequência registrada com sucesso'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Rota para listar frequência de um associado
@api.route('/frequencias/<int:associado_id>', methods=['GET'])
def listar_frequencias(associado_id):
    frequencias = Frequencia.query.filter_by(associado_id=associado_id).all()
    return jsonify([{
        'id': freq.id,
        'associado_id': freq.associado_id,
        'data_entrada': freq.data_entrada.strftime('%Y-%m-%d %H:%M:%S')
    } for freq in frequencias]), 200

# Rota para criar funcionário
@api.route('/funcionarios', methods=['POST'])
def criar_funcionario():
    data = request.get_json()
    try:
        novo_funcionario = Funcionario(
            nome=data['nome'],
            cpf=data['cpf'],
            cargo=data['cargo'],
            cep=data.get('cep'),
            logradouro=data.get('logradouro'),
            numero=data.get('numero'),
            cidade=data.get('cidade'),
            estado=data.get('estado')
        )
        db.session.add(novo_funcionario)
        db.session.commit()
        return jsonify({'message': 'Funcionário criado com sucesso', 'id': novo_funcionario.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Rota para listar funcionários
@api.route('/funcionarios', methods=['GET'])
def listar_funcionarios():
    funcionarios = Funcionario.query.all()
    return jsonify([{
        'id': func.id,
        'nome': func.nome,
        'cpf': func.cpf,
        'cargo': func.cargo,
        'cep': func.cep,
        'logradouro': func.logradouro,
        'numero': func.numero,
        'cidade': func.cidade,
        'estado': func.estado
    } for func in funcionarios]), 200

# Rota para criar dependente
@api.route('/dependentes', methods=['POST'])
def criar_dependente():
    data = request.get_json()
    try:
        novo_dependente = Dependente(
            associado_id=data['associado_id'],
            nome=data['nome'],
            cpf=data['cpf'],
            data_nascimento=datetime.strptime(data['data_nascimento'], '%Y-%m-%d'),
            grau_parentesco=data['grau_parentesco']
        )
        db.session.add(novo_dependente)
        db.session.commit()
        return jsonify({'message': 'Dependente criado com sucesso', 'id': novo_dependente.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Rota para listar dependentes de um associado
@api.route('/dependentes/<int:associado_id>', methods=['GET'])
def listar_dependentes(associado_id):
    dependentes = Dependente.query.filter_by(associado_id=associado_id).all()
    return jsonify([{
        'id': dep.id,
        'associado_id': dep.associado_id,
        'nome': dep.nome,
        'cpf': dep.cpf,
        'data_nascimento': dep.data_nascimento.strftime('%Y-%m-%d'),
        'grau_parentesco': dep.grau_parentesco
    } for dep in dependentes]), 200