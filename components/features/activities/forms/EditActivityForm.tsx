// components/features/activities/forms/EditActivityForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { ActivityType, Plot, RecordCategoryType, ActivityInCycle } from '@/lib/types';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { updateActivityAction } from '@/lib/actions'; // 1. 导入 Server Action

// --- Props 接口 ---
interface EditActivityFormProps {
    activityTypes: ActivityType[];
    plots: Plot[];
    recordCategoryTypes: RecordCategoryType[];
    initialActivity: ActivityInCycle;
    cycleBudget?: number | null
    onClose: () => void; // 2. 添加 onClose
}

interface FinancialRecordForm {
    id?: number;
    amount: string;
    recordTypeId: string;
    description: string;
    date: string;
    originalTime?: string; // 添加可选的原始时间字段
}

export function EditActivityForm({
    activityTypes,
    plots,
    recordCategoryTypes,
    initialActivity,
    onClose,
    cycleBudget
}: EditActivityFormProps) {

    // --- 日期格式化辅助函数 ---
    function formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- 内部状态管理 (保留) ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activityTypeId, setActivityTypeId] = useState('');
    // 使用辅助函数安全地初始化日期状态
    const [date, setDate] = useState(formatDateForInput(new Date(initialActivity.date)));
    // 存储原始的时间部分，以便在提交时保留
    const originalTime = new Date(initialActivity.date).toTimeString().split(' ')[0];
    const plotId = initialActivity.plotId.toString()
    const [crop, setCrop] = useState(initialActivity.crop || '');
    const [budget, setBudget] = useState(cycleBudget?.toString() || '');
    const [records, setRecords] = useState<FinancialRecordForm[]>([]);
    const [showFinancials, setShowFinancials] = useState(initialActivity.records.length > 0);

    // 定义 isoDate
    const isoDate = new Date(`${date}T${originalTime}`).toISOString()

    // --- 初始化表单 (保留) ---
    useEffect(() => {
        const type = activityTypes.find(t => t.id === initialActivity.type.id);
        if (type) {
            setActivityTypeId(type.id.toString());
        }

        if (initialActivity.records.length > 0 && recordCategoryTypes.length > 0) {
            const mappedRecords = initialActivity.records.map(rec => {
                const recordType = recordCategoryTypes.find(t => t.id === rec.type.id);
                return {
                    id: rec.id,
                    amount: rec.amount.toString(),
                    recordTypeId: recordType ? recordType.id.toString() : '',
                    description: rec.description || '',
                    date: formatDateForInput(new Date(rec.date)),
                    originalTime: new Date(rec.date).toTimeString().split(' ')[0], // 保存原始时间
                };
            });
            setRecords(mappedRecords);
        }
    }, [initialActivity, activityTypes, recordCategoryTypes]);

    // 3. 修改 handleSubmit，调用 Server Action
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.target as HTMLFormElement);

        const recordsPayload = showFinancials ? records.map(rec => {
            const recordTime = rec.originalTime || originalTime;
            return {
                id: rec.id,
                amount: parseFloat(rec.amount),
                recordTypeId: parseInt(rec.recordTypeId),
                description: rec.description || null,
                date: new Date(`${rec.date}T${recordTime}`).toISOString(),
            };
        }) : [];

        formData.set('records', JSON.stringify(recordsPayload));

        const result = await updateActivityAction(initialActivity.id, formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            setError(null);
            setIsLoading(false);
            onClose();
        }
    };

    // --- 其他辅助逻辑 (保留) ---
    const selectedActivityType = activityTypes.find(type => type.id === parseInt(activityTypeId));
    const showBudgetField = selectedActivityType?.cycleMarker === 'START';

    useEffect(() => {
        if (plotId) {
            const selectedPlot = plots.find(p => p.id === parseInt(plotId));
            if (selectedPlot?.crop) {
                setCrop(selectedPlot.crop);
            } else {
                setCrop('');
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

    return (
        // 4. form 的 onSubmit 指向新的 handleSubmit
        <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-16">
            {error && <div className="text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}

            {/* 活动基本信息 */}
            <div>
                <label htmlFor="activityType" className="block text-sm font-medium text-gray-700">活动类型 <span className="text-red-500">*</span></label>
                <select
                    id="activityType"
                    name="activityTypeId"
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
                <input
                    id="plot"
                    type="text"
                    value={initialActivity.plot.name}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    readOnly
                />
                <input type="hidden" name="plotId" value={plotId} />
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
                <input type='hidden' name='isoDate' value={isoDate} />
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
                    onClick={onClose} // 5. 取消按钮调用 onClose
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
                    保存活动
                </button>
            </div>
        </form>
    );
}
