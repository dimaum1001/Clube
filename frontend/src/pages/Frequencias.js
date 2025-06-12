import React, { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { supabase } from '../supabaseClient';

function Frequencias() {
  const [frequencias, setFrequencias] = useState([]);
  const [formData, setFormData] = useState({
    numero_titulo: ''
  });

  useEffect(() => {
    fetchFrequencias();
  }, []);

  const fetchFrequencias = async () => {
    const { data, error } = await supabase
      .from('frequencias')
      .select('*')
      .order('data_entrada', { ascending: false });
    if (error) console.error('Erro ao buscar frequências:', error);
    else {
      const frequenciasComStatus = await Promise.all(
        data.map(async (frequencia) => {
          const { data: pagamentoData, error: pagamentoError } = await supabase
            .from('pagamentos')
            .select('data_pagamento, meses_pagamento')
            .eq('numero_titulo', frequencia.numero_titulo)
            .order('data_pagamento', { ascending: false })
            .limit(1)
            .single();

          if (pagamentoError || !pagamentoData) {
            return { ...frequencia, status_pagamento: 'Nenhum pagamento registrado' };
          }

          const dataPagamento = new Date(pagamentoData.data_pagamento);
          const mesesPagos = pagamentoData.meses_pagamento;
          const dataVencimento = new Date(dataPagamento);
          dataVencimento.setMonth(dataVencimento.getMonth() + mesesPagos);
          dataVencimento.setDate(7);
          if (dataVencimento > new Date()) dataVencimento.setMonth(dataVencimento.getMonth() - 1);

          const hoje = new Date();
          const diffTime = hoje - dataVencimento;
          const mesesPendentes = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30)));
          return {
            ...frequencia,
            status_pagamento: mesesPendentes > 0 ? `Devedor (${mesesPendentes} mês${mesesPendentes === 1 ? '' : 'es'})` : 'Em dia'
          };
        })
      );
      setFrequencias(frequenciasComStatus || []);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{1,8}$/.test(formData.numero_titulo)) {
      alert('Número do Título inválido. Deve conter até 8 dígitos numéricos.');
      return;
    }
    const data_entrada = getCurrentDateTime();
    const { error } = await supabase
      .from('frequencias')
      .insert([{ ...formData, data_entrada }]);
    if (error) alert('Erro ao registrar entrada:', error.message);
    else {
      setFormData({ numero_titulo: '' });
      fetchFrequencias();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Registrar Frequências</h1>
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Registrar Entrada</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
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
          <div className="flex justify-center">
            <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Registrar Entrada
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Histórico de Frequências</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Número do Título</th>
              <th className="p-2 border">Data de Entrada</th>
              <th className="p-2 border">Status de Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {frequencias.map(frequencia => (
              <tr key={frequencia.id} className="hover:bg-gray-100">
                <td className="p-2 border">{frequencia.id}</td>
                <td className="p-2 border">{frequencia.numero_titulo}</td>
                <td className="p-2 border">{frequencia.data_entrada}</td>
                <td className="p-2 border">{frequencia.status_pagamento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Frequencias;