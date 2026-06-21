import { useEffect } from 'react';

export function useWebSockets(usuarioActivo) {
  useEffect(() => {
    if (!usuarioActivo) return;

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws/${usuarioActivo}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Conectado a WebSocket como:', usuarioActivo);
    };

    socket.onmessage = (event) => {
      console.log('Mensaje recibido por WS:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.tipo === 'ACTUALIZACION_TAREAS') {
          window.dispatchEvent(new CustomEvent('WS_ACTUALIZACION_TAREAS'));
        }
      } catch (err) {}
    };

    socket.onclose = () => {
      console.log('Desconectado de WebSocket');
    };

    return () => {
      socket.close();
    };
  }, [usuarioActivo]);
}
