import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const [nuevoTexto, setNuevoTexto] = useState('');

  const cargarTareas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tareas`);
      if (res.ok) {
        const data = await res.json();
        setTareas(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarTareas();

    const handleUpdate = () => {
      cargarTareas();
    };

    window.addEventListener('WS_ACTUALIZACION_TAREAS', handleUpdate);
    return () => window.removeEventListener('WS_ACTUALIZACION_TAREAS', handleUpdate);
  }, []);

  const agregarTarea = async (e) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;
    
    try {
      await fetch(`${API_URL}/api/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: nuevoTexto })
      });
      setNuevoTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCompletada = async (id, actual) => {
    try {
      await fetch(`${API_URL}/api/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completada: !actual })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarTarea = async (id) => {
    try {
      await fetch(`${API_URL}/api/tareas/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-md mb-10 max-w-2xl mx-auto border border-teal-100">
      <h2 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
        <span>📝</span> Tareas Compartidas
      </h2>
      
      <form onSubmit={agregarTarea} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Ej. Comprar bloqueador..."
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={!nuevoTexto.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm"
        >
          Agregar
        </button>
      </form>

      <div className="space-y-3">
        {tareas.length === 0 ? (
          <p className="text-center text-slate-400 py-4 italic text-sm">No hay tareas pendientes. ¡Todo listo! ✨</p>
        ) : (
          tareas.map(tarea => (
            <div key={tarea.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${tarea.completada ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm hover:border-teal-300'}`}>
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={tarea.completada}
                    onChange={() => toggleCompletada(tarea.id, tarea.completada)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 checked:border-teal-500 checked:bg-teal-500 transition-all"
                  />
                  <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 8 7 12 13 4"></polyline>
                  </svg>
                </div>
                <span className={`text-slate-700 font-medium ${tarea.completada ? 'line-through text-slate-400' : ''}`}>
                  {tarea.texto}
                </span>
              </label>
              
              <button
                onClick={() => eliminarTarea(tarea.id)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors ml-4"
                title="Eliminar tarea"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
