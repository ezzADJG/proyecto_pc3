import React, { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { invoiceService } from '../services/apiService'; // Importamos el servicio
import { generateInvoicePDF } from '../utils/pdfGenerator';

const History = ({ invoices }) => {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (id) => {
    setDownloadingId(id); 
    try {
      // 1. Pedimos la factura "cruda" al backend
      const fullInvoice = await invoiceService.getById(id);

      if (fullInvoice.items) {
        fullInvoice.items = fullInvoice.items.map(item => ({
          ...item, 
          code: item.product_code || item.code, 
          name: item.product_name || item.name, 
          price: Number(item.unit_price) || Number(item.price),
          quantity: Number(item.quantity)
        }));
      }
      // --------------------------------------------------

      // 2. Ahora enviamos los datos corregidos al PDF
      generateInvoicePDF(fullInvoice);

    } catch (error) {
      console.error("Error cargando factura:", error);
      alert("No se pudo descargar la factura. Verifica que el backend esté funcionando.");
    } finally {
      setDownloadingId(null); 
    }
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Historial de Ventas</h2>
      <div className="flex-1 bg-white rounded-xl border overflow-auto shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-4">Fecha</th>
              <th className="p-4">Documento</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Tipo</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-600">{new Date(inv.created_at || Date.now()).toLocaleDateString()}</td>
                <td className="p-4 font-mono text-sm">{inv.series || 'F001'} - {inv.number || '---'}</td>
                <td className="p-4 font-medium">{inv.customer_name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${inv.invoice_type === 'FACTURA' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {inv.invoice_type}
                  </span>
                </td>
                <td className="p-4 text-right font-bold">
                   {inv.currency === 'USD' ? '$' : 'S/'} {Number(inv.total).toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleDownload(inv.id)}
                    disabled={downloadingId === inv.id}
                    className="text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                    title="Descargar PDF"
                  >
                    {downloadingId === inv.id ? <Loader2 className="animate-spin" size={18}/> : <Download size={18} />}
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay facturas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;