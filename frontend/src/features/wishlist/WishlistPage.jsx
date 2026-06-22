import { useState, useEffect } from 'react';
import WishlistCard from './WishlistCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function WishlistPage() {
  const [nivelActivo, setNivelActivo] = useState(1);
  const [ideas, setIdeas] = useState([]);
  const [nuevaIdea, setNuevaIdea] = useState({ title: '', description: '', budget_tier: 1 });
  const [selectedRandomPlan, setSelectedRandomPlan] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const cargarIdeas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist`);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (error) {
      console.error("Error al cargar wishlist:", error);
    }
  };

  useEffect(() => {
    cargarIdeas();
  }, []);

  const niveles = [
    { id: 1, label: 'De a grapa / Relax', icon: '🍃' },
    { id: 2, label: 'Salida Normal', icon: '🍔' },
    { id: 3, label: 'Plan de Fin de Semana', icon: '🍿' },
    { id: 4, label: 'Viajes / Ahorro Fuerte', icon: '✈️' },
  ];

  const ideasFiltradas = ideas.filter(idea => idea.budget_tier === nivelActivo);

  const getIcono = (tier) => niveles.find(n => n.id === tier)?.icon || '✨';

  const handleRandomChoice = () => {
    if (ideasFiltradas.length === 0) {
      setToastMessage('No hay planes en esta categoría aún 🥺');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    const randomIndex = Math.floor(Math.random() * ideasFiltradas.length);
    setSelectedRandomPlan(ideasFiltradas[randomIndex]);
    setTimeout(() => {
      document.getElementById('modal-random-plan').showModal();
    }, 50);
  };

  const cerrarModalRandom = () => {
    document.getElementById('modal-random-plan').close();
    setTimeout(() => setSelectedRandomPlan(null), 300);
  };

  const abrirModal = () => document.getElementById('modal-nueva-idea').showModal();
  const cerrarModal = () => {
    document.getElementById('modal-nueva-idea').close();
    setNuevaIdea({ title: '', description: '', budget_tier: 1 });
  };

  const guardarIdea = async (e) => {
    e.preventDefault();
    if (!nuevaIdea.title.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaIdea)
      });
      
      if (res.ok) {
        const ideaGuardada = await res.json();
        setIdeas([ideaGuardada, ...ideas]);
        setNivelActivo(ideaGuardada.budget_tier);
        cerrarModal();
      }
    } catch (error) {
      console.error("Error al guardar idea:", error);
    }
  };

  const borrarIdea = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIdeas(ideas.filter(idea => idea.id !== id));
      }
    } catch (error) {
      console.error("Error al borrar idea:", error);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-[15px]";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 mb-1">Wishlist de Citas 💖</h2>
        <p className="text-slate-500 text-sm font-medium">Ideas para nuestra próxima aventura</p>
      </div>

      {/* Tabs / Chips horizontales deslizables */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-2 -mx-4 px-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {niveles.map(nivel => (
          <button
            key={nivel.id}
            onClick={() => setNivelActivo(nivel.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all snap-center shadow-sm ${
              nivelActivo === nivel.id
                ? 'bg-teal-600 text-white shadow-teal-600/30'
                : 'bg-white text-slate-500 border border-slate-100 hover:border-teal-300 hover:bg-teal-50'
            }`}
          >
            <span className="text-base">{nivel.icon}</span>
            {nivel.label}
          </button>
        ))}
      </div>

      {/* Botón de Decisión Aleatoria */}
      <button 
        onClick={handleRandomChoice}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6"
      >
        <span className="text-xl">🎲</span>
        Decisión Aleatoria
      </button>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800/95 backdrop-blur-sm text-white px-5 py-3 rounded-full text-sm font-medium shadow-xl animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      {/* Contenedor de Tarjetas */}
      <div className="flex flex-col gap-4 pb-10">
        {ideasFiltradas.length > 0 ? (
          ideasFiltradas.map((idea) => (
            <div key={idea.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <WishlistCard idea={idea} icono={getIcono(idea.budget_tier)} onDelete={borrarIdea} />
            </div>
          ))
        ) : (
          <div className="bg-white/50 border border-slate-200 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[300px] animate-in fade-in zoom-in duration-300">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">
                🪄
             </div>
             <p className="text-slate-600 font-bold mb-1">No hay ideas en este nivel todavía.</p>
             <p className="text-slate-400 text-sm font-medium">Toca el botón + para agregar una nueva cita a la lista.</p>
          </div>
        )}
      </div>
      
      {/* Botón Flotante (FAB) global para Ideas */}
      <div className="fixed bottom-[80px] right-4 z-40 max-w-md pointer-events-none flex justify-end">
        <button 
          onClick={abrirModal}
          className="pointer-events-auto bg-pink-500 text-white w-14 h-14 rounded-full shadow-lg shadow-pink-500/40 flex items-center justify-center hover:bg-pink-600 active:scale-90 transition-transform">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
        </button>
      </div>

      {/* Bottom Sheet Dialog */}
      <dialog 
        id="modal-nueva-idea" 
        className="backdrop:bg-slate-900/60 p-0 m-0 mt-auto fixed inset-x-0 bottom-0 max-w-md w-full mx-auto rounded-t-[2rem] bg-white shadow-2xl transition-transform ease-out duration-300 open:animate-in open:slide-in-from-bottom-full"
      >
        <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-black text-slate-800">Nueva Idea 🪄</h2>
              <p className="text-sm text-slate-500 font-medium">Agrega un plan a la lista</p>
            </div>
            <button type="button" onClick={cerrarModal} className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-90 transition-transform">
               ✕
            </button>
          </div>
          
          <form className="flex flex-col gap-4" onSubmit={guardarIdea}>
            <input 
              className={inputClass} 
              type="text" 
              placeholder="Título del Plan (ej. Noche de Estrellas)" 
              value={nuevaIdea.title} 
              onChange={(e) => setNuevaIdea({...nuevaIdea, title: e.target.value})} 
              required 
            />
            <textarea 
              className={`${inputClass} min-h-[100px] resize-none`} 
              placeholder="Detalles o links..." 
              value={nuevaIdea.description} 
              onChange={(e) => setNuevaIdea({...nuevaIdea, description: e.target.value})} 
            />
            
            <div className="mt-2">
              <label className="text-[13px] font-bold text-slate-500 px-1 uppercase tracking-wider mb-2 block">Nivel de Presupuesto</label>
              <div className="grid grid-cols-2 gap-2">
                {niveles.map(nivel => (
                  <button
                    key={nivel.id}
                    type="button"
                    onClick={() => setNuevaIdea({...nuevaIdea, budget_tier: nivel.id})}
                    className={`flex items-center gap-2 p-3 rounded-2xl border font-bold text-xs transition-all active:scale-[0.98] ${
                      nuevaIdea.budget_tier === nivel.id 
                        ? 'bg-pink-50 border-pink-300 text-pink-700 shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{nivel.icon}</span>
                    <span className="text-left leading-tight">{nivel.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button type="submit" className="w-full mt-4 bg-pink-500 active:bg-pink-600 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-md shadow-pink-500/20 text-[15px]">
              Guardar Idea
            </button>
          </form>
        </div>
      </dialog>

      {/* Bottom Sheet Random Plan */}
      <dialog 
        id="modal-random-plan" 
        className="backdrop:bg-slate-900/60 p-0 m-0 mt-auto fixed inset-x-0 bottom-0 max-w-md w-full mx-auto rounded-t-[2rem] bg-indigo-600 text-white shadow-2xl transition-transform ease-out duration-300 open:animate-in open:slide-in-from-bottom-full"
      >
        {selectedRandomPlan && (
          <div className="p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner border border-white/30">
               🎲
            </div>
            <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">¡El destino ha hablado!</h3>
            <h2 className="text-3xl font-black mb-4 leading-tight">{selectedRandomPlan.title}</h2>
            <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
              {selectedRandomPlan.description || 'Un plan sorpresa, ¡prepárate para la aventura!'}
            </p>
            <button 
              onClick={cerrarModalRandom}
              className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl active:scale-[0.98] transition-all shadow-xl text-[15px]"
            >
              ¡Vamos! ✨
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
