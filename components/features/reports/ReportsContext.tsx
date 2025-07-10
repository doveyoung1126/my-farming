'use client';

import { createContext } from 'react';
import { ActivityWithFinancials, FinancialWithActivity, PrismaPlots, RecordCategoryType, ActivityType } from '@/lib/types';

// 定义 Context 中要共享的数据和函数的类型
export interface ReportsContextType {
    // --- Activity Edit States & Functions ---
    isEditActivityModalOpen: boolean;
    activityToEdit: ActivityWithFinancials | null;
    openEditActivityModal: (activity: ActivityWithFinancials) => void;
    closeEditActivityModal: () => void;
    handleConfirmEditActivity: (data: any) => Promise<void>;

    // --- Financial Record Edit States & Functions ---
    isEditRecordModalOpen: boolean;
    recordToEdit: FinancialWithActivity | null;
    openEditRecordModal: (record: FinancialWithActivity) => void;
    closeEditRecordModal: () => void;
    handleConfirmEditRecord: (data: any) => Promise<void>;

    // --- Financial Record Delete States & Functions ---
    isDeleteConfirmOpen: boolean;
    recordToDelete: FinancialWithActivity | null;
    openDeleteRecordConfirm: (record: FinancialWithActivity) => void;
    closeDeleteRecordConfirm: () => void;
    handleConfirmDeleteRecord: () => Promise<void>;

    // --- Shared Raw Data ---
    plots: PrismaPlots[];
    activityTypes: ActivityType[];
    recordCategoryTypes: RecordCategoryType[];
}

// 创建 Context，并提供一个默认值 null
export const ReportsContext = createContext<ReportsContextType | null>(null);
