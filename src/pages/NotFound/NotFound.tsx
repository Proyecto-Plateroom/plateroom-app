import { SignedIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
                <p className="text-gray-600 mb-6">
                    La página que buscas no existe o ha sido movida.
                </p>

                <SignedIn>
                    <Link to="/" className="text-blue-500 hover:underline">
                        Vuelve al inicio
                    </Link>
                </SignedIn>

            </div>
        </div>
    );
}
