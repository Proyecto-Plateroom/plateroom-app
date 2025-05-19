import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Test from './pages/Test/Test';
import MenuManager from './pages/MenuManagement/MenuManager';
import Room from './pages/Room/Room';
import OrderManager from './pages/OrderManager/OrderManager';
import NotFound from './pages/NotFound/NotFound';
import DishManager from './pages/DishManagement/DishManager';
import DishCategoryManager from './pages/DishCategoryManagement/DishCategoryManager';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="/dashboard" element={ProtectedRoute({ children: <Dashboard /> })}/>
                <Route path="/menu-manager" element={ProtectedRoute({ children: <MenuManager/> })} />
                <Route path="/dish-manager" element={ProtectedRoute({ children: <DishManager/> })} />
                <Route path="/dish-category-manager" element={ProtectedRoute({ children: <DishCategoryManager/> })} />
                <Route path="/test" element={ProtectedRoute({ children: <Test /> })} />
                <Route path="/order-manager" element={ProtectedRoute({ children: <OrderManager /> })} />
            </Route>
            <Route path="/rooms/:order_uuid" element={<Room />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SignedIn>{children}</SignedIn>
            <SignedOut>
                <Navigate to="/" />
            </SignedOut>
        </>
    );
}
