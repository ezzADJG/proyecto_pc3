import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <--- CORRECCIÓN 1: Importar así

export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  
  // Colores y Estilos
  const companyColor = [41, 128, 185];
  
  // Encabezado
  doc.setFontSize(20);
  doc.setTextColor(...companyColor);
  doc.text("FacturaPro Cloud", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("RUC: 20123456789", 14, 28);
  doc.text("Dirección: Av. Siempre Viva 123, Ica", 14, 32);
  
  // Cuadro del Documento
  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(140, 10, 60, 25, 2, 2, 'FD');
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`R.U.C. 20123456789`, 170, 18, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoice_type || "BOLETA", 170, 25, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const serie = invoice.series || (invoice.invoice_type === 'FACTURA' ? 'F001' : 'B001');
  const numero = invoice.number || String(Math.floor(Math.random() * 10000)).padStart(8, '0'); 
  doc.text(`${serie} - ${numero}`, 170, 31, { align: 'center' });

  // Datos del Cliente
  doc.setFontSize(10);
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 14, 45);
  doc.text(`Cliente: ${invoice.customer_name || 'Cliente General'}`, 14, 50);
  doc.text(`Documento: ${invoice.customer_document || '---'}`, 14, 55);
  
  const isUsd = invoice.currency === 'USD';
  const currencySymbol = isUsd ? '$' : 'S/';
  
  if (invoice.currency) {
    doc.text(`Moneda: ${isUsd ? 'Dólares Americanos' : 'Soles'}`, 14, 60);
  }

  // Tabla de Productos
  const tableColumn = ["Código", "Descripción", "Cant.", "P. Unit", "Total"];
  const tableRows = [];

  // <--- CORRECCIÓN 2: Validación segura (invoice.items || [])
  const items = invoice.items || []; 
  
  items.forEach(item => {
    const itemData = [
      item.code || '---',
      item.name || 'Producto',
      item.quantity || 0,
      `${currencySymbol} ${Number(item.price || 0).toFixed(2)}`,
      `${currencySymbol} ${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}`
    ];
    tableRows.push(itemData);
  });

  // <--- CORRECCIÓN 3: Usar autoTable(doc, options) en lugar de doc.autoTable
  autoTable(doc, {
    startY: 65,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: companyColor },
  });

  // Totales
  // Usamos doc.lastAutoTable.finalY para saber dónde terminó la tabla
  const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 70) + 10;
  
  doc.setFontSize(10);
  const total = Number(invoice.total || 0);
  
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`${currencySymbol} ${(total / 1.18).toFixed(2)}`, 190, finalY, { align: 'right' });
  
  doc.text(`IGV (18%):`, 140, finalY + 5);
  doc.text(`${currencySymbol} ${(total - (total / 1.18)).toFixed(2)}`, 190, finalY + 5, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL A PAGAR:`, 140, finalY + 12);
  doc.text(`${currencySymbol} ${total.toFixed(2)}`, 190, finalY + 12, { align: 'right' });

  // Guardar PDF
  doc.save(`${invoice.invoice_type || 'DOC'}_${serie}-${numero}.pdf`);
};