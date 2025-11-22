import React from 'react';
import { ShieldCheck } from 'lucide-react';

const LandingPage = ({ onLoginClick }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white flex flex-col">
    <nav className="container mx-auto p-6 flex justify-between items-center animate-in slide-in-from-top duration-500">
      <div className="text-2xl font-bold flex items-center gap-2">
        <ShieldCheck className="text-blue-400" /> FacturaPro Cloud
      </div>
      <button 
        onClick={onLoginClick}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
      >
        Ingresar al Sistema
      </button>
    </nav>

    <main className="flex-1 container mx-auto flex flex-col md:flex-row items-center p-6 gap-12">
      <div className="md:w-1/2 space-y-6 animate-in slide-in-from-left duration-700">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Tu negocio, <span className="text-blue-400">bajo control</span>
        </h1>
        <p className="text-xl text-slate-300">
          Sistema integral de facturación electrónica y control de inventario. 
          Gestiona ventas, stock y clientes en una sola plataforma segura.
        </p>
        <div className="flex gap-4 pt-4">
          <button onClick={onLoginClick} className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors">
            Comenzar Ahora
          </button>
        </div>
      </div>
      <div className="md:w-1/2 bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-right duration-700">
        <div className="space-y-4 opacity-80">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">FP</div>
            <div>
              <div className="h-4 w-32 bg-slate-500 rounded mb-2"></div>
              <div className="h-3 w-20 bg-slate-600 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-24 bg-slate-700/50 rounded-xl border border-white/5"></div>
            <div className="h-24 bg-slate-700/50 rounded-xl border border-white/5"></div>
          </div>
          <div className="h-32 bg-slate-700/50 rounded-xl border border-white/5"></div>
        </div>
      </div>
    </main>
    
    <footer className="bg-slate-900/50 p-6 text-center text-slate-500 backdrop-blur-sm">
      © 2024 FacturaPro Cloud. Todos los derechos reservados.
    </footer>
  </div>
);

export default LandingPage;