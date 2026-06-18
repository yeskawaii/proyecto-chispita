import { useState } from 'react';
import { postViaje } from '../services/api';

export default function FormularioViaje({ onViajeGuardado }) {
  const [nuevoViaje, setNuevoViaje] = useState({
    titulo: '', destino: '', fecha_inicio: '', fecha_fin: '', presupuesto_estimado: ''
  });

  const manejarCambio = (e) => {
    setNuevoViaje({ ...nuevoViaje, [e.target.name]: e.target.value });
  };

  const guardarViaje = async (e) => {
    e.preventDefault();
    try {
      const viajeParaGuardar = {
        ...nuevoViaje,
        presupuesto_estimado: parseFloat(nuevoViaje.presupuesto_estimado)
      };
      const viajeGuardado = await postViaje(viajeParaGuardar);
      onViajeGuardado(viajeGuardado);
      setNuevoViaje({ titulo: '', destino: '', fecha_inicio: '', fecha_fin: '', presupuesto_estimado: '' });
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <form className="formulario-viaje" onSubmit={guardarViaje}>
      <h2>Planear Nuevo Viaje</h2>
      <input className="input-estilo" type="text" name="titulo" placeholder="Título (ej. Vacaciones de Aniversario)" value={nuevoViaje.titulo} onChange={manejarCambio} required />
      <input className="input-estilo" type="text" name="destino" placeholder="Destino" value={nuevoViaje.destino} onChange={manejarCambio} required />
      <input className="input-estilo" type="date" name="fecha_inicio" value={nuevoViaje.fecha_inicio} onChange={manejarCambio} required />
      <input className="input-estilo" type="date" name="fecha_fin" value={nuevoViaje.fecha_fin} onChange={manejarCambio} required />
      <input className="input-estilo" type="number" name="presupuesto_estimado" placeholder="Presupuesto ($ MXN)" value={nuevoViaje.presupuesto_estimado} onChange={manejarCambio} required />
      <button type="submit" className="btn-principal">Guardar Viaje</button>
    </form>
  );
}