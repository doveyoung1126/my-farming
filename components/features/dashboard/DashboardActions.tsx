// components/newdashboard/DashboardActions.tsx
'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ActionModal } from '@/components/ui/ActionModal';
import { ActivityType, PrismaPlots, RecordCategoryType } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function DashboardActions({ activityTypes, plots, recordCategoryTypes }: {
    activityTypes: ActivityType[];
    plots: PrismaPlots[];
    recordCategoryTypes: RecordCategoryType[];
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
            >
                <Plus className="w-5 h-5" />
                快捷操作
            </button>

            <ActionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                activityTypes={activityTypes}
                plots={plots}
                recordCategoryTypes={recordCategoryTypes}
                routerRefresh={router.refresh}
            />
        </>
    );
}