const API_URL = import.meta.env.VITE_API_URL;

// apis de viajes
export const getViajes = async () => {
  const res = await fetch(`${API_URL}/viajes/`);
  return res.json();
};

export const postViaje = async (viaje) => {
  const res = await fetch(`${API_URL}/viajes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(viaje)
  });
  return res.json();
};

export const deleteViaje = async (viajeId) => {
  const res = await fetch(`${API_URL}/viajes/${viajeId}`, {
    method: 'DELETE',
  });
  return res.json();
};

// api de ia
export const getIdeasIA = async (viajeId) => {
  const res = await fetch(`${API_URL}/viajes/${viajeId}/ideas`);
  return res.json();
};

// api de gastos
export const getGastos = async (viajeId) => {
  const res = await fetch(`${API_URL}/viajes/${viajeId}/gastos/`);
  return res.json();
};

export const postGasto = async (viajeId, gasto) => {
  const res = await fetch(`${API_URL}/gastos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...gasto, viaje_id: viajeId })
  });
  return res.json();
};

export const deleteGasto = async (gastoId) => {
  const res = await fetch(`${API_URL}/gastos/${gastoId}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const getItinerario = async (viajeId) => {
  const res = await fetch(`${API_URL}/viajes/${viajeId}/itinerario`);
  if (!res.ok) throw new Error("Error al traer itinerario");
  return res.json();
};

export const postItinerario = async (viajeId, item) => {
  const res = await fetch(`${API_URL}/viajes/${viajeId}/itinerario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Error al guardar itinerario");
  return res.json();
};

export const deleteItinerario = async (viajeId, itemId) => {
  const res = await fetch(`${API_URL}/viajes/${viajeId}/itinerario/${itemId}`, {
    method: 'DELETE',
  });
  return res.json();
};