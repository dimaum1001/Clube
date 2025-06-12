import React, { useState, useEffect, useCallback } from 'react';
import { IMaskInput } from 'react-imask';
import { supabase } from '../supabaseClient';

// Componente principal ConsultarAssociados
function ConsultarAssociados() {
  // Estados para armazenar a lista de associados e os valores dos filtros
  const [associados, setAssociados] = useState([]);
  const [filtroNumeroTitulo, setFiltroNumeroTitulo] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');

  // Função para buscar associados com base nos filtros
  const fetchAssociados = useCallback(async () => {
    let query = supabase.from('associados').select('*');

    // Aplicar filtro por número do título se o campo não estiver vazio
    // Removemos quaisquer zeros à esquerda para corresponder ao valor armazenado no banco
    if (filtroNumeroTitulo) {
      const numeroLimpo = parseInt(filtroNumeroTitulo, 10).toString();
      query = query.eq('numero_titulo', numeroLimpo);
    }

    // Aplicar filtro por CPF se o campo não estiver vazio
    if (filtroCpf) {
      query = query.eq('cpf', filtroCpf);
    }

    // Executar a consulta e calcular a quantidade de dependentes e status de pagamento
    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar associados:', error);
      alert(`Erro ao carregar associados: ${error.message}`);
      return;
    }

    const associadosComDependentesEStatus = await Promise.all(
      data.map(async (associado) => {
        // Contar dependentes
        const { data: dependentesCount, error: countError } = await supabase
          .from('dependentes')
          .select('*', { count: 'exact' })
          .eq('numero_titulo', associado.numero_titulo);
        const quantidadeDependentes = countError ? 0 : dependentesCount.length;

        // Buscar o último pagamento para determinar o status
        const { data: pagamentoData, error: pagamentoError } = await supabase
          .from('pagamentos')
          .select('data_pagamento, meses_pagamento')
          .eq('numero_titulo', associado.numero_titulo)
          .order('data_pagamento', { ascending: false })
          .limit(1)
          .single();

        let statusPagamento = 'Nenhum pagamento registrado';
        if (!pagamentoError && pagamentoData) {
          const dataPagamento = new Date(pagamentoData.data_pagamento);
          const mesesPagos = pagamentoData.meses_pagamento;
          const dataVencimento = new Date(dataPagamento);
          dataVencimento.setMonth(dataVencimento.getMonth() + mesesPagos);
          dataVencimento.setDate(7);
          if (dataVencimento > new Date()) dataVencimento.setMonth(dataVencimento.getMonth() - 1);

          const hoje = new Date();
          const diffTime = hoje - dataVencimento;
          const mesesPendentes = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30)));
          statusPagamento = mesesPendentes > 0 ? `Devedor (${mesesPendentes} mês${mesesPendentes === 1 ? '' : 'es'})` : 'Em dia';
        }

        return {
          ...associado,
          quantidade_dependentes: quantidadeDependentes,
          status_pagamento: statusPagamento
        };
      })
    );

    setAssociados(associadosComDependentesEStatus);
  }, [filtroNumeroTitulo, filtroCpf]);

  // Efeito para buscar associados ao carregar a página ou quando os filtros mudarem
  useEffect(() => {
    // Adicionando um debounce para evitar chamadas excessivas ao backend
    const timer = setTimeout(() => {
      fetchAssociados();
    }, 500); // Atraso de 500ms

    // Limpar o timer ao desmontar o componente ou quando os filtros mudarem
    return () => clearTimeout(timer);
  }, [fetchAssociados]);

  // Manipuladores de mudança para os campos de filtro
  const handleFiltroNumeroTituloChange = (value) => {
    setFiltroNumeroTitulo(value);
  };

  const handleFiltroCpfChange = (value) => {
    setFiltroCpf(value);
  };

  return (
    <div>
      {/* Título principal da página */}
      <h1 className="text-3xl font-bold mb-4">Consultar Associados</h1>
      {/* Seção de filtros */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Filtros</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Campo de filtro para Número do Título */}
          <div>
            <label className="block text-sm font-medium">Número do Título</label>
            <IMaskInput
              mask={[{ mask: '00000000', maxLength: 8 }]} // Aceita até 8 dígitos
              value={filtroNumeroTitulo}
              onAccept={handleFiltroNumeroTituloChange}
              className="w-full p-1 border rounded"
              placeholder="Digite o número do título"
              unmask={true} // Garante que o valor retornado seja apenas os dígitos
            />
          </div>
          {/* Campo de filtro para CPF */}
          <div>
            <label className="block text-sm font-medium">CPF</label>
            <IMaskInput
              mask="000.000.000-00"
              value={filtroCpf}
              onAccept={handleFiltroCpfChange}
              className="w-full p-1 border rounded"
              placeholder="Digite o CPF"
            />
          </div>
        </div>
      </div>
      {/* Tabela de associados */}
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
              <th className="p-2 border">Status de Pagamento</th>
              <th className="p-2 border">Quantidade de Dependentes</th>
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
                <td className="p-2 border">{associado.status_pagamento}</td>
                <td className="p-2 border">{associado.quantidade_dependentes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {associados.length === 0 && (
          <p className="mt-4 text-center">Nenhum associado encontrado com os filtros aplicados.</p>
        )}
      </div>
    </div>
  );
}

export default ConsultarAssociados;