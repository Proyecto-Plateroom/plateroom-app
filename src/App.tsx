import { OrganizationSwitcher, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import './App.css'

function App() {
    return (
        <div className="app">
            <header>
                <h1>Bienvenido a PlateRoom</h1>
                <div className="auth-buttons">
                    <SignedOut>
                        <SignInButton mode="modal" />
                    </SignedOut>
                    <SignedIn>
                        <OrganizationSwitcher hidePersonal />
                        <UserButton />
                    </SignedIn>
                </div>
            </header>

            <main>
                <SignedIn>
                    <h2>¡Bienvenido a tu aplicación!</h2>
                    <p>Has iniciado sesión correctamente.</p>
                </SignedIn>
                <SignedOut>
                    <h2>Por favor inicia sesión</h2>
                    <p>Haz clic en el botón de arriba para iniciar sesión o registrarte.</p>
                </SignedOut>
            </main>
        </div>
    )
}

export default App
