import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Associados from './pages/Associados';
import Pagamentos from './pages/Pagamentos';
import Frequencias from './pages/Frequencias';
import Funcionarios from './pages/Funcionarios';
import ConsultarAssociados from './pages/ConsultarAssociados';
import ConsultarFuncionarios from './pages/ConsultarFuncionarios';
import CadastrarVisitantes from './pages/CadastrarVisitantes';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [associadosMenuOpen, setAssociadosMenuOpen] = useState(false);
  const [funcionariosMenuOpen, setFuncionariosMenuOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-gray-800 text-white p-4`}>
          <h2 className="text-2xl font-bold mb-6">Clube de Campo</h2>
          <nav>
            <ul>
              {session && (
                <>
                  <li className="mb-2">
                    <Link
                      to="/dashboard"
                      className="block p-2 hover:bg-gray-700 rounded"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li className="mb-2">
                    <button
                      onClick={() => setAssociadosMenuOpen(!associadosMenuOpen)}
                      className="block p-2 hover:bg-gray-700 rounded w-full text-left"
                    >
                      Associados
                    </button>
                    {associadosMenuOpen && (
                      <ul className="ml-4 mt-1">
                        <li className="mb-2">
                          <Link
                            to="/associados"
                            className="block p-2 hover:bg-gray-700 rounded"
                            onClick={() => setSidebarOpen(false)}
                          >
                            Cadastrar Associado
                          </Link>
                        </li>
                        <li className="mb-2">
                          <Link
                            to="/consultar-associados"
                            className="block p-2 hover:bg-gray-700 rounded"
                            onClick={() => setSidebarOpen(false)}
                          >
                            Consultar Associados
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/pagamentos"
                      className="block p-2 hover:bg-gray-700 rounded"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Pagamentos
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/frequencias"
                      className="block p-2 hover:bg-gray-700 rounded"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Frequências
                    </Link>
                  </li>
                  <li className="mb-2">
                    <button
                      onClick={() => setFuncionariosMenuOpen(!funcionariosMenuOpen)}
                      className="block p-2 hover:bg-gray-700 rounded w-full text-left"
                    >
                      Funcionários
                    </button>
                    {funcionariosMenuOpen && (
                      <ul className="ml-4 mt-1">
                        <li className="mb-2">
                          <Link
                            to="/funcionarios"
                            className="block p-2 hover:bg-gray-700 rounded"
                            onClick={() => setSidebarOpen(false)}
                          >
                            Cadastrar Funcionário
                          </Link>
                        </li>
                        <li className="mb-2">
                          <Link
                            to="/consultar-funcionarios"
                            className="block p-2 hover:bg-gray-700 rounded"
                            onClick={() => setSidebarOpen(false)}
                          >
                            Consultar Funcionários
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/cadastrar-visitantes"
                      className="block p-2 hover:bg-gray-700 rounded"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Cadastrar Visitantes
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-6">
          <button
            className="md:hidden p-2 bg-gray-800 text-white rounded mb-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            Menu
          </button>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/associados"
              element={
                <ProtectedRoute>
                  <Associados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultar-associados"
              element={
                <ProtectedRoute>
                  <ConsultarAssociados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pagamentos"
              element={
                <ProtectedRoute>
                  <Pagamentos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/frequencias"
              element={
                <ProtectedRoute>
                  <Frequencias />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funcionarios"
              element={
                <ProtectedRoute>
                  <Funcionarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultar-funcionarios"
              element={
                <ProtectedRoute>
                  <ConsultarFuncionarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cadastrar-visitantes"
              element={
                <ProtectedRoute>
                  <CadastrarVisitantes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;