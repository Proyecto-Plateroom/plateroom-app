import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton, OrganizationSwitcher } from '@clerk/clerk-react';

export const Header = () => {
    const location = useLocation();
    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <header className="navbar bg-base-300 w-full px-5">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
            <div className="flex-none md:hidden">
                <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
                icon
                </label>
            </div>

            <Link to="/" className="mr-auto">
                <h1>
                    <span className="text-base-content">Plate</span>
                    <span className="text-blue-400">Room</span>
                </h1>
            </Link>

                <div className="hidden flex-none md:block">
                    {/* Navbar menu content */}
                    <HeaderLinks css="menu menu-horizontal" isActive={isActive} />
                </div>

                <div className="drawer-side">
                    {/* Side navbar menu content */}
                    <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
                    <HeaderLinks css="menu bg-base-200 min-h-full w-80 p-4" isActive={isActive} />
                </div>

                <div className="auth-buttons flex gap-2">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="sign-in-button">Iniciar sesión</button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <OrganizationSwitcher hidePersonal />
                        <UserButton />
                    </SignedIn>
                </div>


        </header>
    );
};

interface HeaderLinkProps {
    css: string;
    isActive: (path: string) => string;
}

function HeaderLinks({ css, isActive }: HeaderLinkProps) {
    return (
        <ul className={css}>
            <SignedIn>
                <li>
                    <Link to="/" className={`nav-link ${isActive('/')}`}>
                        Inicio
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                        Dashboard
                    </Link>
                </li>
            </SignedIn>

        </ul>
    );
}
