import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useUser, useSession, useOrganization } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

// Tipos
interface Task {
    id: number;
    name: string;
    user_id: string;
    created_at: string;
}

// Definir tipos para las variables de entorno
declare global {
    interface ImportMetaEnv {
        readonly VITE_SUPABASE_URL: string;
        readonly VITE_SUPABASE_ANON_KEY: string;
    }
}

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [taskName, setTaskName] = useState('');
    const { user, isLoaded: isUserLoaded } = useUser();
    const { session, isLoaded: isSessionLoaded } = useSession();
    const { organization } = useOrganization();
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [wsMessage, setWsMessage] = useState<string>('');
    const [wsMessages, setWsMessages] = useState<string[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);

    // Crear el cliente de Supabase
    function createClerkSupabaseClient() {
        return createClient(
            import.meta.env.VITE_SUPABASE_URL!,
            import.meta.env.VITE_SUPABASE_ANON_KEY!,
            {
                async accessToken() {
                    return session?.getToken() ?? null
                },
            },
        )
    }

    const supabase = createClerkSupabaseClient();

    // Cargar tareas
    useEffect(() => {
        if (!isUserLoaded || !isSessionLoaded || !user || !session) return;

        const loadTasks = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('tasks')
                    .select('*');

                if (error) throw error;
                setTasks(data || []);
            } catch (error) {
                console.error('Error loading tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, [user, session, isUserLoaded, isSessionLoaded]);

    // Crear una nueva tarea
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !session || !taskName.trim()) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .insert([{
                    name: taskName,
                    user_id: user.id,
                    organization_id: organization?.id
                }]);

            if (error) throw error;

            // Actualizar la lista de tareas
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id);

            setTasks(data || []);
            setTaskName('');
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    if (!isUserLoaded || !isSessionLoaded) {
        return <div className="tasks-container">Cargando...</div>;
    }

    if (!user) {
        return <div className="tasks-container">Por favor inicia sesión para ver tus tareas.</div>;
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setUploadMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        if (!user?.id) {
            setUploadMessage({ type: 'error', message: 'Debes iniciar sesión para subir archivos' });
            return;
        }

        setUploading(true);
        setUploadMessage(null);

        try {
            // Crear un nombre de archivo único
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${organization?.id}/dishes/${fileName}`;

            const { error } = await supabase
                .storage
                .from('plateroom-images')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Obtener la URL pública de la imagen subida
            const { data: { publicUrl } } = supabase
                .storage
                .from('plateroom-images')
                .getPublicUrl(filePath);

            console.log('URL pública de la imagen:', publicUrl);
            
            setUploadMessage({ type: 'success', message: '¡Archivo subido exitosamente!' });
            
            // Limpiar el input de archivo
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setSelectedFile(null);
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            setUploadMessage({ 
                type: 'error', 
                message: error instanceof Error ? error.message : 'Error al subir el archivo' 
            });
        } finally {
            setUploading(false);
        }
    };

    // Configurar WebSocket
    useEffect(() => {
        if (!user) return;

        // Token de autenticación para la edge function
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
        
        // URL de la edge function WebSocket
        const wsUrl = 'http://127.0.0.1:64321/functions/v1/room-websocket';
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket conectado');
            setWs(socket);
            setWsMessages(prev => [...prev, 'Conectado al servidor WebSocket']);
        };

        socket.onmessage = (event) => {
            console.log('Mensaje recibido:', event.data);
            setWsMessages(prev => [...prev, `Servidor: ${event.data}`]);
        };

        socket.onclose = () => {
            console.log('WebSocket desconectado');
            setWs(null);
            setWsMessages(prev => [...prev, 'Desconectado del servidor WebSocket']);
        };

        socket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            setWsMessages(prev => [...prev, `Error: ${error}`]);
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
        setWsMessages(prev => [...prev, `Tú: ${wsMessage}`]);
        setWsMessage('');
    };

    return (
        <div className="tasks-container">
            <h2>Mis Tareas</h2>

            {/* Sección de WebSocket */}
            <div className="websocket-section" style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Chat WebSocket</h3>
                <div style={{ 
                    height: '200px', 
                    overflowY: 'auto', 
                    marginBottom: '10px', 
                    padding: '10px', 
                    border: '1px solid #eee',
                    borderRadius: '4px'
                }}>
                    {wsMessages.length === 0 ? (
                        <p>Conectando al servidor WebSocket...</p>
                    ) : (
                        wsMessages.map((msg, index) => (
                            <div key={index} style={{ margin: '5px 0' }}>{msg}</div>
                        ))
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={wsMessage}
                        onChange={(e) => setWsMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendWsMessage()}
                        placeholder="Escribe un mensaje..."
                        style={{ flex: 1, padding: '8px' }}
                        disabled={!ws || ws.readyState !== WebSocket.OPEN}
                    />
                    <button
                        onClick={sendWsMessage}
                        disabled={!ws || ws.readyState !== WebSocket.OPEN || !wsMessage.trim()}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: ws && ws.readyState === WebSocket.OPEN ? '#4CAF50' : '#cccccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: ws && ws.readyState === WebSocket.OPEN ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Enviar
                    </button>
                </div>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    Estado: {!ws ? 'Desconectado' : ws.readyState === WebSocket.OPEN ? 'Conectado' : 'Conectando...'}
                </div>
            </div>

            <div className="upload-section" style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Subir Imagen</h3>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="file-upload"
                    />
                    <label 
                        htmlFor="file-upload"
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '10px'
                        }}
                    >
                        {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                    </label>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: selectedFile && !uploading ? '#4CAF50' : '#cccccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {uploading ? 'Subiendo...' : 'Subir Imagen'}
                    </button>
                </div>
                {uploadMessage && (
                    <div style={{
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: uploadMessage.type === 'success' ? '#e6f7e6' : '#ffebee',
                        borderLeft: `4px solid ${uploadMessage.type === 'success' ? '#4CAF50' : '#f44336'}`,
                        borderRadius: '4px'
                    }}>
                        {uploadMessage.message}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="task-form">
                <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Nueva tarea"
                    required
                    disabled={loading}
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Agregar Tarea'}
                </button>
            </form>

            {loading ? (
                <p>Cargando tareas...</p>
            ) : tasks.length === 0 ? (
                <p>No hay tareas. ¡Agrega una para comenzar!</p>
            ) : (
                <ul className="task-list">
                    {tasks.map((task) => (
                        <li key={task.id} className="task-item">
                            {task.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
