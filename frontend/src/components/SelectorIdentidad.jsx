import { useState, useEffect } from 'react';

export default function SelectorIdentidad({ onSeleccion }) {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const guardado = localStorage.getItem('usuario_proyecto_chispita');
        if (guardado) {
            setUsuario(guardado);
            onSeleccion(guardado);
        }
    }, [onSeleccion]);

    const elegirUsuario = (nombre) => {
        localStorage.setItem('usuario_proyecto_chispita', nombre);
        setUsuario(nombre);
        onSeleccion(nombre);
    };

    if (usuario) return null;

    return (
        <div className="fixed inset-0 bg-teal-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4">
                <h2 className="text-2xl font-black text-teal-800 mb-2">¡Alto ahí! 🛑</h2>
                <p className="text-slate-500 mb-6 text-sm">¿Quién está entrando al centro de comando?</p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => elegirUsuario('Yescas')}
                        className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all shadow-md transform hover:-translate-y-1">
                        Yescas 🐺
                    </button>
                    <button
                        onClick={() => elegirUsuario('Chispita')}
                        className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-md transform hover:-translate-y-1">
                        Chispita ✨
                    </button>
                </div>
            </div>
        </div>
    );
}