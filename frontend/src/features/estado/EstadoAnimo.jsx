import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function EstadoAnimo({ usuarioActivo }) {
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [estadoPersonalizado, setEstadoPersonalizado] = useState('');

  const estados = [
    { label: 'Feliz', emoji: '😁' },
    { label: 'Triste', emoji: '😢' },
    { label: 'Hambriento', emoji: '🍔' },
    { label: 'Agotado', emoji: '😵💫' },
    { label: 'Enojado', emoji: '🤬' }
  ];

  const enviarEstado = async (estado) => {
    if (!usuarioActivo) return;

    const payloadEstado = typeof estado === 'string'
      ? estado
      : `${estado.emoji} ${estado.label}`;

    if (!payloadEstado.trim()) return;

    setEnviando(true);
    setFeedback('');

    try {
      const res = await fetch(`${API_URL}/api/estado-animo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuarioActivo,
          estado: payloadEstado
        })
      });

      if (res.ok) {
        setFeedback(`Aviso enviado`);
        setEstadoPersonalizado('');
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

  const manejarEnvioPersonalizado = (e) => {
    e.preventDefault();
    enviarEstado(estadoPersonalizado);
  };

  if (!usuarioActivo) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
      <h3 className="text-sm font-bold text-slate-400 mb-5 uppercase tracking-widest">¿Cómo te sientes?</h3>

      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        {estados.map((est) => (
          <button
            key={est.label}
            onClick={() => enviarEstado(est)}
            disabled={enviando}
            className="flex flex-col items-center justify-center gap-1 bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50 active:scale-95 rounded-2xl py-3 transition-all shadow-sm disabled:opacity-50"
          >
            <span className="text-2xl mb-1">{est.emoji}</span>
            <span className="text-[10px] font-semibold text-slate-500">{est.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={manejarEnvioPersonalizado} className="flex gap-2 w-full">
        <input
          type="text"
          placeholder="Escribe otro estado..."
          value={estadoPersonalizado}
          onChange={(e) => setEstadoPersonalizado(e.target.value)}
          disabled={enviando}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
        />
        <button
          type="submit"
          disabled={enviando || !estadoPersonalizado.trim()}
          className="bg-teal-600 text-white font-bold rounded-2xl px-5 py-3 text-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </form>

      {feedback && (
        <div className={`mt-4 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 ${feedback.includes('Error') ? 'text-red-500' : 'text-teal-600'}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}
