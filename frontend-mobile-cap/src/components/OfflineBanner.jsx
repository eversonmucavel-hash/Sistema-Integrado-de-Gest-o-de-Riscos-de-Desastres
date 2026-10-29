import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-14 left-0 right-0 z-[1000] bg-yellow-500 text-white px-4 py-2 flex items-center justify-center gap-2 shadow-md">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-semibold">
                Sem ligação — a mostrar dados em cache
            </span>
        </div>
    );
}