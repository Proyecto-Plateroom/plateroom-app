import { SignedIn, SignedOut } from '@clerk/clerk-react';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <div className="home-content">
                <SignedIn>
                    <h2>¡Bienvenido a PlateRoom!</h2>
                    <p>Has iniciado sesión correctamente. Navega al dashboard para comenzar.</p>
                </SignedIn>
                <SignedOut>
                    <h2>Bienvenido a PlateRoom</h2>
                    <p>Por favor inicia sesión para acceder al contenido.</p>
                </SignedOut>
            </div>
        </div>
    );
}

export default Home;
