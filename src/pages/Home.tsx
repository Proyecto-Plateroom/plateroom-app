import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import OrderManager from './OrderManager/OrderManager';
import { useEffect } from 'react';

function Home() {
    useEffect(() => {
        document.querySelector('main')?.classList.remove('p-4');
    }, []);
    const thingi = [
        {
            icon: '📱',
            title: 'Interfaz Intuitiva',
            description: 'Diseño limpio y fácil de usar para una experiencia sin complicaciones.'
        },
        {
            icon: '⚡',
            title: 'Tiempo Real',
            description: 'Actualizaciones en tiempo real para una gestión eficiente de pedidos.'
        },
        {
            icon: '🔒',
            title: 'Seguro',
            description: 'Autenticación segura y protección de datos para tu negocio.'
        },
        {
            icon: '📊',
            title: 'Estadísticas',
            description: 'Sigue el rendimiento de tu restaurante con métricas detalladas.'
        }
    ];

    return (
        <div className="min-h-screen bg-base-100 w-full overflow-x-hidden">
            <SignedIn>
                <OrderManager />
            </SignedIn>
            <SignedOut>
                {/* Hero Section */}
                <div className="hero bg-gradient-to-br from-blue-50 to-base-100 -m-4">
                    <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-none px-4 md:px-8 lg:px-16 py-12">
                    <div className="text-center lg:text-left lg:pl-12">
                        <div className="flex justify-center lg:justify-start mb-8">
                        <img 
                            src="/plateroom_logo.png" 
                            alt="PlateRoom Logo" 
                            className="max-w-xs md:max-w-md"
                        />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                        Controla tu restaurante de forma <span className="text-blue-500">sencilla</span>
                        </h1>
                        <p className="py-6 text-lg text-gray-600">
                        PlateRoom es la solución todo en uno para la gestión de pedidos en restaurantes.
                        Optimiza tu servicio, mejora la experiencia de tus clientes y simplifica la gestión de mesas.
                        </p>

                        {/* Demo Access Card */}
                        <div className="card w-full max-w-md bg-base-100 shadow-xl mt-8 mx-auto lg:mx-0">
                        <div className="card-body">
                            <h2 className="card-title text-2xl text-blue-600">¡Prueba la demo!</h2>
                            <div className="divider my-2"></div>
                            <p className="text-gray-700">
                            Para acceder a la versión demo, utiliza las siguientes credenciales:
                            </p>
                            <div className="bg-base-200 p-4 rounded-lg mt-4">
                            <div className="flex items-center mb-2">
                                <span className="font-semibold w-24">Usuario:</span>
                                <span className="bg-base-300 px-3 py-1 rounded">midu</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Contraseña:</span>
                                <span className="bg-base-300 px-3 py-1 rounded">miduplateroom</span>
                            </div>
                            </div>
                            <div className="card-actions justify-center mt-6">
                            <SignInButton mode="modal">
                                <button className="btn btn-primary px-8">
                                Iniciar sesión
                                </button>
                            </SignInButton>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 lg:mt-0">
                        {thingi.map((feature, index) => (
                        <div key={index} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                            <div className="card-body p-6">
                            <div className="text-4xl mb-3">{feature.icon}</div>
                            <h3 className="card-title text-xl">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="footer items-center p-4 bg-neutral text-neutral-content">
                    <aside className="items-center grid-flow-col">
                    <img src="/plateroom_logo.png" alt="PlateRoom Logo" className="h-8" />
                    <p>{new Date().getFullYear()} PlateRoom</p>
                    </aside> 
                </footer>
            </SignedOut>
        </div>
    )
}

export default Home;
