import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Test from './pages/Test/Test';

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
                    path="/test"
                    element={
                        <>
                            <SignedIn>
                                <Test />
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
