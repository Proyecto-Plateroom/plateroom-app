import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function WebSocketTest() {
    const { user } = useUser();
    const [wsMessage, setWsMessage] = useState('');
    const [wsMessages, setWsMessages] = useState<string[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);

    // Configurar WebSocket
    useEffect(() => {
        if (!user) return;

        // URL de la edge function WebSocket
        const wsUrl = 'ws://127.0.0.1:64321/functions/v1/room-websocket';
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket conectado');
            setWs(socket);
            setWsMessages(prev => [...prev, '✅ Conectado al servidor WebSocket']);
        };

        socket.onmessage = (event) => {
            console.log('Mensaje recibido:', event.data);
            setWsMessages(prev => [...prev, `📨 Servidor: ${event.data}`]);
        };

        socket.onclose = () => {
            console.log('WebSocket desconectado');
            setWs(null);
            setWsMessages(prev => [...prev, '❌ Desconectado del servidor WebSocket']);
        };

        socket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            setWsMessages(prev => [...prev, `❌ Error: ${error}`]);
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [user]);

    const sendWsMessage = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN || !wsMessage.trim()) return;
        
        ws.send(wsMessage);
        setWsMessages(prev => [...prev, `✉️ Tú: ${wsMessage}`]);
        setWsMessage('');
    };

    return (
        <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50 h-64 overflow-y-auto">
                {wsMessages.length === 0 ? (
                    <p className="text-gray-500">Conectando al servidor WebSocket...</p>
                ) : (
                    <div className="space-y-2">
                        {wsMessages.map((msg, index) => (
                            <div key={index} className="break-words">{msg}</div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={wsMessage}
                    onChange={(e) => setWsMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendWsMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 p-2 border rounded"
                    disabled={!ws || ws.readyState !== WebSocket.OPEN}
                />
                <button
                    onClick={sendWsMessage}
                    disabled={!ws || ws.readyState !== WebSocket.OPEN || !wsMessage.trim()}
                    className={`px-4 py-2 rounded ${
                        !ws || ws.readyState !== WebSocket.OPEN || !wsMessage.trim() 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    Enviar
                </button>
            </div>

            <div className="text-sm text-gray-500">
                Estado: {!ws 
                    ? 'Desconectado' 
                    : ws.readyState === WebSocket.OPEN 
                        ? '🟢 Conectado' 
                        : '🟠 Conectando...'}
            </div>
        </div>
    );
}
