import { useState, useEffect } from 'react';
import { getViajes } from './services/api';
import FormularioViaje from './features/viajes/FormularioViaje';
import TarjetaViaje from './features/viajes/TarjetaViaje';
import SelectorIdentidad from './components/layout/SelectorIdentidad';
import BottomNavBar from './components/layout/BottomNavBar';
import EstadoAnimo from './features/estado/EstadoAnimo';
import ListaTareas from './features/tareas/ListaTareas';
import WishlistPage from './features/wishlist/WishlistPage';
import CalendarioCompartido from './features/calendario/CalendarioCompartido';
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
  const [vistaActiva, setVistaActiva] = useState('viajes');

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

  if (!usuarioActivo) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <h1 className="text-4xl font-black text-center mb-10 tracking-tight text-teal-600 drop-shadow-sm">
          Chispita ✈️
        </h1>
        <SelectorIdentidad onSeleccion={handleSetUsuario} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-2xl font-sans overflow-x-hidden">
      {/* Encabezado Principal */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center pt-[env(safe-area-inset-top,1rem)]">
        <h1 className="text-2xl font-black tracking-tight text-teal-600">
          {vistaActiva === 'viajes' ? 'Mis Viajes' : vistaActiva === 'tareas' ? 'Checklist' : vistaActiva === 'ideas' ? 'Wishlist' : vistaActiva === 'calendario' ? 'Eventos' : 'Mi Perfil'}
        </h1>
        {vistaActiva === 'perfil' && (
          <button onClick={solicitarPermisosNotificacion} className="text-teal-600 p-2 rounded-full hover:bg-teal-50 active:scale-95 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          </button>
        )}
      </header>

      <main className="p-4 pb-28">
        {/* VISTA: VIAJES */}
        {vistaActiva === 'viajes' && (
          <div className="space-y-6">
            {cargando ? (
              <p className="text-center text-slate-400 animate-pulse mt-10">Cargando datos...</p>
            ) : errorConexion ? (
              <div className="text-center p-6 bg-red-50 rounded-2xl text-red-500 border border-red-100">
                <p className="font-bold">Error de Conexión</p>
                <p className="text-sm mt-1">Revisa que el servidor esté corriendo.</p>
              </div>
            ) : viajes.length === 0 ? (
              <div className="text-center mt-20 text-slate-400">
                <p className="text-6xl mb-4">🌴</p>
                <p>No hay viajes. ¡Toca el botón + para empezar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {viajes.map(viaje => (
                  <TarjetaViaje key={viaje.id} viaje={viaje} onDelete={eliminarViajeLocal} />
                ))}
              </div>
            )}
            
            <div className="fixed bottom-[80px] right-4 z-40 max-w-md pointer-events-none flex justify-end">
              <button 
                onClick={() => document.getElementById('modal-nuevo-viaje').showModal()}
                className="pointer-events-auto bg-teal-600 text-white w-14 h-14 rounded-full shadow-lg shadow-teal-600/40 flex items-center justify-center hover:bg-teal-700 active:scale-90 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
            
            <FormularioViaje onViajeGuardado={agregarNuevoViaje} />
          </div>
        )}

        {/* VISTA: TAREAS */}
        {vistaActiva === 'tareas' && (
          <ListaTareas />
        )}

        {/* VISTA: IDEAS / WISHLIST */}
        {vistaActiva === 'ideas' && (
          <WishlistPage />
        )}

        {/* VISTA: CALENDARIO */}
        {vistaActiva === 'calendario' && (
          <div className="mt-2">
            <CalendarioCompartido />
          </div>
        )}

        {/* VISTA: PERFIL */}
        {vistaActiva === 'perfil' && (
          <div className="space-y-6 mt-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-teal-400 to-cyan-500 opacity-20"></div>
              <div className="w-24 h-24 bg-white shadow-md text-4xl rounded-full flex items-center justify-center mb-4 z-10 border-4 border-white">
                {usuarioActivo === 'Yescas' ? '🧔🏻‍♂️' : '👱🏻‍♀️'}
              </div>
              <h2 className="text-2xl font-black text-slate-800 z-10">{usuarioActivo}</h2>
              <button onClick={() => handleSetUsuario(null)} className="mt-6 px-8 py-2.5 bg-slate-100 text-slate-700 rounded-full font-medium active:bg-slate-200 transition-colors z-10">
                Cerrar Sesión
              </button>
            </div>
            
            <EstadoAnimo usuarioActivo={usuarioActivo} />
          </div>
        )}
      </main>

      <BottomNavBar vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
    </div>
  );
}

export default App;