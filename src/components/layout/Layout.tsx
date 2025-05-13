import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout = () => {
    return (
        <>
            <div className="drawer">
                <div className="drawer-content flex flex-col">

                    {/* Navbar */}
                    <Header />

                    {/* Page content */}
                    <main className='p-4'>
                        <Outlet />
                    </main>

                    {/* Footer */}
                    {/* FOOTER */}

                </div>
            </div>
        </>
    );
};
