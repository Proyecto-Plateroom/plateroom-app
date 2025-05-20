import { SignedIn, SignedOut } from '@clerk/clerk-react';
import OrderManager from './OrderManager/OrderManager';

function Home() {
    return (
        <div className="home">
            <div className="home-content">
                <SignedIn>
                    <OrderManager />
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
