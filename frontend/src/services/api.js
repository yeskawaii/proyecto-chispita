const API_URL = 'https://api-chispita.duckdns.org';

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

export const getIdeasIA = async (viajeId) => {
  const res = await fetch(`${API_URL}/viajes/${viajeId}/ideas`);
  return res.json();
};