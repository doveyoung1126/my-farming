// components/newdashboard/DashboardActions.tsx
'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ActionModal } from '@/components/common/ActionModal';

export function DashboardActions() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleActionSelect = (action: 'addActivity' | 'addFinancial' | 'addPlot') => {
        setIsModalOpen(false);
        // TODO: 根据选择的动作导航到相应的表单或打开新的模态框
        console.log('Selected action:', action);
    };

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
                onSelectAction={handleActionSelect} 
            />
        </>
    );
}