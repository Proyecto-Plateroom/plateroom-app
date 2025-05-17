import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import MenuManager from './pages/MenuManagement/MenuManager';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="/dashboard" element={ProtectedRoute({ children: <Dashboard /> })}/>
                <Route path="/menu-manager" element={ProtectedRoute({ children: <MenuManager/> })} />
                <Route path="/tasks" element={ProtectedRoute({ children: <Tasks /> })} />
                <Route path="*" element={<Navigate to="/" />} />
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
