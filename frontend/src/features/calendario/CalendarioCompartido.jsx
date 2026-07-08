import { useState, useEffect } from 'react';
import { getEventos, postEvento, getViajes, deleteEvento, deleteViaje } from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';

// Helpers para el calendario
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const CalendarioCompartido = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [events, setEvents] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('list'); // 'list' o 'add'
  const [selectedDateStr, setSelectedDateStr] = useState(null); // formato 'YYYY-MM-DD'
  const [selectedDayEvents, setSelectedDayEvents] = useState({ viajes: [], eventos: [] });

  // Estados del formulario
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  // Estado del Modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    const user = localStorage.getItem('usuarioActivo');
    setCurrentUser(user || 'Yescas');
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [dataEventos, dataViajes] = await Promise.all([
        getEventos(),
        getViajes()
      ]);
      setEvents(dataEventos);
      setViajes(dataViajes);
    } catch (error) {
      console.error('Error al cargar datos del calendario:', error);
    } finally {
      setCargando(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getEventIcon = (author) => {
    if (author === 'Yescas') return '🦊';
    if (author === 'Chispita') return '🐦';
    return '📅';
  };

  // Obtener eventos y viajes para un día específico
  const getItemsForDay = (day) => {
    const checkDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const checkDate = new Date(`${checkDateStr}T00:00:00`);

    const dayEventos = events.filter(event => {
      const eDate = event.fecha || event.date;
      return eDate === checkDateStr;
    });

    const dayViajes = viajes.filter(viaje => {
      if (!viaje.fecha_inicio || !viaje.fecha_fin) return false;
      const fInicio = new Date(`${viaje.fecha_inicio}T00:00:00`);
      const fFin = new Date(`${viaje.fecha_fin}T00:00:00`);
      return checkDate >= fInicio && checkDate <= fFin;
    });

    return { eventos: dayEventos, viajes: dayViajes };
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const abrirModal = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
    setSelectedDayEvents(getItemsForDay(day));
    setModalMode('list');
    setNuevoTitulo('');
    setHoraInicio('');
    setHoraFin('');
    setShowModal(true);
  };

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    const eventoNuevo = {
      titulo: nuevoTitulo,
      fecha: selectedDateStr,
      autor: currentUser,
      tipo: 'event',
      hora_inicio: horaInicio || null,
      hora_fin: horaFin || null
    };

    try {
      const creado = await postEvento(eventoNuevo);
      setEvents([...events, creado]);
      
      // Actualizar vista local
      const actualizados = [...events, creado];
      const checkDateStr = selectedDateStr;
      const dayEventos = actualizados.filter(ev => (ev.fecha || ev.date) === checkDateStr);
      
      setSelectedDayEvents(prev => ({ ...prev, eventos: dayEventos }));
      setModalMode('list');
    } catch (error) {
      console.error('Error al crear evento:', error);
      alert('Hubo un error al guardar el evento.');
    }
  };

  const handleEliminarEvento = async (eventoId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Evento',
      message: '¿Seguro que quieres eliminar este evento? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await deleteEvento(eventoId);
          const nuevosEventos = events.filter(e => e.id !== eventoId);
          setEvents(nuevosEventos);
          
          const dayEventos = nuevosEventos.filter(ev => (ev.fecha || ev.date) === selectedDateStr);
          setSelectedDayEvents(prev => ({ ...prev, eventos: dayEventos }));
        } catch (error) {
          console.error('Error al eliminar evento:', error);
          alert('Hubo un error al eliminar el evento.');
        }
      }
    });
  };

  const handleEliminarViaje = async (viajeId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Viaje',
      message: '¿Seguro que quieres eliminar este viaje? Se borrarán también todos sus gastos y el itinerario.',
      onConfirm: async () => {
        try {
          await deleteViaje(viajeId);
          const nuevosViajes = viajes.filter(v => v.id !== viajeId);
          setViajes(nuevosViajes);
          
          const checkDate = new Date(`${selectedDateStr}T00:00:00`);
          const dayViajes = nuevosViajes.filter(viaje => {
            if (!viaje.fecha_inicio || !viaje.fecha_fin) return false;
            const fInicio = new Date(`${viaje.fecha_inicio}T00:00:00`);
            const fFin = new Date(`${viaje.fecha_fin}T00:00:00`);
            return checkDate >= fInicio && checkDate <= fFin;
          });
          setSelectedDayEvents(prev => ({ ...prev, viajes: dayViajes }));
        } catch (error) {
          console.error('Error al eliminar viaje:', error);
          alert('Hubo un error al eliminar el viaje.');
        }
      }
    });
  };

  const formatHora = (timeStr) => {
    if (!timeStr) return '';
    // timeStr viene del backend tipo "14:30:00"
    return timeStr.slice(0, 5);
  };

  return (
    <div className="w-full bg-white/40 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-4 md:p-6 mb-10 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
          Calendario
        </h2>
        <div className="flex gap-2 items-center">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/60 transition-colors shadow-sm">
            ←
          </button>
          <div className="px-3 py-1.5 md:px-4 md:py-2 font-bold text-gray-700 bg-white/50 rounded-lg shadow-sm text-sm md:text-base whitespace-nowrap">
            {monthNames[month]} {year}
          </div>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/60 transition-colors shadow-sm">
            →
          </button>
        </div>
      </div>

      {cargando && <p className="text-center text-slate-400 animate-pulse my-4">Cargando calendario...</p>}

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-gray-500 text-xs md:text-sm py-1 md:py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 auto-rows-fr">
        {blanks.map(blank => (
          <div key={`blank-${blank}`} className="p-1 md:p-2 rounded-xl bg-gray-50/30 border border-transparent min-h-[80px] md:min-h-[100px]"></div>
        ))}
        
        {daysArray.map(day => {
          const { eventos, viajes: viajesDia } = getItemsForDay(day);
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          const totalItems = eventos.length + viajesDia.length;

          return (
            <div 
              key={day} 
              onClick={() => abrirModal(day)}
              className={`p-1 md:p-2 flex flex-col rounded-xl border transition-all hover:shadow-md cursor-pointer min-h-[80px] md:min-h-[100px]
                ${isToday ? 'border-teal-300 bg-teal-50/50' : 'border-gray-100 bg-white/60 hover:border-teal-200'}
              `}
            >
              <div className={`text-right font-semibold text-xs md:text-sm mb-1 ${isToday ? 'text-teal-600' : 'text-gray-500'}`}>
                {day}
              </div>
              <div className="flex-1 flex flex-col gap-1 overflow-y-hidden custom-scrollbar">
                {/* Mostrar Viajes Primero */}
                {viajesDia.slice(0, 2).map(viaje => (
                  <div key={`v-${viaje.id}`} className="text-[10px] md:text-xs p-1 rounded bg-teal-100 text-teal-800 shadow-sm flex items-center gap-1 truncate" title={viaje.titulo}>
                    <span>✈️</span>
                    <span className="truncate font-medium hidden md:inline">{viaje.titulo}</span>
                  </div>
                ))}
                
                {/* Mostrar Eventos Normales */}
                {eventos.slice(0, Math.max(0, 3 - viajesDia.length)).map(event => (
                  <div key={`e-${event.id}`} className="text-[10px] md:text-xs p-1 rounded bg-white shadow-sm border border-gray-100 flex items-center gap-1 truncate" title={event.titulo}>
                    <span>{getEventIcon(event.autor || event.author)}</span>
                    <span className="truncate text-gray-700 hidden md:inline">{event.titulo}</span>
                  </div>
                ))}

                {/* Más de 3 elementos */}
                {totalItems > 3 && (
                  <div className="text-[10px] text-gray-400 font-medium text-center mt-auto">
                    +{totalItems - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            
            {modalMode === 'list' ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Día {selectedDateStr}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                    ✕
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Lista de Viajes */}
                  {selectedDayEvents.viajes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Viajes</h4>
                      <div className="space-y-2">
                        {selectedDayEvents.viajes.map(viaje => (
                          <div key={viaje.id} className="bg-teal-50 border border-teal-100 p-3 rounded-xl flex items-center gap-3 relative">
                            <span className="text-2xl">✈️</span>
                            <div className="flex-1">
                              <p className="font-bold text-teal-900">{viaje.titulo}</p>
                              <p className="text-xs text-teal-600 font-medium">Del {viaje.fecha_inicio} al {viaje.fecha_fin}</p>
                            </div>
                            <button 
                              onClick={() => handleEliminarViaje(viaje.id)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1 bg-white rounded-full shadow-sm flex-shrink-0"
                              title="Eliminar viaje"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de Eventos */}
                  {selectedDayEvents.eventos.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Eventos</h4>
                      <div className="space-y-2">
                        {selectedDayEvents.eventos.map(evento => (
                          <div key={evento.id} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-start gap-3 relative">
                            <span className="text-2xl mt-0.5">{getEventIcon(evento.autor || evento.author)}</span>
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{evento.titulo}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Creado por {evento.autor || evento.author}
                              </p>
                              {(evento.hora_inicio || evento.hora_fin) && (
                                <div className="text-xs font-medium bg-white px-2 py-1 rounded-md inline-block mt-1 shadow-sm text-gray-600">
                                  ⏱️ {formatHora(evento.hora_inicio) || '?'} - {formatHora(evento.hora_fin) || '?'}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => handleEliminarEvento(evento.id)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1 bg-white rounded-full shadow-sm flex-shrink-0 mt-1"
                              title="Eliminar evento"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDayEvents.viajes.length === 0 && selectedDayEvents.eventos.length === 0 && (
                    <div className="text-center text-gray-400 py-6">
                      <p className="text-4xl mb-2">🍃</p>
                      <p>Día libre, no hay actividades.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setModalMode('add')}
                  className="w-full py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 transition-transform active:scale-95"
                >
                  + Añadir Evento
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Nuevo Evento</h3>
                  <button onClick={() => setModalMode('list')} className="text-gray-400 hover:text-gray-600 p-1">
                    ← Volver
                  </button>
                </div>

                <form onSubmit={handleCrearEvento} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Título</label>
                    <input 
                      type="text" 
                      value={nuevoTitulo}
                      onChange={e => setNuevoTitulo(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      placeholder="Ej. Cena romántica"
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Hora inicio</label>
                      <input 
                        type="time" 
                        value={horaInicio}
                        onChange={e => setHoraInicio(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Hora fin</label>
                      <input 
                        type="time" 
                        value={horaFin}
                        onChange={e => setHoraFin(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 rounded-xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default CalendarioCompartido;
