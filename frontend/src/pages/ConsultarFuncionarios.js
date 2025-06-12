import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Componente principal ConsultarFuncionarios
function ConsultarFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');

  useEffect(() => {
    fetchFuncionarios();
  }, [filtroNome, filtroCpf]);

  const fetchFuncionarios = async () => {
    let query = supabase.from('funcionarios').select('*');

    if (filtroNome) {
      query = query.ilike('nome', `%${filtroNome}%`);
    }

    if (filtroCpf) {
      query = query.eq('cpf', filtroCpf);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar funcionários:', error);
      alert(`Erro ao carregar funcionários: ${error.message}`);
    } else {
      setFuncionarios(data || []);
    }
  };

  const handleFiltroNomeChange = (e) => {
    setFiltroNome(e.target.value);
  };

  const handleFiltroCpfChange = (e) => {
    setFiltroCpf(e.target.value);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Consultar Funcionários</h1>
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Filtros</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input
              type="text"
              value={filtroNome}
              onChange={handleFiltroNomeChange}
              className="w-full p-1 border rounded"
              placeholder="Digite o nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">CPF</label>
            <input
              type="text"
              value={filtroCpf}
              onChange={handleFiltroCpfChange}
              className="w-full p-1 border rounded"
              placeholder="Digite o CPF"
            />
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Lista de Funcionários</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">CPF</th>
              <th className="p-2 border">Cargo</th>
              <th className="p-2 border">Data de Admissão</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(funcionario => (
              <tr key={funcionario.id} className="hover:bg-gray-100">
                <td className="p-2 border">{funcionario.id}</td>
                <td className="p-2 border">{funcionario.nome}</td>
                <td className="p-2 border">{funcionario.cpf}</td>
                <td className="p-2 border">{funcionario.cargo || 'N/A'}</td>
                <td className="p-2 border">{funcionario.data_admissao || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {funcionarios.length === 0 && (
          <p className="mt-4 text-center">Nenhum funcionário encontrado com os filtros aplicados.</p>
        )}
      </div>
    </div>
  );
}

export default ConsultarFuncionarios;