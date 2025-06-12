import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Dashboard() {
  const [stats, setStats] = useState({
    totalAssociados: 0,
    frequenciasHoje: 0,
    pagamentosPendentes: 0,
  });
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      // Total de associados
      const { data: associados, error: associadosError } = await supabase
        .from('associados')
        .select('*', { count: 'exact' });
      if (!associadosError) {
        setStats(prev => ({ ...prev, totalAssociados: associados.length }));
      }

      // Frequências de hoje usando SQL raw para converter e filtrar
      const hoje = new Date().toLocaleDateString('pt-BR'); // Formato: DD/MM/YYYY
      const { count: frequenciasCount, error: frequenciasError } = await supabase
        .rpc('count_frequencias_hoje', { data_hoje: hoje });
      if (!frequenciasError) {
        setStats(prev => ({ ...prev, frequenciasHoje: frequenciasCount || 0 }));
      } else {
        console.error('Erro ao buscar frequências:', frequenciasError);
        // Fallback para contagem manual se RPC falhar
        const { data: frequenciasFallback, error: fallbackError } = await supabase
          .from('frequencias')
          .select('*', { count: 'exact' })
          .ilike('data_entrada', `${hoje}%`);
        if (!fallbackError) {
          setStats(prev => ({ ...prev, frequenciasHoje: frequenciasFallback.length }));
        } else {
          console.error('Erro no fallback:', fallbackError);
        }
      }

      // Pagamentos pendentes
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('status_pagamento', 'Pendente');
      if (!pagamentosError) {
        setStats(prev => ({ ...prev, pagamentosPendentes: pagamentos.length }));
      }
    };

    fetchStats();

    // Atualizar data e hora a cada segundo
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Painel Principal - Clube de Campo</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card de Total de Associados */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total de Associados</h2>
          <p className="text-2xl mt-2">{stats.totalAssociados}</p>
          <Link to="/consultar-associados" className="text-blue-600 hover:underline mt-2 block">
            Ver detalhes
          </Link>
        </div>
        {/* Card de Frequências Hoje */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Frequências Hoje</h2>
          <p className="text-2xl mt-2">{stats.frequenciasHoje}</p>
          <Link to="/frequencias" className="text-blue-600 hover:underline mt-2 block">
            Ver detalhes
          </Link>
        </div>
        {/* Card de Pagamentos Pendentes */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Pagamentos Pendentes</h2>
          <p className="text-2xl mt-2">{stats.pagamentosPendentes}</p>
          <Link to="/pagamentos" className="text-blue-600 hover:underline mt-2 block">
            Ver detalhes
          </Link>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold">Data e Hora Atual</h2>
        <p className="text-xl mt-2">
          {currentDateTime.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false,
          })}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;