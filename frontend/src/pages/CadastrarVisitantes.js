import React, { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { supabase } from '../supabaseClient';

function CadastrarVisitantes() {
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    cpf: '',
    cep: '',
    logradouro: '',
    numero: '',
    cidade: '',
    estado: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMaskedChange = (name) => (value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchAddressByCep = async (cep) => {
    if (!cep || cep.length !== 9 || !/^\d{5}-\d{3}$/.test(cep)) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
          numero: prev.numero || '' // Mantém o número manual se já preenchido
        }));
      } else {
        setMessage('CEP não encontrado.');
      }
    } catch (error) {
      setMessage('Erro ao buscar o endereço.');
      console.error('Erro na API de CEP:', error);
    }
  };

  useEffect(() => {
    if (formData.cep.length === 9) {
      fetchAddressByCep(formData.cep);
    }
  }, [formData.cep]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.cpf) {
      setMessage('Nome e CPF são obrigatórios.');
      return;
    }
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      setMessage('CPF inválido. Use o formato 000.000.000-00.');
      return;
    }

    const { error } = await supabase
      .from('visitantes')
      .insert([{ 
        nome: formData.nome, 
        endereco: `${formData.logradouro}, ${formData.numero}, ${formData.cidade} - ${formData.estado}`, 
        telefone: formData.telefone, 
        cpf: formData.cpf, 
        cep: formData.cep 
      }]);
    if (error) {
      setMessage(`Erro ao cadastrar visitante: ${error.message}`);
    } else {
      setMessage('Visitante cadastrado com sucesso!');
      setFormData({
        nome: '',
        endereco: '',
        telefone: '',
        cpf: '',
        cep: '',
        logradouro: '',
        numero: '',
        cidade: '',
        estado: ''
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Cadastrar Visitantes</h1>
      <div className="mb-6 p-4 bg-white rounded shadow">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium">Endereço</label>
            <input
              type="text"
              name="endereco"
              value={`${formData.logradouro}, ${formData.numero}, ${formData.cidade} - ${formData.estado}`}
              onChange={handleChange}
              className="w-full p-1 border rounded"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Telefone</label>
            <IMaskInput
              mask="(00) 00000-0000"
              value={formData.telefone}
              onAccept={handleMaskedChange('telefone')}
              className="w-full p-1 border rounded"
              placeholder="(DD) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">CPF</label>
            <IMaskInput
              mask="000.000.000-00"
              value={formData.cpf}
              onAccept={handleMaskedChange('cpf')}
              className="w-full p-1 border rounded"
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">CEP</label>
            <IMaskInput
              mask="00000-000"
              value={formData.cep}
              onAccept={handleMaskedChange('cep')}
              className="w-full p-1 border rounded"
              placeholder="00000-000"
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
          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cadastrar Visitante
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}

export default CadastrarVisitantes;