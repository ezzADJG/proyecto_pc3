import React from 'react';
import { DollarSign, FileText, Package } from 'lucide-react';

const StatCard = ({ icon, color, label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 bg-${color}-100 rounded-lg text-${color}-600`}>{icon}</div>
    <div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold">{value}</p></div>
  </div>
);

const Dashboard = ({ stats, invoices }) => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<DollarSign size={32}/>} color="green" label="Ventas Totales" value={`S/ ${Number(stats.totalSales || 0).toFixed(2)}`} />
        <StatCard icon={<FileText size={32}/>} color="blue" label="Facturas Emitidas" value={stats.invoicesCount || 0} />
        <StatCard icon={<Package size={32}/>} color="orange" label="Productos Activos" value={stats.productsCount || 0} />
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Últimas Ventas</h3>
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Cliente</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map(inv => (
                <tr key={inv.id} className="border-b border-gray-50">
                  <td className="py-3">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="py-3">{inv.customer_name}</td>
                  <td className="py-3 text-right">S/ {Number(inv.total).toFixed(2)}</td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-gray-400">Sin movimientos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;