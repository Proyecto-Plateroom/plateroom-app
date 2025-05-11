import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton, OrganizationSwitcher } from '@clerk/clerk-react';
import { useState } from 'react';
import './Header.css';

export const Header = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header>
            <div className="header-container">
                <div className="logo-container">
                    <Link to="/" className="logo">
                        <span className="logo-text">Plate</span>
                        <span className="logo-highlight">Room</span>
                    </Link>
                </div>

                <button 
                    className={`mobile-menu-button ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>


                <div className={`nav-container ${mobileMenuOpen ? 'open' : ''}`}>
                    <nav>
                        <SignedIn>
                            <Link to="/" className={`nav-link ${isActive('/')}`}>
                                Inicio
                            </Link>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                                Dashboard
                            </Link>
                        </SignedIn>
                    </nav>


                    <div className="auth-buttons">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="sign-in-button">Iniciar sesión</button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="user-controls">
                                <OrganizationSwitcher 
                                    hidePersonal 
                                    appearance={{
                                        elements: {
                                            organizationSwitcherTrigger: 'org-switcher-trigger'
                                        }
                                    }}
                                />
                                <UserButton />
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </div>
        </header>
    );
};
