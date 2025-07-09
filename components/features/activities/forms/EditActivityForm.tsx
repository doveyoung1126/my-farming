// components/forms/EditActivityForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { ActivityType, PrismaPlots, RecordCategoryType, ActivityWithFinancials } from '@/lib/types';
import { Plus, Minus, Loader2 } from 'lucide-react';

interface EditActivityFormProps {
    activityTypes: ActivityType[];
    plots: PrismaPlots[];
    recordCategoryTypes: RecordCategoryType[];
    onSubmit: (data: any) => void; // Use 'any' for now, will define specific payload type later if needed
    onCancel: () => void;
    isLoading: boolean;
    error: string | null;
    initialActivity: ActivityWithFinancials; // Add initialActivity prop
}

interface FinancialRecordForm {
    id?: number; // Add id for existing records
    amount: string;
    recordTypeId: string;
    description: string;
    date: string;
}

export function EditActivityForm({ activityTypes, plots, recordCategoryTypes, onSubmit, onCancel, isLoading, error, initialActivity }: EditActivityFormProps) {
    const [activityTypeId, setActivityTypeId] = useState(''); // Initialize as empty string
    const [date, setDate] = useState(initialActivity.date.toISOString().split('T')[0]);
    const [plotId, setPlotId] = useState(initialActivity.plotId.toString());
    const [crop, setCrop] = useState(initialActivity.crop || '');
    const [budget, setBudget] = useState(initialActivity.budget?.toString() || '');
    const [records, setRecords] = useState<FinancialRecordForm[]>([]); // Initialize as empty array, will be populated by useEffect
    const [showFinancials, setShowFinancials] = useState(initialActivity.records.length > 0); // Show financials if there are existing records

    // Effect to set initial activityTypeId based on name
    useEffect(() => {
        const type = activityTypes.find(t => t.name === initialActivity.type);
        if (type) {
            setActivityTypeId(type.id.toString());
        }
    }, [initialActivity.type, activityTypes]);

    // Effect to set initial recordTypeIds for financial records based on name
    useEffect(() => {
        // Do not map records until the category types are loaded.
        if (recordCategoryTypes.length === 0) {
            // If there are records but no types to map them, wait.
            // If there are no records, ensure the form state is empty.
            if (initialActivity.records.length === 0) {
                setRecords([]);
            }
            return;
        }

        const mappedRecords = initialActivity.records.map(rec => {
            const recordType = recordCategoryTypes.find(t => t.name === rec.recordType);
            return {
                id: rec.id,
                amount: rec.amount.toString(),
                recordTypeId: recordType ? recordType.id.toString() : '', // Find ID by name
                description: rec.description || '',
                date: rec.date.toISOString().split('T')[0],
            };
        });
        setRecords(mappedRecords);
    }, [initialActivity.records, recordCategoryTypes]);

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
        setRecords([...records, { id: Date.now() + Math.random(), amount: '', recordTypeId: '', description: '', date: date }]);
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
            id: initialActivity.id, // Include activity ID for update
            activityTypeId: parseInt(activityTypeId), // Ensure it's a number
            date: new Date(date), // Convert to Date object
            plotId: parseInt(plotId), // Ensure it's a number
            crop: crop || null,
            budget: showBudgetField && budget ? parseFloat(budget) : null,
            records: showFinancials ? records.map(rec => ({
                id: rec.id, // Include ID for existing/new records
                amount: parseFloat(rec.amount),
                recordTypeId: parseInt(rec.recordTypeId),
                description: rec.description || null,
                date: new Date(rec.date), // Convert to Date object
            })) : [],
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
                        <option key={type.id} value={type.id.toString()}>{type.name}</option>
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
                            <div key={record.id || index} className="p-3 border border-gray-200 rounded-md space-y-2">
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
                                            <option key={type.id} value={type.id.toString()}>{type.name} ({type.category === 'income' ? '收入' : '支出'})</option>
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