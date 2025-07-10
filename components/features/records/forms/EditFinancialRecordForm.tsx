// components/records/forms/EditFinancialRecordForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FinancialWithActivity, RecordCategoryType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export interface EditFinancialRecordPayload {
    amount: number;
    recordTypeId: number;
    date: Date;
    description: string | null;
}

interface EditFinancialRecordFormProps {
    record: FinancialWithActivity;
    recordCategoryTypes: RecordCategoryType[];
}

export function EditFinancialRecordForm({
    record,
    recordCategoryTypes,
}: EditFinancialRecordFormProps) {

    // --- 内部状态管理 ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [amount, setAmount] = useState(record.amount.toString());
    const [recordTypeId, setRecordTypeId] = useState(''); // 初始化为空
    const [date, setDate] = useState(new Date(record.date).toISOString().split('T')[0]);
    const [description, setDescription] = useState(record.description || '');

    // --- Hooks for URL management ---
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- 正确的初始化逻辑 ---
    useEffect(() => {
        if (record && recordCategoryTypes.length > 0) {
            const type = recordCategoryTypes.find(t => t.name === record.recordType);
            if (type) {
                setRecordTypeId(type.id.toString());
            }
        }
    }, [record, recordCategoryTypes]);

    // --- URL清理函数 ---
    const clearUrlAndClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('editRecord');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // --- 内部提交逻辑 ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const payload: EditFinancialRecordPayload = {
            amount: parseFloat(amount),
            recordTypeId: parseInt(recordTypeId),
            date: new Date(date),
            description: description || null,
        };

        try {
            const response = await fetch(`/api/records/${record.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '更新失败');
            }

            router.refresh();
            clearUrlAndClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">金额 <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：-50.00 (支出) 或 100.00 (收入)"
                    step="0.01"
                    required
                />
            </div>

            <div>
                <label htmlFor="recordType" className="block text-sm font-medium text-gray-700">财务类型 <span className="text-red-500">*</span></label>
                <select
                    id="recordType"
                    value={recordTypeId}
                    onChange={(e) => setRecordTypeId(e.target.value)}
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
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述 (可选)</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：购买种子"
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={clearUrlAndClose} // 直接调用内部函数
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    取消
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    保存记录
                </button>
            </div>
        </form>
    );
}
