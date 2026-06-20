import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function EstadoAnimo({ usuarioActivo }) {
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState('');

  const estados = [
    { label: 'Chill', emoji: '😎' },
    { label: 'Hype', emoji: '🤩' },
    { label: 'Estresado', emoji: '🤯' },
    { label: 'Pensativo', emoji: '🤔' }
  ];

  const enviarEstado = async (estado) => {
    if (!usuarioActivo) return;
    setEnviando(true);
    setFeedback('');
    
    try {
      const res = await fetch(`${API_URL}/api/estado-animo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuarioActivo,
          estado: `${estado.emoji} ${estado.label}`
        })
      });
      
      if (res.ok) {
        setFeedback(`¡Enviado a tu compa!`);
        setTimeout(() => setFeedback(''), 3000);
      } else {
        const err = await res.json();
        setFeedback(`Error: ${err.detail}`);
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (error) {
      console.error(error);
      setFeedback('Error de red al enviar');
      setTimeout(() => setFeedback(''), 4000);
    } finally {
      setEnviando(false);
    }
  };

  if (!usuarioActivo) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-teal-100 rounded-2xl p-5 shadow-sm mb-10 max-w-2xl mx-auto flex flex-col items-center">
      <h3 className="text-sm font-semibold text-teal-800 mb-4 uppercase tracking-wider">¿Cómo te sientes hoy con los preparativos, {usuarioActivo}?</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {estados.map((est) => (
          <button
            key={est.label}
            onClick={() => enviarEstado(est)}
            disabled={enviando}
            className="flex items-center gap-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl px-4 py-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">{est.emoji}</span>
            <span className="font-medium text-slate-700">{est.label}</span>
          </button>
        ))}
      </div>
      {feedback && (
        <div className="mt-4 text-sm font-bold text-emerald-600 animate-pulse">
          {feedback.startsWith('Error') ? '❌' : '✓'} {feedback}
        </div>
      )}
    </div>
  );
}
