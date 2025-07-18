// components/features/records/forms/EditFinancialRecordForm.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { RecordWithDetails, RecordCategoryType } from '@/lib/types';
import { updateFinancialRecordAction } from '@/lib/actions';
import { useEffect, useRef, useState } from 'react';

interface EditFinancialRecordFormProps {
    record: RecordWithDetails;
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

    const initialRecordType = recordCategoryTypes.find(t => t.id === record.type.id);

    // --- 正确的、健-壮的日期处理 ---

    // 1. 创建一个函数，用于将 Date 对象格式化为 "YYYY-MM-DD"
    function formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        // getMonth() 返回 0-11，所以要 +1。padStart 确保月份是两位数，例如 "05"
        const month = String(date.getMonth() + 1).padStart(2, '0');
        // padStart 确保日期是两位数，例如 "09"
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 2. 将从服务器来的 UTC 时间转换为本地 Date 对象
    const localDate = new Date(record.date);

    // 3. 使用我们的新函数来初始化 state，确保格式正确
    const [localDatePart, setLocalDatePart] = useState(formatDateForInput(localDate));

    // 4. toTimeString() 很好，但为了安全，我们也可以手动构建时间部分
    const localTimePart = localDate.toTimeString().split(' ')[0]; // "HH:mm:ss"

    // 5. 组合并创建最终的 ISO 字符串
    // 注意：直接用 localDatePart 和 localTimePart 组合，因为它们都来自同一个 localDate 对象
    const isoDate = new Date(`${localDatePart}T${localTimePart}`).toISOString();

    return (
        <form ref={formRef} action={formAction} className="space-y-4 p-4">
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

            <input type="hidden" name="recordId" value={record.id} />
            <input type="hidden" name="isoDate" value={isoDate} />

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
                <label htmlFor="recordTypeId" className="block text-sm font-medium text-gray-700">财务类型 <span className="text-red-500">*</span></label>
                <select
                    id="recordTypeId"
                    name="recordTypeId"
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
                <label htmlFor="localDatePart" className="block text-sm font-medium text-gray-700">日期 <span className="text-red-500">*</span></label>
                <input
                    type="date"
                    id='localDatePart'
                    value={localDatePart}
                    onChange={(e) => setLocalDatePart(e.target.value)}
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