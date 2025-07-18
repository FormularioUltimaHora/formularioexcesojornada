
import React, { useState, useEffect } from 'react';
import { FormA } from './components/FormA';
import { FormB } from './components/FormB';
import { AdminPage } from './components/AdminPage';
import { LoginPage } from './components/LoginPage';
import { Instructions } from './components/common/Instructions';
import { GeminiIcon } from './components/icons/GeminiIcon';
import { ArchiveBoxIcon } from './components/icons/ArchiveBoxIcon';

type FormVersion = 'A' | 'B';
type View = 'forms' | 'login' | 'admin';

const App: React.FC = () => {
  const [version, setVersion] = useState<FormVersion>('A');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<View>('forms');

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isAdminAuthenticated');
    if (loggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAdminAuthenticated', 'true');
    setView('admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAdminAuthenticated');
    setView('forms');
  };

  const renderForm = () => {
    if (version === 'A') {
      return <FormA />;
    }
    return <FormB />;
  };

  const getButtonClass = (v: FormVersion) => {
    return `px-4 py-2 sm:px-6 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
      version === v
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'bg-white text-slate-700 hover:bg-slate-200'
    }`;
  };
  
  const getHeaderText = () => {
      if (view === 'admin') return 'Panel de Administración';
      if (view === 'login') return 'Acceso de Administrador';
      return 'Registro de Incidencias';
  }
  
  const getHeaderSubtext = () => {
      if (view === 'admin') return 'Aquí se muestran todos los registros de incidencias que han sido guardados en este dispositivo.';
      if (view === 'login') return 'Esta sección es solo para personal autorizado.';
      // Subtitle for forms view removed as per request.
      return '';
  }

  const mainContent = () => {
    switch (view) {
        case 'forms':
            return (
                <>
                    <div className="flex justify-center mb-8">
                        <div className="flex space-x-2 bg-slate-200/80 p-1.5 rounded-full shadow-inner-custom">
                            <button onClick={() => setVersion('A')} className={getButtonClass('A')}>
                                Versión A: Clásica
                            </button>
                            <button onClick={() => setVersion('B')} className={getButtonClass('B')}>
                                Versión B: Asistente
                            </button>
                        </div>
                    </div>
                    {renderForm()}
                    <Instructions />
                </>
            );
        case 'login':
            return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setView('forms')} />;
        case 'admin':
            return isAuthenticated ? (
                <AdminPage onBack={() => setView('forms')} onLogout={handleLogout} />
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setView('forms')} />
            );
        default:
            return renderForm();
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
             <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-left">
              {getHeaderText()}
            </h1>
            {view === 'forms' && (
               <button onClick={() => setView(isAuthenticated ? 'admin' : 'login')} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200 transition-colors">
                  <ArchiveBoxIcon className="w-5 h-5" />
                  <span>Ver Registros</span>
              </button>
            )}
          </div>
            { getHeaderSubtext() && (
              <p className="mt-3 text-slate-600">
               {getHeaderSubtext()}
              </p>
            )}
        </header>

        <main>
            {mainContent()}
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Diseñado para una evaluación comparativa de la experiencia de usuario.</p>
             <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 hover:text-indigo-600 transition-colors">
                <GeminiIcon className="w-5 h-5" />
                <span>Powered by Gemini</span>
            </a>
        </footer>
      </div>
    </div>
  );
};

export default App;
