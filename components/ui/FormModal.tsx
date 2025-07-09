// components/common/FormModal.tsx
'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function FormModal({ isOpen, onClose, title, children }: FormModalProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300); // Corresponds to close animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div
            className={`
                fixed inset-0 z-50 flex items-end justify-center
                transition-opacity duration-300 ease-out
                ${isVisible ? 'opacity-100 bg-gray-900/75' : 'opacity-0 pointer-events-none'}
            `}
            onClick={onClose}
        >
            <div
                className={`
                    bg-white rounded-t-xl w-full max-w-md shadow-lg
                    transform transition-transform duration-300 ease-out
                    ${isVisible ? 'translate-y-0' : 'translate-y-full'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
