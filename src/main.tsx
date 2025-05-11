import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import './index.css';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key');
}

const router = (
    <BrowserRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
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
        </ClerkProvider>
    </BrowserRouter>
);

createRoot(document.getElementById('root')!).render(router);
