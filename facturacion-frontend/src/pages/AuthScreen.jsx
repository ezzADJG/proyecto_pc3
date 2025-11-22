import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { authService } from '../services/apiService';

const AuthScreen = ({ onLogin, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        const res = await authService.register(email, password);
        alert(res.message || 'Registro exitoso, por favor inicia sesión.');
        setIsRegistering(false);
      } else {
        const res = await authService.login(email, password);
        onLogin(res.user);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-4 top-4 text-white/70 hover:text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
            title="Volver al inicio"
          >
            <ArrowLeft size={20}/>
          </button>
          <ShieldCheck className="w-12 h-12 text-white mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
          </h2>
          <p className="text-blue-100 text-sm">FacturaPro Cloud System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16}/> {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="usuario@empresa.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin"/> : (isRegistering ? 'Registrarse' : 'Ingresar')}
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-sm text-blue-600 hover:underline"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;