import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react'; // Nuevos iconos
import { productService } from '../services/apiService';

const Inventory = ({ products, onRefresh }) => {
  const [form, setForm] = useState({ code: '', name: '', price: '', stock: '' });
  
  // Estados para la edición en línea
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // --- CREAR ---
  const handleSave = async () => {
    if(!form.code || !form.name) return alert("Completa los campos obligatorios");
    try {
      await productService.create({
        code: form.code,
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock)
      });
      setForm({ code: '', name: '', price: '', stock: '' });
      onRefresh();
    } catch (e) { 
      alert(e.response?.data?.message || "Error al crear producto"); 
    }
  };

  // --- ELIMINAR ---
  const handleDelete = async (id) => {
    if(confirm("¿Eliminar producto?")) {
      try {
        await productService.delete(id);
        onRefresh();
      // eslint-disable-next-line no-unused-vars
      } catch (e) { alert("Error al eliminar"); }
    }
  };

  // --- EDITAR ---
  const startEdit = (product) => {
    setEditingId(product.id);
    // Copiamos los datos actuales al formulario temporal
    setEditForm({ 
      code: product.code, 
      name: product.name, 
      price: product.price, 
      stock: product.stock 
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    try {
      await productService.update(id, {
        ...editForm,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock)
      });
      setEditingId(null);
      onRefresh(); // Recargamos la lista
    } catch (e) {
      console.error(e);
      alert("Error al actualizar producto");
    }
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Inventario</h2>
      
      {/* FORMULARIO DE CREACIÓN */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <input placeholder="Código" className="border rounded p-2" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} />
        <input placeholder="Nombre del Producto" className="border rounded p-2 md:col-span-2" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
        <input placeholder="Stock Inicial" type="number" className="border rounded p-2" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} />
        <input placeholder="Precio (S/)" type="number" className="border rounded p-2" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded md:col-span-1 flex justify-center items-center gap-2 font-bold transition-colors">
          <Plus size={20}/> Agregar
        </button>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="flex-1 bg-white rounded-xl border overflow-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-gray-600 font-bold border-b">Código</th>
              <th className="p-4 text-gray-600 font-bold border-b">Producto</th>
              <th className="p-4 text-gray-600 font-bold border-b text-right">Stock</th>
              <th className="p-4 text-gray-600 font-bold border-b text-right">Precio</th>
              <th className="p-4 text-gray-600 font-bold border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const isEditing = editingId === p.id;
              const isLowStock = parseInt(p.stock) <= 0;

              return (
                <tr key={p.id} className={`border-b hover:bg-gray-50 transition-colors ${isLowStock && !isEditing ? 'bg-red-50' : ''}`}>
                  
                  {/* CÓDIGO */}
                  <td className="p-4">
                    {isEditing ? (
                      <input className="w-full border rounded px-2 py-1 bg-white" value={editForm.code} onChange={e=>setEditForm({...editForm, code: e.target.value})} />
                    ) : (
                      <span className="font-mono text-sm text-gray-500">{p.code}</span>
                    )}
                  </td>

                  {/* NOMBRE */}
                  <td className="p-4">
                    {isEditing ? (
                      <input className="w-full border rounded px-2 py-1 bg-white" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} />
                    ) : (
                      <div className="flex items-center gap-2">
                        {p.name}
                        {isLowStock && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-red-200"><AlertCircle size={10}/> AGOTADO</span>}
                      </div>
                    )}
                  </td>

                  {/* STOCK (Aquí es donde reabasteces rápido) */}
                  <td className="p-4 text-right">
                    {isEditing ? (
                      <input type="number" className="w-20 border rounded px-2 py-1 text-right bg-blue-50 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={editForm.stock} 
                        onChange={e=>setEditForm({...editForm, stock: e.target.value})} 
                        autoFocus // Pone el cursor aquí automáticamente al editar
                      />
                    ) : (
                      <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>{p.stock}</span>
                    )}
                  </td>

                  {/* PRECIO */}
                  <td className="p-4 text-right">
                    {isEditing ? (
                      <input type="number" className="w-24 border rounded px-2 py-1 text-right bg-white" value={editForm.price} onChange={e=>setEditForm({...editForm, price: e.target.value})} />
                    ) : (
                      <span>S/ {Number(p.price).toFixed(2)}</span>
                    )}
                  </td>

                  {/* ACCIONES */}
                  <td className="p-4 text-center whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => saveEdit(p.id)} className="bg-green-100 text-green-700 p-1.5 rounded hover:bg-green-200" title="Guardar"><Check size={18}/></button>
                        <button onClick={cancelEdit} className="bg-gray-100 text-gray-600 p-1.5 rounded hover:bg-gray-200" title="Cancelar"><X size={18}/></button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => startEdit(p)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded" title="Editar / Reabastecer">
                          <Edit2 size={18}/>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded" title="Eliminar">
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">No hay productos en inventario.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;