// components/features/records/forms/DeleteRecordConfirmation.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { RecordWithDetails } from '@/lib/types';

interface DeleteRecordConfirmationProps {
    record: RecordWithDetails;
    onClose: () => void;
}

export function DeleteRecordConfirmation({ record, onClose }: DeleteRecordConfirmationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/records/${record.id}`, {
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
            // Only set loading to false on error, as the component will unmount on success
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
            <p>您确定要删除这条财务记录吗？</p>
            <div className="mt-2 p-2 bg-gray-100 rounded-md text-sm">
                <p><strong>类型:</strong> {record.type.name}</p>
                <p><strong>金额:</strong> ¥{record.amount}</p>
                <p><strong>日期:</strong> {new Date(record.date).toLocaleDateString()}</p>
                {record.description && <p><strong>描述:</strong> {record.description}</p>}
            </div>
            <p className="mt-2 text-xs text-red-600">此操作无法撤销。</p>
        </ConfirmationModal>
    );
}