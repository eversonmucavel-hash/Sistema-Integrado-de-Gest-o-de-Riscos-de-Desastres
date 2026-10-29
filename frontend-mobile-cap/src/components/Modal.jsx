import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[2000]"
            onClick={onClose}
        >
            <div
                className={`bg-white w-full ${sizes[size]} sm:rounded-xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header do modal */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                    <h2 className="text-base font-bold text-gray-800 truncate">{title}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Conteúdo scrollável */}
                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}