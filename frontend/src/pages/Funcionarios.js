import React, { useState } from 'react';
import { IMaskInput } from 'react-imask';
import { supabase } from '../supabaseClient';

function Funcionarios() {
  const [formData, setFormData] = useState({
    numero_matricula: '',
    nome: '',
    cpf: '',
    data_nascimento: '',
    cargo: '',
    cep: '',
    logradouro: '',
    numero: '',
    cidade: '',
    estado: '',
    data_admissao: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, cep: e.target.value });
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData({
            ...formData,
            cep: e.target.value,
            logradouro: data.logradouro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          });
        } else {
          alert('CEP inválido ou não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Verifique sua conexão ou tente novamente.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert('O campo Nome é obrigatório.');
      return;
    }
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      alert('CPF inválido');
      return;
    }
    if (!formData.data_nascimento) {
      alert('O campo Data de Nascimento é obrigatório.');
      return;
    }
    if (!formData.data_admissao) {
      alert('O campo Data de Admissão é obrigatório.');
      return;
    }
    if (!/^\d{1,8}$/.test(formData.numero_matricula)) {
      alert('Número de Matrícula inválido. Deve conter até 8 dígitos numéricos.');
      return;
    }
    if (formData.cep && !/^\d{5}-\d{3}$/.test(formData.cep)) {
      alert('CEP inválido');
      return;
    }
    const { data, error } = await supabase
      .from('funcionarios')
      .insert([formData])
      .select();
    if (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      alert(`Erro ao cadastrar funcionário: ${error.message}`);
    } else {
      setFormData({
        numero_matricula: '',
        nome: '',
        cpf: '',
        data_nascimento: '',
        cargo: '',
        cep: '',
        logradouro: '',
        numero: '',
        cidade: '',
        estado: '',
        data_admissao: ''
      });
      alert('Funcionário cadastrado com sucesso!');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Cadastrar Funcionário</h1>
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Formulário de Cadastro</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">Número de Matrícula (até 8 dígitos)</label>
            <IMaskInput
              mask="00000000"
              name="numero_matricula"
              value={formData.numero_matricula}
              onAccept={(value) => setFormData({ ...formData, numero_matricula: value })}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">CPF</label>
            <IMaskInput
              mask="000.000.000-00"
              name="cpf"
              value={formData.cpf}
              onAccept={(value) => setFormData({ ...formData, cpf: value })}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Data de Nascimento</label>
            <input
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Cargo</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Data de Admissão</label>
            <input
              type="date"
              name="data_admissao"
              value={formData.data_admissao}
              onChange={handleChange}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">CEP</label>
            <IMaskInput
              mask="00000-000"
              name="cep"
              value={formData.cep}
              onAccept={(value) => {
                setFormData({ ...formData, cep: value });
                handleCepChange({ target: { value } });
              }}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Logradouro</label>
            <input
              type="text"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Número</label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Cidade</label>
            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Estado</label>
            <input
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full p-1 border rounded"
              maxLength="2"
            />
          </div>
          <div className="col-span-2 flex justify-center">
            <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Funcionarios;