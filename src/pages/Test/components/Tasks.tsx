import { useState, useEffect } from 'react';
import { useUser, useOrganization } from '@clerk/clerk-react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

interface Task {
    id: number;
    name: string;
    user_id: string;
    created_at: string;
}

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [taskName, setTaskName] = useState('');
    const { user, isLoaded: isUserLoaded } = useUser();
    const { organization } = useOrganization();

    const supabase = useSupabaseClient();

    // Cargar tareas
    useEffect(() => {
        if (!isUserLoaded || !user) return;

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
    }, [user, isUserLoaded, supabase]);

    // Crear una nueva tarea
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !taskName.trim()) return;

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

    if (!isUserLoaded) {
        return <div>Cargando tareas...</div>;
    }

    if (!user) {
        return <div>Por favor inicia sesión para ver tus tareas.</div>;
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Nueva tarea"
                    className="flex-1 p-2 border rounded"
                />
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!taskName.trim()}
                >
                    Añadir
                </button>
            </form>

            {loading ? (
                <p>Cargando tareas...</p>
            ) : (
                <ul className="space-y-2">
                    {tasks.map((task) => (
                        <li key={task.id} className="p-3 bg-gray-50 rounded border">
                            {task.name}
                        </li>
                    ))}
                    {tasks.length === 0 && <p>No hay tareas. ¡Añade una para comenzar!</p>}
                </ul>
            )}
        </div>
    );
}
