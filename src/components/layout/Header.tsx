import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton, OrganizationSwitcher } from '@clerk/clerk-react';
import HamburgerIcon from '@/svg/HamburgerIcon';
import { useRef } from 'react';

export const Header = () => {
    const location = useLocation();
    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <header className="navbar bg-base-300 w-full ">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
            <div className="flex-none md:hidden">
                <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
                <HamburgerIcon />
                </label>
            </div>

            <Link to="/" className="mr-auto">
            {/* <img src="/plateroom_logo.png" className='h-15' alt="" /> */}
                <h1>
                    <span className="text-base-content">Plate</span>
                    <span className="text-blue-400">Room</span>
                </h1>
            </Link>

                <div className="hidden flex-none md:block">
                    {/* Navbar menu content */}
                    <HeaderLinks className="menu menu-horizontal" isActive={isActive} />
                </div>

                <div className="drawer-side md:hidden">
                    {/* Side navbar menu content */}
                    <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
                    <HeaderLinks className="menu bg-base-200 min-h-full w-80 p-4" isActive={isActive} />
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
    className: string;
    isActive: (path: string) => string;
}

function HeaderLinks({ className, isActive }: HeaderLinkProps) {
    const detailsRef = useRef<HTMLDetailsElement>(null);

    return (
        <>
            <SignedIn>
                <ul className={className}>
                    <li>
                        <Link to="/" className={`nav-link ${isActive('/')}`}>
                            Inicio
                        </Link>
                    </li>
                    <li>
                        <details className='relative' ref={detailsRef}>
                            <summary>Manager</summary>
                            <ul className="w-60 md:absolute md:top-5 md:right-0 md:bg-base-200 z-50">
                                <li>
                                    <Link to="/manager/menu" className={`nav-link ${isActive('/menu')}`} onClick={() => detailsRef.current?.removeAttribute('open')}>
                                        Menús
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/manager/dish" className={`nav-link ${isActive('/dish')}`} onClick={() => detailsRef.current?.removeAttribute('open')}>
                                        Platos
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/manager/dish-category" className={`nav-link ${isActive('/dish-category')}`} onClick={() => detailsRef.current?.removeAttribute('open')}>
                                        Categorías de platos
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/manager/table" className={`nav-link ${isActive('/table')}`} onClick={() => detailsRef.current?.removeAttribute('open')}>
                                        Mesas
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>
                </ul>
            </SignedIn>
        </>
    );
}
