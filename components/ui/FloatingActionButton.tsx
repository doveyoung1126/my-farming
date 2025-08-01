// components/ui/FloatingActionButton.tsx
'use client';

import { Plus } from 'lucide-react';

interface FabProps {
  onClick: () => void;
  'aria-label': string;
}

export function FloatingActionButton({ onClick, 'aria-label': ariaLabel }: FabProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center justify-center z-30 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
    >
      <Plus className="h-7 w-7" />
    </button>
  );
}
