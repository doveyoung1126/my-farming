// components/features/activities/forms/DeleteActivityConfirmation.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ActivityWithFinancials } from '@/lib/types';

interface DeleteActivityConfirmationProps {
    activity: ActivityWithFinancials;
    onClose: () => void;
}

export function DeleteActivityConfirmation({ activity, onClose }: DeleteActivityConfirmationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/activities/${activity.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '删除失败');
            }
            onClose();
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <ConfirmationModal
            isOpen={true}
            onClose={onClose}
            onConfirm={handleDelete}
            title="确认删除"
            isLoading={isLoading}
            error={error}
        >
            <p>您确定要删除这项农事活动吗？</p>
            <div className="mt-2 p-2 bg-gray-100 rounded-md text-sm">
                <p><strong>地块:</strong> {activity.plotName}</p>
                <p><strong>类型:</strong> {activity.type}</p>
                <p><strong>日期:</strong> {new Date(activity.date).toLocaleDateString()}</p>
            </div>
            <p className="mt-2 text-xs text-red-600">删除此活动将同时删除其所有关联的财务记录。此操作无法撤销。</p>
        </ConfirmationModal>
    );
}
