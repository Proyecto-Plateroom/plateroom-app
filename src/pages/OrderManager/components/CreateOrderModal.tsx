import { useState } from 'react';
import type { Menu } from '../types';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    menus: Menu[];
    onSubmit: (menuId: string) => void;
}

export function CreateOrderModal({ isOpen, onClose, menus, onSubmit }: CreateOrderModalProps) {
    const [selectedMenu, setSelectedMenu] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMenu) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit(selectedMenu);
            setSelectedMenu('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Nuevo Pedido</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                        disabled={isSubmitting}
                        title="Cerrar"
                    >
                        ✕
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="menu" className="block text-sm font-medium text-gray-700 mb-1">
                            Seleccionar Menú
                        </label>
                        <select
                            id="menu"
                            value={selectedMenu}
                            onChange={(e) => setSelectedMenu(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            required
                            disabled={isSubmitting || menus.length === 0}
                        >
                            <option value="">Selecciona un menú</option>
                            {menus.map((menu) => (
                                <option key={menu.id} value={menu.id}>
                                    {menu.name}
                                </option>
                            ))}
                        </select>
                        {menus.length === 0 && (
                            <p className="mt-1 text-sm text-red-600">
                                No hay menús disponibles. Crea un menú primero.
                            </p>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ${
                                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            disabled={isSubmitting || !selectedMenu}
                        >
                            {isSubmitting ? 'Creando...' : 'Crear Pedido'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
