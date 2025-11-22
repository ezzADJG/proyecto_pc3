import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  FileText,
} from "lucide-react";
import {
  authService,
  productService,
  invoiceService,
  dashboardService,
} from "./services/apiService";

// Importamos las vistas separadas
import LandingPage from "./pages/LandingPage";
import AuthScreen from "./pages/AuthScreen";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import History from "./pages/History";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState("dashboard");
  const [showLogin, setShowLogin] = useState(false);

  // Estado global de datos
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    invoicesCount: 0,
    productsCount: 0,
  });

  // Cargar datos si hay usuario
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/immutability
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    try {
      const [prods, invs, dashboard] = await Promise.all([
        productService.getAll(),
        invoiceService.getAll(),
        dashboardService.getStats(),
      ]);
      setProducts(prods);
      setInvoices(invs);
      setStats(dashboard);
    } catch (e) {
      console.error("Error refrescando datos", e);
      // Si falla la autorización, salir
      if (e.response?.status === 401) handleLogout();
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView("dashboard"); // Reset view
  };

  // --- RENDERIZADO CONDICIONAL ---

  if (!user) {
    return (
      <>
        <LandingPage onLoginClick={() => setShowLogin(true)} />
        {showLogin && (
          <AuthScreen
            onLogin={(userData) => {
              setUser(userData);
              setShowLogin(false);
            }}
            onBack={() => setShowLogin(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-2xl">
        <div className="p-6 flex items-center gap-2 text-xl font-bold border-b border-slate-800">
          <ShieldCheck className="text-blue-400" /> FacturaPro
        </div>
        <div className="p-4 space-y-2">
          <div className="bg-slate-800 rounded-lg p-3 mb-6 flex items-center gap-3">
            <div className="bg-blue-500 rounded-full p-2">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setView("dashboard")}
            className={`w-full flex gap-3 px-4 py-3 rounded-lg ${
              view === "dashboard"
                ? "bg-blue-600"
                : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <LayoutDashboard size={20} /> Panel
          </button>
          <button
            onClick={() => setView("billing")}
            className={`w-full flex gap-3 px-4 py-3 rounded-lg ${
              view === "billing"
                ? "bg-blue-600"
                : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <ShoppingCart size={20} /> Venta
          </button>
          <button
            onClick={() => setView("inventory")}
            className={`w-full flex gap-3 px-4 py-3 rounded-lg ${
              view === "inventory"
                ? "bg-blue-600"
                : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <Package size={20} /> Inventario
          </button>
          <button
            onClick={() => setView("history")}
            className={`w-full flex gap-3 px-4 py-3 rounded-lg ${
              view === "history"
                ? "bg-blue-600"
                : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <FileText size={20} /> Historial
          </button>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex gap-2 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg"
          >
            <LogOut size={20} /> Salir
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden relative">
        {view === "dashboard" && (
          <Dashboard stats={stats} invoices={invoices} />
        )}
        {view === "inventory" && (
          <Inventory products={products} onRefresh={refreshData} />
        )}
        {view === "billing" && (
          <Billing
            products={products}
            invoicesCount={invoices.length}
            onRefresh={refreshData}
          />
        )}
        {view === "history" && <History invoices={invoices} />}
      </main>
    </div>
  );
}
