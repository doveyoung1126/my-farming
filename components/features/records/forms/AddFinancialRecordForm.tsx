// components/forms/AddFinancialRecordForm.tsx
'use client';

import { useState } from 'react';
import { RecordCategoryType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AddFinancialRecordFormProps {
    recordCategoryTypes: RecordCategoryType[];
    onSubmit: (data: any) => void; // Use 'any' for now, will define specific payload type later if needed
    onCancel: () => void;
    isLoading: boolean;
    error: string | null;
}

export function AddFinancialRecordForm({ recordCategoryTypes, onSubmit, onCancel, isLoading, error }: AddFinancialRecordFormProps) {
    // --- 日期格式化辅助函数 ---
    function formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const [amount, setAmount] = useState('');
    const [recordTypeId, setRecordTypeId] = useState('');
    const [date, setDate] = useState(formatDateForInput(new Date()));
    const originalTime = new Date().toTimeString().split(' ')[0]; // 获取当前时间作为默认时间
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            amount: parseFloat(amount),
            recordTypeId: parseInt(recordTypeId),
            date: new Date(`${date}T${originalTime}`).toISOString(), // 组合日期和时间
            description: description || null,
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            

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