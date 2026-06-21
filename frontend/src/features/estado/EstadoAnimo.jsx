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
    <div className="bg-white/80 backdrop-blur-sm border border-teal-100 rounded-2xl p-5 shadow-sm mb-10 max-w-2xl mx-auto flex flex-col items-center">
      <h3 className="text-sm font-semibold text-teal-800 mb-4 uppercase tracking-wider">¿Qué onda, {usuarioActivo}?</h3>

      <form onSubmit={manejarEnvioPersonalizado} className="flex gap-2 w-full max-w-md mb-4">
        <input
          type="text"
          placeholder="Escribe tu estado..."
          value={estadoPersonalizado}
          onChange={(e) => setEstadoPersonalizado(e.target.value)}
          disabled={enviando}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
        />
        <button
          type="submit"
          disabled={enviando || !estadoPersonalizado.trim()}
          className="bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl px-4 py-2 text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </form>

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
