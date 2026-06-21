import { useState, useEffect } from 'react';
import { getViajes } from './services/api';
import FormularioViaje from './features/viajes/FormularioViaje';
import TarjetaViaje from './features/viajes/TarjetaViaje';
import SelectorIdentidad from './components/layout/SelectorIdentidad';
import EstadoAnimo from './features/estado/EstadoAnimo';
import ListaTareas from './features/tareas/ListaTareas';
import { useWebSockets } from './hooks/useWebSockets';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState(() => localStorage.getItem('usuarioActivo') || null);
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        // Cache busting: obligar a ir a la red saltándose el Service Worker
        const res = await fetch(`/version.json?t=${new Date().getTime()}`);
        if (!res.ok) return;
        const data = await res.json();
        
        const savedVersion = localStorage.getItem('app_version');
        
        if (!savedVersion) {
          localStorage.setItem('app_version', data.version);
          return;
        }

        if (savedVersion !== data.version) {
          console.log(`Actualizando versión: ${savedVersion} -> ${data.version}`);
          const user = localStorage.getItem('usuarioActivo');
          
          localStorage.clear();
          localStorage.setItem('app_version', data.version);
          if (user) localStorage.setItem('usuarioActivo', user);
          
          // Desregistrar Service Workers para purgar la caché dura de iOS
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let reg of regs) {
              await reg.unregister();
            }
          }
          
          window.location.reload(true);
        }
      } catch (err) {
        console.error("Error verificando versión:", err);
      }
    };

    checkUpdate();

    // Revisar actualizaciones al volver a abrir la app (en iOS / Android)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkUpdate();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleSetUsuario = (usuario) => {
    setUsuarioActivo(usuario);
    if (usuario) {
      localStorage.setItem('usuarioActivo', usuario);
    } else {
      localStorage.removeItem('usuarioActivo');
    }
  };

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

  useWebSockets(usuarioActivo);

  const solicitarPermisosNotificacion = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Tu navegador no soporta notificaciones web.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        const swRegistration = await navigator.serviceWorker.ready;

        const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        const convertedVapidKey = urlBase64ToUint8Array(publicKey);

        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });

        const res = await fetch(`${import.meta.env.VITE_API_URL}/notificaciones/suscribir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...subscription.toJSON(),
            usuario: usuarioActivo
          })
        });

        if (res.ok) {
          alert('¡Suscripción exitosa a notificaciones push! 🎉');
        } else {
          console.error('Error al suscribir en backend:', await res.text());
        }
      } catch (error) {
        console.error('Falló la suscripción push:', error);
      }
    } else {
      alert('Permiso denegado para notificaciones.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-sky-50 to-emerald-100 text-gray-800 p-6 md:p-10 font-sans selection:bg-teal-500/30">
      <SelectorIdentidad onSeleccion={handleSetUsuario} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 drop-shadow-sm">
          Viajes con mi Chispita ✈️🌴
        </h1>

        <div className="flex justify-center mb-8">
          <button onClick={solicitarPermisosNotificacion} className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-semibold text-sm hover:bg-teal-200 transition-colors shadow-sm flex items-center gap-2">
            🔔 Activar Notificaciones
          </button>
        </div>

        <EstadoAnimo usuarioActivo={usuarioActivo} />

        {usuarioActivo && <ListaTareas />}
        
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