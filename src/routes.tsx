import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import App from './App';
import Home from './pages/Home';
// import Test from './pages/Test/Test';
import MenuManager from './pages/MenuManagement/MenuManager';
import Room from './pages/Room/Room';
// import OrderManager from './pages/OrderManager/OrderManager';
import NotFound from './pages/NotFound/NotFound';
import DishManager from './pages/DishManagement/DishManager';
import DishCategoryManager from './pages/DishCategoryManagement/DishCategoryManager';
import TableManager from './pages/TableManagement/TableManager';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" >

                <Route path="/" element={<App />} >
                    <Route index element={<Home />} />
                </Route>

                <Route path="/manager" element={<App />} >
                    {/* <Route path="/dashboard" element={ProtectedRoute({ children: <OrderManager /> })}/> */}
                    <Route path="/manager/menu" element={ProtectedRoute({ children: <MenuManager/> })} />
                    <Route path="/manager/dish" element={ProtectedRoute({ children: <DishManager/> })} />
                    <Route path="/manager/dish-category" element={ProtectedRoute({ children: <DishCategoryManager/> })} />
                    <Route path="/manager/table" element={ProtectedRoute({ children: <TableManager/> })} />
                    {/* <Route path="/test" element={ProtectedRoute({ children: <Test /> })} /> */}
                </Route>

                <Route path="/rooms/:order_uuid" element={<Room />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
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
