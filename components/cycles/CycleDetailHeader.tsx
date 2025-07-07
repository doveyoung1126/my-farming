// components/cycles/CycleDetailHeader.tsx
'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CycleDetailHeader({ plotName, crop, startDate, endDate }: {
    plotName: string;
    crop: string | null;
    startDate: Date;
    endDate: Date | null;
}) {
    const router = useRouter();

    return (
        <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center">
            <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
                <h1 className="text-xl font-bold text-gray-800">{plotName} - {crop}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {startDate.toLocaleDateString()} - {endDate ? endDate.toLocaleDateString() : '进行中'}
                </p>
            </div>
        </header>
    );
}