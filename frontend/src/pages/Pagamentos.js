import React, { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { supabase } from '../supabaseClient';

// Componente principal Pagamentos
function Pagamentos() {
  const [associados, setAssociados] = useState([]);
  const [formData, setFormData] = useState({
    numero_titulo: '',
    metodo_pagamento: 'Mensal',
    meses_pagamento: 1
  });
  const [manualFormData, setManualFormData] = useState({
    numero_titulo: '',
    mes_pagamento: '',
    ano_pagamento: '',
    metodo_pagamento: 'Mensal',
    meses_pagamento: 1
  });
  const [checkNumeroTitulo, setCheckNumeroTitulo] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [dependentes, setDependentes] = useState([]);
  const [selectedAssociadoTitulo, setSelectedAssociadoTitulo] = useState(null);

  useEffect(() => {
    fetchAssociados();
  }, []);

  const fetchAssociados = async () => {
    const { data: associadosData, error: associadosError } = await supabase
      .from('associados')
      .select('*');
    if (associadosError) {
      console.error('Erro ao buscar associados:', associadosError);
      return;
    }

    const associadosComPagamentosPendentes = await Promise.all(
      associadosData.map(async (associado) => {
        const { data: pagamentoData, error: pagamentoError } = await supabase
          .from('pagamentos')
          .select('data_pagamento, metodo_pagamento, meses_pagamento, status_pagamento')
          .eq('numero_titulo', associado.numero_titulo)
          .eq('status_pagamento', 'Pendente')
          .order('data_pagamento', { ascending: false })
          .limit(1)
          .single();

        if (pagamentoError || !pagamentoData) {
          return null;
        }

        // Calcular meses pendentes considerando o dia 7 como vencimento
        const hoje = new Date('2025-06-04T10:51:00-03:00');
        const dataPagamento = new Date(pagamentoData.data_pagamento);
        const mesesPagos = pagamentoData.meses_pagamento;
        const dataVencimento = new Date(dataPagamento);
        dataVencimento.setMonth(dataVencimento.getMonth() + mesesPagos);
        dataVencimento.setDate(7); // Ajusta para o dia 7 do mês de vencimento
        if (dataVencimento > hoje) dataVencimento.setMonth(dataVencimento.getMonth() - 1);

        const diffTime = hoje - dataVencimento;
        const mesesPendentes = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30)));

        return {
          ...associado,
          ...pagamentoData,
          meses_pendentes: mesesPendentes,
          status_pagamento_texto: mesesPendentes > 0 ? `Devedor (${mesesPendentes} mês${mesesPendentes === 1 ? '' : 'es'})` : 'Em dia'
        };
      })
    );

    const associadosFiltrados = associadosComPagamentosPendentes.filter(associado => associado !== null);
    setAssociados(associadosFiltrados);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMetodoPagamentoChange = (e) => {
    const metodo = e.target.value;
    setFormData(prevData => {
      let meses = prevData.meses_pagamento;
      if (metodo === 'Personalizado') {
        meses = prevData.meses_pagamento || 1;
      } else if (metodo === 'Mensal') {
        meses = 1;
      } else if (metodo === 'Semestral') {
        meses = 6;
      } else if (metodo === 'Anual') {
        meses = 12;
      }
      return { ...prevData, metodo_pagamento: metodo, meses_pagamento: meses };
    });
  };

  const handleMesesPagamentoChange = (e) => {
    const meses = parseInt(e.target.value) || 1;
    if (meses > 0 && meses <= 12) {
      setFormData({ ...formData, meses_pagamento: meses });
    } else {
      alert('O número de meses deve estar entre 1 e 12.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{1,8}$/.test(formData.numero_titulo)) {
      alert('Número do Título inválido. Deve conter até 8 dígitos numéricos.');
      return;
    }
    const { data: associado, error: associadoError } = await supabase
      .from('associados')
      .select('numero_titulo')
      .eq('numero_titulo', formData.numero_titulo)
      .single();
    if (associadoError || !associado) {
      alert('Número do Título não encontrado. Cadastre o associado primeiro.');
      return;
    }
    const { error } = await supabase
      .from('pagamentos')
      .insert([{ ...formData, status_pagamento: 'Pendente', data_pagamento: new Date().toISOString() }]);
    if (error) alert('Erro ao atualizar pagamento:', error.message);
    else {
      setFormData({ numero_titulo: '', metodo_pagamento: 'Mensal', meses_pagamento: 1 });
      fetchAssociados();
    }
  };

  const handleManualChange = (e) => {
    setManualFormData({ ...manualFormData, [e.target.name]: e.target.value });
  };

  const handleManualMetodoPagamentoChange = (e) => {
    const metodo = e.target.value;
    setManualFormData(prevData => {
      let meses = prevData.meses_pagamento;
      if (metodo === 'Personalizado') {
        meses = prevData.meses_pagamento || 1;
      } else if (metodo === 'Mensal') {
        meses = 1;
      } else if (metodo === 'Semestral') {
        meses = 6;
      } else if (metodo === 'Anual') {
        meses = 12;
      }
      return { ...prevData, metodo_pagamento: metodo, meses_pagamento: meses };
    });
  };

  const handleManualMesesPagamentoChange = (e) => {
    const meses = parseInt(e.target.value) || 1;
    if (meses > 0 && meses <= 12) {
      setManualFormData({ ...manualFormData, meses_pagamento: meses });
    } else {
      alert('O número de meses deve estar entre 1 e 12.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{1,8}$/.test(manualFormData.numero_titulo)) {
      alert('Número do Título inválido. Deve conter até 8 dígitos numéricos.');
      return;
    }
    if (!manualFormData.mes_pagamento || !manualFormData.ano_pagamento) {
      alert('Por favor, informe o mês e ano do último pagamento.');
      return;
    }

    const { data: associado, error: associadoError } = await supabase
      .from('associados')
      .select('numero_titulo')
      .eq('numero_titulo', manualFormData.numero_titulo)
      .single();
    if (associadoError || !associado) {
      alert('Número do Título não encontrado. Cadastre o associado primeiro.');
      return;
    }

    const mesIndex = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ].indexOf(manualFormData.mes_pagamento);
    const dataPagamento = new Date(
      parseInt(manualFormData.ano_pagamento),
      mesIndex,
      7 // Dia 7 como data de pagamento
    ).toISOString();

    const { error } = await supabase
      .from('pagamentos')
      .insert([{
        numero_titulo: manualFormData.numero_titulo,
        data_pagamento: dataPagamento,
        metodo_pagamento: manualFormData.metodo_pagamento,
        meses_pagamento: manualFormData.meses_pagamento,
        status_pagamento: 'Pendente'
      }]);
    if (error) {
      alert('Erro ao registrar pagamento:', error.message);
    } else {
      setManualFormData({
        numero_titulo: '',
        mes_pagamento: '',
        ano_pagamento: '',
        metodo_pagamento: 'Mensal',
        meses_pagamento: 1
      });
      fetchAssociados();
    }
  };

  const handleDarBaixaPagamento = async (numeroTitulo) => {
    const { error } = await supabase
      .from('pagamentos')
      .update({ status_pagamento: 'Pago' })
      .eq('numero_titulo', numeroTitulo)
      .eq('status_pagamento', 'Pendente');
    if (error) alert('Erro ao dar baixa:', error.message);
    else {
      fetchAssociados();
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

  const checkPaymentStatus = async (e) => {
    e.preventDefault();
    if (!/^\d{1,8}$/.test(checkNumeroTitulo)) {
      alert('Número do Título inválido. Deve conter até 8 dígitos numéricos.');
      return;
    }

    const { data: ultimoPagamento, error } = await supabase
      .from('pagamentos')
      .select('data_pagamento, meses_pagamento')
      .eq('numero_titulo', checkNumeroTitulo)
      .order('data_pagamento', { ascending: false })
      .limit(1)
      .single();

    if (error || !ultimoPagamento) {
      setPaymentStatus('Nenhum pagamento registrado para este associado.');
      return;
    }

    const dataPagamento = new Date(ultimoPagamento.data_pagamento);
    const mesesPagos = ultimoPagamento.meses_pagamento;
    const dataVencimento = new Date(dataPagamento);
    dataVencimento.setMonth(dataVencimento.getMonth() + mesesPagos);
    dataVencimento.setDate(7); // Ajusta para o dia 7
    if (dataVencimento > new Date('2025-06-04T10:51:00-03:00')) dataVencimento.setMonth(dataVencimento.getMonth() - 1);

    const hoje = new Date('2025-06-04T10:51:00-03:00');
    if (hoje <= dataVencimento) {
      setPaymentStatus('Pagamento em dia.');
    } else {
      const diffTime = hoje - dataVencimento;
      const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
      setPaymentStatus(`Pagamento atrasado por ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}.`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Gerenciar Pagamentos</h1>

      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Registrar Pagamentos Manualmente</h2>
        <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">Número do Título (até 8 dígitos)</label>
            <IMaskInput
              mask="00000000"
              name="numero_titulo"
              value={manualFormData.numero_titulo}
              onAccept={(value) => setManualFormData({ ...manualFormData, numero_titulo: value })}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Mês do Último Pagamento</label>
            <select
              name="mes_pagamento"
              value={manualFormData.mes_pagamento}
              onChange={handleManualChange}
              className="w-full p-1 border rounded"
              required
            >
              <option value="">Selecione o mês</option>
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(mes => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Ano do Último Pagamento</label>
            <input
              type="number"
              name="ano_pagamento"
              value={manualFormData.ano_pagamento}
              onChange={handleManualChange}
              className="w-full p-1 border rounded"
              placeholder="Ex.: 2025"
              min="2000"
              max="2025"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Método de Pagamento</label>
            <select
              name="metodo_pagamento"
              value={manualFormData.metodo_pagamento}
              onChange={handleManualMetodoPagamentoChange}
              className="w-full p-1 border rounded"
            >
              <option value="Mensal">Mensal</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="Personalizado">Personalizado</option>
            </select>
          </div>
          {manualFormData.metodo_pagamento === 'Personalizado' && (
            <div className="col-span-2">
              <label className="block text-sm font-medium">Quantidade de Meses (1-12)</label>
              <input
                type="number"
                name="meses_pagamento"
                value={manualFormData.meses_pagamento}
                onChange={handleManualMesesPagamentoChange}
                min="1"
                max="12"
                className="w-full p-1 border rounded"
              />
            </div>
          )}
          <div className="col-span-2 flex justify-center">
            <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Registrar Pagamento
            </button>
          </div>
        </form>
      </div>

      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Verificar Status de Pagamento</h2>
        <form onSubmit={checkPaymentStatus} className="grid grid-cols-1 gap-2">
          <div>
            <label className="block text-sm font-medium">Número do Título (até 8 dígitos)</label>
            <IMaskInput
              mask="00000000"
              value={checkNumeroTitulo}
              onAccept={(value) => setCheckNumeroTitulo(value)}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div className="flex justify-center">
            <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Verificar Status
            </button>
          </div>
        </form>
        {paymentStatus && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="text-center">{paymentStatus}</p>
          </div>
        )}
      </div>

      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Atualizar Pagamento</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
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
            <label className="block text-sm font-medium">Método de Pagamento</label>
            <select
              name="metodo_pagamento"
              value={formData.metodo_pagamento}
              onChange={handleMetodoPagamentoChange}
              className="w-full p-1 border rounded"
            >
              <option value="Mensal">Mensal</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="Personalizado">Personalizado</option>
            </select>
          </div>
          {formData.metodo_pagamento === 'Personalizado' && (
            <div className="col-span-2">
              <label className="block text-sm font-medium">Quantidade de Meses (1-12)</label>
              <input
                type="number"
                name="meses_pagamento"
                value={formData.meses_pagamento}
                onChange={handleMesesPagamentoChange}
                min="1"
                max="12"
                className="w-full p-1 border rounded"
              />
            </div>
          )}
          <div className="col-span-2 flex justify-center">
            <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Atualizar Pagamento
            </button>
          </div>
        </form>
      </div>

      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Dar Baixa em Pagamentos</h2>
        {associados.length === 0 ? (
          <p className="text-center">Nenhum pagamento pendente encontrado.</p>
        ) : (
          associados.map(associado => (
            <div key={associado.id} className="p-2 border rounded flex justify-between items-center mb-2">
              <div>
                <p><strong>Número do Título:</strong> {associado.numero_titulo}</p>
                <p><strong>Nome:</strong> {associado.nome}</p>
                <p><strong>Método de Pagamento:</strong> {associado.metodo_pagamento || 'N/A'}</p>
                {(associado.metodo_pagamento === 'Personalizado' || associado.meses_pagamento) && (
                  <p><strong>Meses:</strong> {associado.meses_pagamento || 'N/A'}</p>
                )}
                <p><strong>Status:</strong> {associado.status_pagamento_texto}</p>
              </div>
              {associado.status_pagamento === 'Pendente' && (
                <button
                  onClick={() => handleDarBaixaPagamento(associado.numero_titulo)}
                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Dar Baixa
                </button>
              )}
            </div>
          ))
        )}
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

export default Pagamentos;