import React, { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { supabase } from '../supabaseClient';

function Associados() {
  const [associados, setAssociados] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    cep: '',
    logradouro: '',
    numero: '',
    cidade: '',
    estado: '',
    numero_titulo: ''
  });
  const [dependenteData, setDependenteData] = useState({
    numero_titulo: '',
    nome: '',
    cpf: '',
    data_nascimento: '',
    grau_parentesco: ''
  });
  const [dependentes, setDependentes] = useState([]);
  const [selectedAssociadoTitulo, setSelectedAssociadoTitulo] = useState(null);
  const [showDependenteForm, setShowDependenteForm] = useState(false);

  useEffect(() => {
    fetchAssociados();
  }, []);

  const fetchAssociados = async () => {
    const { data, error } = await supabase.from('associados').select('*');
    if (error) console.error('Erro ao buscar associados:', error);
    else setAssociados(data || []);
  };

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
    if (formData.cep && !/^\d{5}-\d{3}$/.test(formData.cep)) {
      alert('CEP inválido');
      return;
    }
    if (!/^\d{1,8}$/.test(formData.numero_titulo)) {
      alert('Número do Título inválido. Deve conter até 8 dígitos numéricos.');
      return;
    }
    const { data, error } = await supabase
      .from('associados')
      .insert([formData])
      .select();
    if (error) {
      console.error('Erro ao cadastrar associado:', error);
      alert(`Erro ao cadastrar associado: ${error.message}`);
    } else {
      setAssociados([...associados, data[0]]);
      setFormData({
        nome: '',
        cpf: '',
        data_nascimento: '',
        cep: '',
        logradouro: '',
        numero: '',
        cidade: '',
        estado: '',
        numero_titulo: ''
      });
    }
  };

  const handleDependenteChange = (e) => {
    setDependenteData({ ...dependenteData, [e.target.name]: e.target.value });
  };

  const handleDependenteSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{1,8}$/.test(dependenteData.numero_titulo)) {
      alert('Número do Título inválido. Deve conter até 8 dígitos numéricos.');
      return;
    }
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(dependenteData.cpf)) {
      alert('CPF do dependente inválido');
      return;
    }
    const { data, error } = await supabase
      .from('dependentes')
      .insert([dependenteData])
      .select();
    if (error) alert('Erro ao cadastrar dependente:', error.message);
    else {
      setDependentes([...dependentes, data[0]]);
      setDependenteData({
        numero_titulo: dependenteData.numero_titulo,
        nome: '',
        cpf: '',
        data_nascimento: '',
        grau_parentesco: ''
      });
    }
  };

  const handleSelectAssociado = (numeroTitulo) => {
    setSelectedAssociadoTitulo(numeroTitulo);
    const fetchDependentes = async () => {
      const { data, error } = await supabase
        .from('dependentes')
        .select('*')
        .eq('numero_titulo', numeroTitulo);
      if (error) console.error('Erro ao buscar dependentes:', error);
      else setDependentes(data || []);
    };
    fetchDependentes();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Gerenciar Associados</h1>
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Cadastrar Associado</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
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
            <label className="block text-sm font-medium">Número do Título (até 8 dígitos)</label>
            <IMaskInput
              mask="00000000"
              name="numero_titulo"
              value={formData.numero_titulo}
              onAccept={(value) => setFormData({ ...formData, numero_titulo: value })}
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
      <div className="mb-6 p-4 bg-white rounded shadow">
        <div className="flex justify-center">
          <button
            onClick={() => setShowDependenteForm(!showDependenteForm)}
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {showDependenteForm ? 'Ocultar Cadastro de Dependente' : 'Cadastrar Dependente'}
          </button>
        </div>
        {showDependenteForm && (
          <form onSubmit={handleDependenteSubmit} className="mt-2 space-y-2">
            <div>
              <label className="block text-sm font-medium">Número do Título do Associado (até 8 dígitos)</label>
              <IMaskInput
                mask="00000000"
                name="numero_titulo"
                value={dependenteData.numero_titulo}
                onAccept={(value) => setDependenteData({ ...dependenteData, numero_titulo: value })}
                className="w-full p-1 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input
                type="text"
                name="nome"
                value={dependenteData.nome}
                onChange={handleDependenteChange}
                className="w-full p-1 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">CPF</label>
              <IMaskInput
                mask="000.000.000-00"
                name="cpf"
                value={dependenteData.cpf}
                onAccept={(value) => setDependenteData({ ...dependenteData, cpf: value })}
                className="w-full p-1 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Data de Nascimento</label>
              <input
                type="date"
                name="data_nascimento"
                value={dependenteData.data_nascimento}
                onChange={handleDependenteChange}
                className="w-full p-1 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Grau de Parentesco</label>
              <select
                name="grau_parentesco"
                value={dependenteData.grau_parentesco}
                onChange={handleDependenteChange}
                className="w-full p-1 border rounded"
                required
              >
                <option value="">Selecione</option>
                <option value="Filho">Filho</option>
                <option value="Cônjuge">Cônjuge</option>
                <option value="Pai">Pai</option>
                <option value="Mãe">Mãe</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Cadastrar Dependente
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Lista de Associados</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Número do Título</th>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">CPF</th>
              <th className="p-2 border">Data de Nascimento</th>
              <th className="p-2 border">Endereço</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {associados.map(associado => (
              <tr key={associado.id} className="hover:bg-gray-100">
                <td className="p-2 border">{associado.id}</td>
                <td className="p-2 border">{associado.numero_titulo}</td>
                <td className="p-2 border">{associado.nome}</td>
                <td className="p-2 border">{associado.cpf}</td>
                <td className="p-2 border">{associado.data_nascimento}</td>
                <td className="p-2 border">
                  {associado.cep ? `${associado.logradouro}, ${associado.numero}, ${associado.cidade} - ${associado.estado}` : 'N/A'}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleSelectAssociado(associado.numero_titulo)}
                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Ver Dependentes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedAssociadoTitulo && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Dependentes do Associado (Título: {selectedAssociadoTitulo})</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Número do Título</th>
                <th className="p-2 border">Nome</th>
                <th className="p-2 border">CPF</th>
                <th className="p-2 border">Data de Nascimento</th>
                <th className="p-2 border">Grau de Parentesco</th>
              </tr>
            </thead>
            <tbody>
              {dependentes.map(dependente => (
                <tr key={dependente.id} className="hover:bg-gray-100">
                  <td className="p-2 border">{dependente.id}</td>
                  <td className="p-2 border">{dependente.numero_titulo}</td>
                  <td className="p-2 border">{dependente.nome}</td>
                  <td className="p-2 border">{dependente.cpf}</td>
                  <td className="p-2 border">{dependente.data_nascimento}</td>
                  <td className="p-2 border">{dependente.grau_parentesco}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Associados;