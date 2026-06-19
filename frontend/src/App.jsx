import { useState, useEffect } from 'react';
import { getViajes } from './services/api';
import FormularioViaje from './components/FormularioViaje';
import TarjetaViaje from './components/TarjetaViaje';
import SelectorIdentidad from './components/SelectorIdentidad';

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(false);

  useEffect(() => {
    getViajes()
      .then(datos => {
        setViajes(datos);
        setCargando(false);
      })
      .catch(error => {
        console.error("Tronó la conexión:", error);
        setErrorConexion(true);
        setCargando(false);
      });
  }, []);

  const agregarNuevoViaje = (viaje) => {
    setViajes([...viajes, viaje]);
  };

  const eliminarViajeLocal = (id) => {
    setViajes(viajes.filter(v => v.id !== id));
  };

  const solicitarPermisosNotificacion = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones web.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('¡Ahora sí!', {
        body: 'Las notificaciones ya están jalando al cien en tu dispositivo',
      });
    } else {
      alert('Permiso denegado para notificaciones.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-sky-50 to-emerald-100 text-gray-800 p-6 md:p-10 font-sans selection:bg-teal-500/30">
      <SelectorIdentidad onSeleccion={setUsuarioActivo} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 drop-shadow-sm">
          Viajes con mi Chispita ✈️🌴
        </h1>

        <div className="flex justify-center mb-10">
          <button onClick={solicitarPermisosNotificacion} className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-semibold text-sm hover:bg-teal-200 transition-colors shadow-sm flex items-center gap-2">
            🔔 Activar Notificaciones
          </button>
        </div>

        <FormularioViaje onViajeGuardado={agregarNuevoViaje} />

        {cargando ? (
          <p className="text-center text-slate-400 animate-pulse">Cargando datos del servidor...</p>
        ) : errorConexion ? (
          <div className="max-w-2xl mx-auto text-center p-6 bg-red-950/50 border border-red-900 rounded-xl text-red-400">
            <h3 className="font-bold text-xl mb-2">🚨 Error de Conexión</h3>
            <p>No se pudo conectar con el backend de Postgres. Revisa que tu servidor esté corriendo.</p>
          </div>
        ) : viajes.length === 0 ? (
          <p className="text-center text-slate-500">No hay viajes registrados. ¡Planifica el primero arriba!</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viajes.map(viaje => (
              <TarjetaViaje key={viaje.id} viaje={viaje} onDelete={eliminarViajeLocal} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;