import QRCode from 'qrcode'
import { useEffect, useState } from 'react';
import Loading from './Loading';

export default function QR({ url, width = 300

 }: { url: string, width?: number }) {
    const [qrCode, setQrCode] = useState<string | null>(null);

    useEffect(() => {

        QRCode.toDataURL(url, {
            width: width,
            margin: 1,
            color: {
                dark: '#000',
                light: '#FFF'
            }
        })
        .then((dataUrl) => {
            setQrCode(dataUrl);
        })
        .catch((err) => {
            console.error('Error generating QR code:', err);
            setQrCode(null);
        });
    }, [])

    return (
        <Loading active={!qrCode} text='Generating QR Code'>
            <img src={qrCode as string} alt="QR Code" />
        </Loading>
    );
}
