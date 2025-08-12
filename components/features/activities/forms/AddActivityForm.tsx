'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import useSWR from 'swr';
import { ActivityType, Plot, RecordCategoryType } from '@/lib/types';
import { createActivityAction } from '@/lib/actions';
import { Loader2, Plus, Minus, AlertTriangle } from 'lucide-react';

interface AddActivityFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

interface FinancialRecordForm {
    amount: string;
    recordTypeId: string;
    description: string;
    date: string;
}

interface FormData {
    plots: Plot[];
    activityTypes: ActivityType[];
    recordCategoryTypes: RecordCategoryType[];
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
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:bg-emerald-400"
            disabled={pending}
        >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            保存活动
        </button>
    );
}

export function AddActivityForm({ onSuccess, onCancel }: AddActivityFormProps) {
    const { data, error, isLoading } = useSWR<FormData>('/api/activities/form-data');
    const [state, formAction] = useActionState(createActivityAction, initialState);

    // --- 日期格式化辅助函数 ---
    function formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const [activityTypeId, setActivityTypeId] = useState('');
    const [plotId, setPlotId] = useState('');
    const [crop, setCrop] = useState('');
    const [date, setDate] = useState(formatDateForInput(new Date()));
    const [records, setRecords] = useState<FinancialRecordForm[]>([]);
    const [showFinancials, setShowFinancials] = useState(false);

    const selectedActivityType = data?.activityTypes.find(type => type.id === parseInt(activityTypeId));
    const showBudgetField = selectedActivityType?.cycleMarker === 'START';

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    useEffect(() => {
        if (plotId && data?.plots) {
            const selectedPlot = data.plots.find(p => p.id === parseInt(plotId));
            setCrop(selectedPlot?.crop || '');
        } else {
            setCrop('');
        }
    }, [plotId, data?.plots]);

    useEffect(() => {
        // When hiding the financial section, clear the records
        if (!showFinancials) {
            setRecords([]);
        } else if (records.length === 0) {
            // When showing it for the first time, add one default record
            setRecords([{ amount: '', recordTypeId: '', description: '', date: date }]);
        }
    }, [showFinancials, date]);


    const handleAddRecord = () => {
        setRecords([...records, { amount: '', recordTypeId: '', description: '', date: date }]);
    };

    const handleRemoveRecord = (index: number) => {
        setRecords(records.filter((_, i) => i !== index));
    };

    const handleRecordChange = (index: number, field: keyof FinancialRecordForm, value: string) => {
        const newRecords = [...records];
        newRecords[index] = { ...newRecords[index], [field]: value };
        setRecords(newRecords);
    };

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3" />
                <div>
                    <p className="font-semibold">加载失败</p>
                    <p className="text-sm">无法加载所需数据，请稍后重试。</p>
                </div>
            </div>
        );
    }


    const { plots, activityTypes, recordCategoryTypes } = data || {};

    return (
        <form action={formAction} className="space-y-4 p-4">
            {state.error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <p>{state.error}</p>
                </div>
            )}

            {/* 活动基本信息 */}
            <div>
                <label htmlFor="activityTypeId" className="block text-sm font-medium text-gray-700">活动类型 <span className="text-red-500">*</span></label>
                <select
                    id="activityTypeId"
                    name="activityTypeId"
                    value={activityTypeId}
                    onChange={(e) => setActivityTypeId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    required
                    disabled={isLoading}
                >
                    <option value="" disabled>请选择活动类型</option>
                    {activityTypes && activityTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="plotId" className="block text-sm font-medium text-gray-700">地块 <span className="text-red-500">*</span></label>
                <select
                    id="plotId"
                    name="plotId"
                    value={plotId}
                    onChange={(e) => setPlotId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    required
                    disabled={isLoading}
                >
                    <option value="" disabled>请选择地块</option>
                    {plots && plots.map(plot => (
                        <option key={plot.id} value={plot.id}>{plot.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">日期 <span className="text-red-500">*</span></label>
                <input
                    type="date"
                    id="date"
                    name="date"
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
                    name="crop"
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
                        name="budget"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="例如：1000.00"
                        step="0.01"
                    />
                </div>
            )}

            {/* 关联财务记录 */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-3">
                    <input
                        type="checkbox"
                        id="show-financials"
                        checked={showFinancials}
                        onChange={(e) => setShowFinancials(e.target.checked)}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="show-financials" className="ml-2 text-sm font-medium text-gray-900">关联财务记录 (可选)</label>
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
                                        inputMode="decimal"
                                        id={`amount-${index}`}
                                        name={`records[${index}][amount]`}
                                        value={Math.abs(Number(record.amount)) || ''}
                                        onChange={(e) => handleRecordChange(index, 'amount', e.target.value)}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        placeholder="例如： 50.00 "
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`recordType-${index}`} className="block text-xs font-medium text-gray-700">财务类型 <span className="text-red-500">*</span></label>
                                    <select
                                        id={`recordType-${index}`}
                                        name={`records[${index}][recordTypeId]`}
                                        value={record.recordTypeId}
                                        onChange={(e) => handleRecordChange(index, 'recordTypeId', e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                                        required
                                        disabled={isLoading}
                                    >
                                        <option value="">请选择财务类型</option>
                                        {recordCategoryTypes && recordCategoryTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name} ({type.category === 'income' ? '收入' : '支出'})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor={`description-${index}`} className="block text-xs font-medium text-gray-700">描述 (可选)</label>
                                    <input
                                        type="text"
                                        id={`description-${index}`}
                                        name={`records[${index}][description]`}
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
                                        name={`records[${index}][date]`}
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
                <SubmitButton />
            </div>
        </form>
    );
}