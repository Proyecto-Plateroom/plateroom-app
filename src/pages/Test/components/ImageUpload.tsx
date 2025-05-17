import { useState, useRef, type ChangeEvent } from 'react';
import { useUser, useOrganization } from '@clerk/clerk-react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

export default function ImageUpload() {
    const { user } = useUser();
    const { organization } = useOrganization();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supabase = useSupabaseClient();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setUploadMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        if (!user?.id) {
            setUploadMessage({ type: 'error', message: 'Debes iniciar sesión para subir archivos' });
            return;
        }

        setUploading(true);
        setUploadMessage(null);

        try {
            // Crear un nombre de archivo único
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${organization?.id}/dishes/${fileName}`;

            const { error } = await supabase
                .storage
                .from('plateroom-images')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Obtener la URL pública de la imagen subida
            const { data: { publicUrl } } = supabase
                .storage
                .from('plateroom-images')
                .getPublicUrl(filePath);

            console.log('URL pública de la imagen:', publicUrl);
            
            setUploadMessage({ type: 'success', message: '¡Archivo subido exitosamente!' });
            
            // Limpiar el input de archivo
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setSelectedFile(null);
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            setUploadMessage({ 
                type: 'error', 
                message: error instanceof Error ? error.message : 'Error al subir el archivo' 
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                    {selectedFile ? selectedFile.name : 'Selecciona una imagen'}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                    {selectedFile ? 'Listo para subir' : 'Arrastra o haz clic para seleccionar'}
                </p>
            </div>

            {selectedFile && (
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        Eliminar
                    </button>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`w-full py-2 px-4 rounded-md text-white ${!selectedFile || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
                {uploading ? 'Subiendo...' : 'Subir imagen'}
            </button>

            {uploadMessage && (
                <div className={`p-3 rounded-md ${
                    uploadMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {uploadMessage.message}
                </div>
            )}
        </div>
    );
}
