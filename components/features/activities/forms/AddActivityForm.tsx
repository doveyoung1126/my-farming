// components/forms/AddActivityForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { ActivityType, PrismaPlots, RecordCategoryType } from '@/lib/types';
import { Plus, Minus, Loader2 } from 'lucide-react';

interface AddActivityFormProps {
    activityTypes: ActivityType[];
    plots: PrismaPlots[];
    recordCategoryTypes: RecordCategoryType[];
    onSubmit: (data: any) => void; // Use 'any' for now, will define specific payload type later if needed
    onCancel: () => void;
    isLoading: boolean;
    error: string | null;
}

interface FinancialRecordForm {
    amount: string;
    recordTypeId: string;
    description: string;
    date: string;
    originalTime?: string; // 添加可选的原始时间字段
}

export function AddActivityForm({ activityTypes, plots, recordCategoryTypes, onSubmit, onCancel, isLoading, error }: AddActivityFormProps) {
    // --- 日期格式化辅助函数 ---
    function formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const [activityTypeId, setActivityTypeId] = useState('');
    const [date, setDate] = useState(formatDateForInput(new Date()));
    const originalTime = new Date().toTimeString().split(' ')[0]; // 获取当前时间作为默认时间
    const [plotId, setPlotId] = useState('');
    const [crop, setCrop] = useState('');
    const [budget, setBudget] = useState('');
    const [records, setRecords] = useState<FinancialRecordForm[]>([{ amount: '', recordTypeId: '', description: '', date: formatDateForInput(new Date()), originalTime: originalTime }]);
    const [showFinancials, setShowFinancials] = useState(false);

    // 根据选择的活动类型，判断是否显示预算字段
    const selectedActivityType = activityTypes.find(type => type.id === parseInt(activityTypeId));
    const showBudgetField = selectedActivityType?.cycleMarker === 'START';

    // 自动填充作物字段
    useEffect(() => {
        if (plotId) {
            const selectedPlot = plots.find(p => p.id === parseInt(plotId));
            if (selectedPlot?.crop) {
                setCrop(selectedPlot.crop);
            } else {
                setCrop(''); // 如果地块没有作物，则清空
            }
        }
    }, [plotId, plots]);

    const handleAddRecord = () => {
        setRecords([...records, { amount: '', recordTypeId: '', description: '', date: date, originalTime: originalTime }]);
    };

    const handleRemoveRecord = (index: number) => {
        setRecords(records.filter((_, i) => i !== index));
    };

    const handleRecordChange = (index: number, field: keyof FinancialRecordForm, value: string) => {
        const newRecords = [...records];
        newRecords[index] = { ...newRecords[index], [field]: value };
        setRecords(newRecords);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            activityTypeId: activityTypeId,
            date: new Date(`${date}T${originalTime}`).toISOString(), // 组合日期和时间
            plotId: plotId,
            crop: crop || null,
            budget: showBudgetField && budget ? parseFloat(budget) : null,
            records: showFinancials ? records.map(rec => {
                const recordTime = rec.originalTime || originalTime; // 使用记录自己的时间或主活动时间
                return {
                    ...rec,
                    amount: parseFloat(rec.amount),
                    recordTypeId: parseInt(rec.recordTypeId),
                    date: new Date(`${rec.date}T${recordTime}`).toISOString(), // 组合日期和时间
                };
            }) : [],
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            

            {/* 活动基本信息 */}
            <div>
                <label htmlFor="activityType" className="block text-sm font-medium text-gray-700">活动类型 <span className="text-red-500">*</span></label>
                <select
                    id="activityType"
                    value={activityTypeId}
                    onChange={(e) => setActivityTypeId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    required
                >
                    <option value="">请选择活动类型</option>
                    {activityTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="plot" className="block text-sm font-medium text-gray-700">地块 <span className="text-red-500">*</span></label>
                <select
                    id="plot"
                    value={plotId}
                    onChange={(e) => setPlotId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    required
                >
                    <option value="">请选择地块</option>
                    {plots.map(plot => (
                        <option key={plot.id} value={plot.id}>{plot.name}</option>
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
                <label htmlFor="crop" className="block text-sm font-medium text-gray-700">作物 (可选)</label>
                <input
                    type="text"
                    id="crop"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：西红柿"
                />
            </div>

            {showBudgetField && (
                <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">预算 (可选，仅周期开始活动)</label>
                    <input
                        type="number"
                        id="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="例如：1000.00"
                        step="0.01"
                    />
                </div>
            )}

            {/* 关联财务记录 */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">关联财务记录 (可选)</h3>
                    <button 
                        type="button" 
                        onClick={() => setShowFinancials(!showFinancials)}
                        className="text-sm text-emerald-600 hover:text-emerald-800"
                    >
                        {showFinancials ? '隐藏' : '显示'}
                    </button>
                </div>

                {showFinancials && (
                    <div className="space-y-3">
                        {records.map((record, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded-md space-y-2">
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => handleRemoveRecord(index)} className="text-red-500 hover:text-red-700">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label htmlFor={`amount-${index}`} className="block text-xs font-medium text-gray-700">金额 <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        id={`amount-${index}`}
                                        value={record.amount}
                                        onChange={(e) => handleRecordChange(index, 'amount', e.target.value)}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        placeholder="例如：-50.00 (支出) 或 100.00 (收入)"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`recordType-${index}`} className="block text-xs font-medium text-gray-700">财务类型 <span className="text-red-500">*</span></label>
                                    <select
                                        id={`recordType-${index}`}
                                        value={record.recordTypeId}
                                        onChange={(e) => handleRecordChange(index, 'recordTypeId', e.target.value)}
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
                                    <label htmlFor={`description-${index}`} className="block text-xs font-medium text-gray-700">描述 (可选)</label>
                                    <input
                                        type="text"
                                        id={`description-${index}`}
                                        value={record.description}
                                        onChange={(e) => handleRecordChange(index, 'description', e.target.value)}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        placeholder="例如：购买种子"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`recordDate-${index}`} className="block text-xs font-medium text-gray-700">记录日期 (可选，默认同活动日期)</label>
                                    <input
                                        type="date"
                                        id={`recordDate-${index}`}
                                        value={record.date}
                                        onChange={(e) => handleRecordChange(index, 'date', e.target.value)}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddRecord} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-emerald-300 text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors">
                            <Plus className="w-4 h-4" /> 添加更多财务记录
                        </button>
                    </div>
                )}
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
                    保存活动
                </button>
            </div>
        </form>
    );
}