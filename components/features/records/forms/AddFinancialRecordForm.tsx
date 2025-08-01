// components/features/records/forms/AddFinancialRecordForm.tsx
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { RecordCategoryType } from '@/lib/types';
import { createFinancialRecordAction } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

interface AddFinancialRecordFormProps {
    recordCategoryTypes: RecordCategoryType[];
    onSuccess: () => void;
    onCancel: () => void;
}

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
        type="submit" 
        className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
        disabled={pending}
    >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        保存记录
    </button>
  );
}

export function AddFinancialRecordForm({ recordCategoryTypes, onSuccess, onCancel }: AddFinancialRecordFormProps) {
    const [state, formAction] = useActionState(createFinancialRecordAction, initialState);

    // --- 日期格式化辅助函数 ---
    function formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4 p-4">
            {state.error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <p>{state.error}</p>
                </div>
            )}

            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">金额 <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：-50.00 (支出) 或 100.00 (收入)"
                    step="0.01"
                    required
                />
            </div>

            <div>
                <label htmlFor="recordTypeId" className="block text-sm font-medium text-gray-700">财务类型 <span className="text-red-500">*</span></label>
                <select
                    id="recordTypeId"
                    name="recordTypeId"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    required
                    defaultValue=""
                >
                    <option value="" disabled>请选择财务类型</option>
                    {recordCategoryTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name} ({type.category === 'income' ? '收入' : '支出'})</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">日期 <span className="text-red-500">*</span></label>
                <input
                    type="date"
                    id="date"
                    name="date"
                    defaultValue={formatDateForInput(new Date())}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述 (可选)</label>
                <input
                    type="text"
                    id="description"
                    name="description"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：购买办公用品"
                />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    取消
                </button>
                <SubmitButton />
            </div>
        </form>
    );
}
