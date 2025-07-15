// components/features/records/forms/EditFinancialRecordForm.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { FinancialWithActivity, RecordCategoryType } from '@/lib/types';
import { updateFinancialRecordAction } from '@/lib/actions';
import { useEffect, useRef, useState } from 'react';

interface EditFinancialRecordFormProps {
    record: FinancialWithActivity;
    recordCategoryTypes: RecordCategoryType[];
    onClose: () => void;
}

export function EditFinancialRecordForm({
    record,
    recordCategoryTypes,
    onClose,
}: EditFinancialRecordFormProps) {

    const { pending } = useFormStatus();

    function SubmitButton() {
        return (
            <button
                type="submit"
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={pending}
            >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                保存记录
            </button>
        );
    }

    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Server Action
    const formAction = async (formData: FormData) => {
        const result = await updateFinancialRecordAction(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setError(null);
            onClose();
        }
    };

    const initialRecordType = recordCategoryTypes.find(t => t.name === record.recordType);
    const originalTime = new Date(record.date).toISOString().split('T')[1]; // 提取时间部分
    console.log('originalTime', originalTime)

    return (
        <form ref={formRef} action={formAction} className="space-y-4 p-4">
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

            <input type="hidden" name="recordId" value={record.id} />
            <input type="hidden" name="time" value={originalTime} /> {/* 添加隐藏的时间字段 */}
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">金额 <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    defaultValue={record.amount.toString()}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：-50.00 (支出) 或 100.00 (收入)"
                    step="0.01"
                    required
                />
            </div>

            <div>
                <label htmlFor="recordCategoryId" className="block text-sm font-medium text-gray-700">财务类型 <span className="text-red-500">*</span></label>
                <select
                    id="recordCategoryId"
                    name="recordCategoryId"
                    defaultValue={initialRecordType ? initialRecordType.id.toString() : ''}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    required
                >
                    <option value="">请选择财务类型</option>
                    {recordCategoryTypes.map(type => (
                        <option key={type.id} value={type.id.toString()}>{type.name} ({type.category === 'income' ? '收入' : '支出'})</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">日期 <span className="text-red-500">*</span></label>
                <input
                    type="date"
                    id="date"
                    name="date"
                    defaultValue={new Date(record.date).toISOString().split('T')[0]}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                />
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">描述 (可选)</label>
                <input
                    type="text"
                    id="notes"
                    name="notes"
                    defaultValue={record.description || ''}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：购买种子"
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={pending}
                >
                    取消
                </button>
                <SubmitButton />
            </div>
        </form>
    );
}
