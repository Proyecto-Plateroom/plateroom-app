import { useUser } from '@clerk/clerk-react';
import './Dashboard.css';

function Dashboard() {
    const { user } = useUser();
    
    // Formatear la fecha de último inicio
    const formatLastLogin = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="dashboard">
            <h2>Panel de Control</h2>
            
            <div className="dashboard-content">
                <div className="dashboard-card welcome-card">
                    <h3>Bienvenido, {user?.firstName || 'Usuario'}</h3>
                    <p>¡Es genial verte de nuevo en PlateRoom! Aquí tienes un resumen de tu cuenta.</p>
                    <div className="last-login">
                        Último inicio: {formatLastLogin(new Date())}
                    </div>
                </div>
                
                <div className="dashboard-card">
                    <h3>Información de la Cuenta</h3>
                    <div className="info-item">
                        <strong>Nombre completo:</strong>
                        <p>{user?.fullName || 'No disponible'}</p>
                    </div>
                    <div className="info-item">
                        <strong>Correo electrónico:</strong>
                        <p>{user?.primaryEmailAddress?.emailAddress || 'No disponible'}</p>
                    </div>
                    <div className="info-item">
                        <strong>Miembro desde:</strong>
                        <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'No disponible'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
