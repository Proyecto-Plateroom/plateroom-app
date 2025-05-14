import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route
                    path="/dashboard"
                    element={
                        <>
                            <SignedIn>
                                <Dashboard />
                            </SignedIn>
                            <SignedOut>
                                <Navigate to="/" />
                            </SignedOut>
                        </>
                    }
                />
                <Route
                    path="/tasks"
                    element={
                        <>
                            <SignedIn>
                                <Tasks />
                            </SignedIn>
                            <SignedOut>
                                <Navigate to="/" />
                            </SignedOut>
                        </>
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
}
