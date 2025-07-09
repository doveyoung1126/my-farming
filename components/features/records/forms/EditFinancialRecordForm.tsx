// components/forms/EditFinancialRecordForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { FinancialWithActivity, RecordCategoryType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// 定义表单提交的数据结构
export interface EditFinancialRecordPayload {
    amount: number;
    recordTypeId: number;
    date: string;
    description: string;
}

interface EditFinancialRecordFormProps {
    record: FinancialWithActivity;
    recordCategoryTypes: RecordCategoryType[];
    onSubmit: (data: EditFinancialRecordPayload) => void;
    onCancel: () => void;
    isLoading: boolean;
    error: string | null;
}

export function EditFinancialRecordForm({ record, recordCategoryTypes, onSubmit, onCancel, isLoading, error }: EditFinancialRecordFormProps) {
    const [amount, setAmount] = useState(record.amount.toString());
    const [recordTypeId, setRecordTypeId] = useState('');
    const [date, setDate] = useState(new Date(record.date).toISOString().split('T')[0]);
    const [description, setDescription] = useState(record.description || '');

    useEffect(() => {
        // 当 record 或 recordCategoryTypes 变化时，重新查找并设置 recordTypeId
        const type = recordCategoryTypes.find(t => t.name === record.recordType);
        if (type) {
            setRecordTypeId(type.id.toString());
        }
    }, [record, recordCategoryTypes]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: EditFinancialRecordPayload = {
            amount: parseFloat(amount),
            recordTypeId: parseInt(recordTypeId, 10),
            date: date,
            description: description,
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

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
                        <option key={type.id} value={type.id}>{type.name} ({type.category === 'income' ? '收入' : '支出'})</option>
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
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                >
                    取消
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    保存更改
                </button>
            </div>
        </form>
    );
}
