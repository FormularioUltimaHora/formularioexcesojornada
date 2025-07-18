
import React, { useState } from 'react';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setError('');
      onLoginSuccess();
    } else {
      setError('ID de usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
      <div className="flex flex-col items-center mb-6">
        <LockClosedIcon className="w-12 h-12 text-indigo-600 mb-3" />
        <h2 className="text-2xl font-bold text-slate-900">Acceso de Administrador</h2>
        <p className="text-slate-500 mt-1">Introduzca sus credenciales para continuar.</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium leading-6 text-slate-700">
            ID de Usuario
          </label>
          <div className="mt-2">
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-700">
            Contraseña
          </label>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <div className="flex items-center justify-between gap-4 pt-2">
           <button
            type="button"
            onClick={onBack}
            className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            Volver
          </button>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
  );
};
