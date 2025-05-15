import { useState, useEffect } from 'react';
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
                    .select('*')
                    .eq('organization_id', organization?.id);

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

    return (
        <div className="tasks-container">
            <h2>Mis Tareas</h2>

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
