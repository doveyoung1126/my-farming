'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ReportsContext, ReportsContextType } from './ReportsContext';
import { ActivityWithFinancials, PrismaPlots, RecordCategoryType, ActivityType, FinancialWithActivity } from '@/lib/types';
import { FormModal } from '../../ui/FormModal';
import { EditActivityForm } from '../activities/forms/EditActivityForm';
import { EditFinancialRecordForm } from '../records/forms/EditFinancialRecordForm'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

// 定义 Provider 组件的 props 类型
interface ReportsProviderProps {
    children: React.ReactNode; // 这是 React 的一个标准类型，代表任何可以被渲染的东西
    initialData: {
        plots: PrismaPlots[];
        activityTypes: ActivityType[];
        recordCategoryTypes: RecordCategoryType[];
    };
}

export function ReportsProvider({ children, initialData }: ReportsProviderProps) {
    const router = useRouter();

    // --- 状态管理 ---
    // 这部分逻辑我们从 ReportsClient 搬过来
    const [isEditActivityModalOpen, setIsEditActivityModalOpen] = useState(false);
    const [activityToEdit, setActivityToEdit] = useState<ActivityWithFinancials | null>(null);
    const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState<FinancialWithActivity | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // New state for delete confirmation
    const [recordToDelete, setRecordToDelete] = useState<FinancialWithActivity | null>(null); // New state for record to delete
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- 操作函数定义 ---

    // 打开编辑模态框
    const openEditActivityModal = useCallback((activity: ActivityWithFinancials) => {
        setActivityToEdit(activity);
        setIsEditActivityModalOpen(true);
        setError(null);
    }, []);

    // 关闭编辑模态框
    const closeEditActivityModal = useCallback(() => {
        setActivityToEdit(null);
        setIsEditActivityModalOpen(false);
    }, []);

    // 提交编辑表单 (这就是你说的 submit 函数)
    const handleConfirmEditActivity = useCallback(async (data: any) => {
        if (!activityToEdit) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/activities/${activityToEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '更新农事活动失败');
            }

            // 成功后关闭模态框并刷新页面数据
            closeEditActivityModal();
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activityToEdit, router, closeEditActivityModal]);

    // 打开编辑财务记录模态框
    const openEditRecordModal = useCallback((record: FinancialWithActivity) => {
        setRecordToEdit(record);
        setIsEditRecordModalOpen(true);
        setError(null);
    }, []);

    // 关闭编辑财务记录模态框
    const closeEditRecordModal = useCallback(() => {
        setRecordToEdit(null);
        setIsEditRecordModalOpen(false);
    }, []);

    // 提交编辑财务记录表单
    const handleConfirmEditRecord = useCallback(async (data: any) => {
        if (!recordToEdit) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/records/${recordToEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '更新财务记录失败');
            }

            closeEditRecordModal();
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [recordToEdit, router, closeEditRecordModal]);

    // 打开删除确认模态框
    const openDeleteRecordConfirm = useCallback((record: FinancialWithActivity) => {
        setRecordToDelete(record);
        setIsDeleteConfirmOpen(true);
        setError(null);
    }, []);

    // 关闭删除确认模态框
    const closeDeleteRecordConfirm = useCallback(() => {
        setRecordToDelete(null);
        setIsDeleteConfirmOpen(false);
    }, []);

    // 确认删除财务记录
    const handleConfirmDeleteRecord = useCallback(async () => {
        if (!recordToDelete) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/records/${recordToDelete.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '删除失败');
            }
            closeDeleteRecordConfirm();
            router.refresh(); // 刷新数据
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [recordToDelete, router, closeDeleteRecordConfirm]);

    // --- 准备要共享出去的值 ---
    const contextValue: ReportsContextType = {
        isEditActivityModalOpen,
        activityToEdit,
        openEditActivityModal,
        closeEditActivityModal,
        handleConfirmEditActivity,
        isEditRecordModalOpen,
        recordToEdit,
        openEditRecordModal,
        closeEditRecordModal,
        handleConfirmEditRecord,
        isDeleteConfirmOpen,
        recordToDelete,
        openDeleteRecordConfirm,
        closeDeleteRecordConfirm,
        handleConfirmDeleteRecord,
        plots: initialData.plots,
        activityTypes: initialData.activityTypes,
        recordCategoryTypes: initialData.recordCategoryTypes,
    };


    // ... (rest of the file is the same until the return statement)

    return (
        <ReportsContext.Provider value={contextValue}>
            {children}

            {/* We render the modal here, controlled by the state within this provider */}
            {activityToEdit && (
                <FormModal
                    isOpen={isEditActivityModalOpen}
                    onClose={closeEditActivityModal}
                    title="编辑农事活动"
                >
                    <EditActivityForm
                        initialActivity={activityToEdit}
                        activityTypes={contextValue.activityTypes}
                        plots={contextValue.plots}
                        recordCategoryTypes={contextValue.recordCategoryTypes}
                        onSubmit={handleConfirmEditActivity}
                        onCancel={closeEditActivityModal}
                        isLoading={isLoading}
                        error={error}
                    />
                </FormModal>
            )}

            {/* Edit Record Modal */}
            {recordToEdit && (
                <FormModal
                    isOpen={isEditRecordModalOpen}
                    onClose={closeEditRecordModal}
                    title="编辑财务记录"
                >
                    <EditFinancialRecordForm
                        record={recordToEdit}
                        recordCategoryTypes={contextValue.recordCategoryTypes}
                        onSubmit={handleConfirmEditRecord}
                        onCancel={closeEditRecordModal}
                        isLoading={isLoading}
                        error={error}
                    />
                </FormModal>
            )}

            {/* Deletion Confirmation Modal for Records */}
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={closeDeleteRecordConfirm}
                onConfirm={handleConfirmDeleteRecord}
                title="确认删除财务记录"
                confirmText="删除"
                isLoading={isLoading}
                error={error}
            >
                <p>您确定要删除这笔财务记录吗？</p>
                {recordToDelete && <p className="mt-2 font-bold text-gray-800">{recordToDelete.description || recordToDelete.recordType} (¥{recordToDelete.amount.toLocaleString()})</p>}
                <p className="mt-2 text-xs text-gray-500">此操作无法撤销。</p>
            </ConfirmationModal>
        </ReportsContext.Provider>
    );
}
