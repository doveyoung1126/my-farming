// components/common/ConfirmationModal.tsx
'use client';

import { X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    error?: string | null;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = '确认',
    cancelText = '取消',
    isLoading = false,
    error = null,
}: ConfirmationModalProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div
            className={`
                fixed inset-0 z-50 flex items-center justify-center
                transition-opacity duration-300 ease-out
                ${isVisible ? 'opacity-100 bg-gray-900/75' : 'opacity-0 pointer-events-none'}
            `}
            onClick={onClose}
        >
            <div
                className={`
                    bg-white rounded-lg w-full max-w-sm p-6 shadow-lg
                    transform transition-transform duration-300 ease-out
                    ${isVisible ? 'scale-100' : 'scale-95'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="text-gray-600 text-sm mb-6">
                    {children}
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:bg-red-300"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
