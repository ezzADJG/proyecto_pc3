import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Search, Printer, RefreshCw } from 'lucide-react'; // Printer icon
import { externalService, invoiceService } from '../services/apiService';
import { generateInvoicePDF } from '../utils/pdfGenerator'; // <--- Importamos

const Billing = ({ products, onRefresh }) => {
  const [cart, setCart] = useState([]);
  const [docType, setDocType] = useState('BOLETA');
  const [docNum, setDocNum] = useState('');
  const [clientName, setClientName] = useState('');
  const [loadingApi, setLoadingApi] = useState(false);
  
  // --- NUEVO: Estados para moneda ---
  const [exchangeRate, setExchangeRate] = useState(3.75);
  const [currency, setCurrency] = useState('PEN'); // 'PEN' o 'USD'

  useEffect(() => {
    externalService.getExchangeRate()
      .then(data => {
        if(data.precioVenta) setExchangeRate(data.precioVenta);
      })
      .catch(err => console.log("Error TC", err));
  }, []);

  // Función auxiliar para convertir precios
  const getPrice = (priceInSoles) => {
    if (currency === 'USD') return priceInSoles / exchangeRate;
    return priceInSoles;
  };

  const searchClient = async () => {
    if (!docNum) return;
    setLoadingApi(true);
    try {
      let data;
      if (docNum.length === 11) {
        data = await externalService.getRuc(docNum);
        setClientName(data.razon_social || '');
      } else {
        data = await externalService.getDni(docNum);
        // Usamos la corrección que hicimos antes
        setClientName(data.first_name ? `${data.first_name} ${data.first_last_name} ${data.second_last_name}` : '');
      }
      if (!data) alert("No encontrado");
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      alert("Error al consultar documento");
    } finally {
      setLoadingApi(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock < 1) return alert("Sin stock");
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
       if(existing.quantity >= product.stock) return alert("Stock máximo alcanzado");
       setCart(cart.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleEmit = async () => {
    if(!cart.length || !clientName) return alert("Faltan datos");
    
    // Calcular total en la moneda seleccionada
    const total = cart.reduce((sum, i) => sum + (getPrice(i.price) * i.quantity), 0);
    
    const invoiceData = {
      invoice_type: docType,
      customer_name: clientName,
      customer_document: docNum,
      total: total,
      currency: currency, // Enviamos la moneda
      exchange_rate: exchangeRate, // Guardamos el TC usado
      series: docType === 'BOLETA' ? 'B001' : 'F001',
      items: cart.map(i => ({
        code: i.code,
        name: i.name,
        quantity: i.quantity,
        price: getPrice(i.price) // Precio unitario en la moneda seleccionada
      }))
    };

    try {
      // 1. Guardar en Base de Datos
      // Nota: Asumimos que el backend nos devuelve el objeto creado con su ID/Número
      const response = await invoiceService.create(invoiceData);
      
      // 2. Generar PDF Automáticamente
      // Usamos response si contiene la data completa, o invoiceData + datos extra
      const finalInvoice = { ...invoiceData, ...response }; 
      generateInvoicePDF(finalInvoice); 
      
      alert("Venta Exitosa - PDF Generado");
      setCart([]);
      setClientName('');
      setDocNum('');
      onRefresh(); // Actualizar stock y listas
    } catch (e) {
      console.error(e);
      alert("Error al emitir venta");
    }
  };

  // Símbolo de moneda actual
  const currencySymbol = currency === 'PEN' ? 'S/' : '$';

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-gray-50 animate-in fade-in">
      <div className="w-full md:w-7/12 p-4 flex flex-col gap-4">
        {/* Barra superior de productos */}
        <div className="flex gap-4">
           <div className="bg-white p-4 rounded-xl shadow-sm flex-1">
             <input className="w-full outline-none" placeholder="Buscar producto..." />
           </div>
           {/* TOGGLE MONEDA */}
           <button 
             onClick={() => setCurrency(currency === 'PEN' ? 'USD' : 'PEN')}
             className="bg-white px-4 rounded-xl shadow-sm font-bold text-blue-600 border flex items-center gap-2 hover:bg-gray-50"
           >
             <RefreshCw size={18}/> {currency}
           </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
          {products.map(p => (
            <div key={p.id} onClick={()=>addToCart(p)} className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer border border-transparent hover:border-blue-500 ${p.stock < 1 ? 'opacity-50 grayscale' : ''}`}>
              <h4 className="font-bold">{p.name}</h4>
              <p className="text-xs text-gray-500">{p.code}</p>
              <div className="flex justify-between mt-2">
                {/* Precio dinámico */}
                <span className="text-blue-600 font-bold">{currencySymbol} {Number(getPrice(p.price)).toFixed(2)}</span>
                <span className="text-xs bg-gray-100 px-2 rounded">Stock: {p.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-5/12 bg-white shadow-xl border-l flex flex-col z-10">
        <div className="p-6 bg-slate-900 text-white">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold flex gap-2"><ShoppingCart/> Venta</h2>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded flex items-center gap-2">
              TC: {exchangeRate} 
              {currency === 'USD' && <span className="text-green-400 font-bold">(Activado)</span>}
            </span>
          </div>
          <div className="flex gap-2 mb-4">{['BOLETA','FACTURA'].map(t=><button key={t} onClick={()=>setDocType(t)} className={`flex-1 py-2 text-xs font-bold rounded ${docType===t?'bg-blue-500':'bg-slate-800 text-slate-400'}`}>{t}</button>)}</div>
          <div className="flex gap-1"><input value={docNum} onChange={e=>setDocNum(e.target.value)} placeholder="DNI / RUC" className="w-full bg-slate-800 rounded-l px-3 text-sm outline-none"/><button onClick={searchClient} disabled={loadingApi} className="bg-blue-600 px-3 rounded-r">{loadingApi ? '...' : <Search size={16}/>}</button></div>
          {clientName && <div className="mt-2 text-xs text-blue-200 font-bold bg-blue-900/50 p-2 rounded">{clientName}</div>}
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-2 bg-gray-50">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">{item.quantity} x {currencySymbol} {Number(getPrice(item.price)).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{currencySymbol} {(item.quantity * getPrice(item.price)).toFixed(2)}</span>
                <button onClick={()=>setCart(cart.filter((_,i)=>i!==idx))} className="text-red-400"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t">
          <button onClick={handleEmit} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 flex justify-center items-center gap-2">
            <Printer size={20}/> Emitir ({currencySymbol} {cart.reduce((s,i)=>s + (getPrice(i.price) * i.quantity),0).toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;