import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import './Layout.css';

export const Layout = () => {
    return (
        <>
            <Header />
            <div className="app">
                <main>
                    <Outlet />
                </main>
            </div>
        </>
    );
};
