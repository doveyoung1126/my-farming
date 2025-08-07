'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ActivityType, Plot, RecordCategoryType, ActivityInCycle, Cycle } from '@/lib/types';
import { Plus, Minus, Loader2, AlertTriangle } from 'lucide-react';
import { updateActivityAction } from '@/lib/actions';

// --- 1. Props 接口只接收 ID 和回调 ---
interface EditActivityFormProps {
    activityId: number;
    onClose: () => void;
}

interface FinancialRecordForm {
    id?: number;
    amount: string;
    recordTypeId: string;
    description: string;
    date: string;
    originalTime?: string;
}

// --- SWR 返回的数据类型 ---
interface EditFormData {
    activity: ActivityInCycle;
    cycle: Cycle
    plots: Plot[];
    activityTypes: ActivityType[];
    recordCategoryTypes: RecordCategoryType[];
}

export function EditActivityForm({ activityId, onClose }: EditActivityFormProps) {
    // --- 2. 引入 SWR 获取数据，并将 isLoading 重命名避免冲突 ---
    const { data, error, isLoading: isDataLoading } = useSWR<EditFormData>(`/api/activities/${activityId}/edit-data`);

    // --- 3. 完整保留你原有的内部状态管理 ---
    const [isLoading, setIsLoading] = useState(false); // 用于提交状态
    const [formError, setFormError] = useState<string | null>(null);
    const [activityTypeId, setActivityTypeId] = useState('');
    const [date, setDate] = useState('');
    const [originalTime, setOriginalTime] = useState('');
    const [crop, setCrop] = useState('');
    const [budget, setBudget] = useState('');
    const [records, setRecords] = useState<FinancialRecordForm[]>([]);
    const [showFinancials, setShowFinancials] = useState(false);
    const [recordIdsToDelete, setRecordIdsToDelete] = useState<number[]>([]); // 假设需要这个来跟踪删除

    // --- 4. 修改 useEffect，依赖 SWR 的 data 来初始化表单 ---
    useEffect(() => {
        if (data?.activity) {
            const { activity, recordCategoryTypes: allRecordTypes } = data;
            setActivityTypeId(activity.type.id.toString());
            const initialDate = new Date(activity.date);
            setDate(formatDateForInput(initialDate));
            setOriginalTime(initialDate.toTimeString().split(' ')[0]);
            setCrop(activity.crop || '');
            setBudget(data.cycle?.budget?.toString() || '');
            setShowFinancials(activity.records.length > 0);

            if (activity.records.length > 0 && allRecordTypes.length > 0) {
                const mappedRecords = activity.records.map(rec => ({
                    id: rec.id,
                    amount: rec.amount.toString(),
                    recordTypeId: rec.type.id.toString(),
                    description: rec.description || '',
                    date: formatDateForInput(new Date(rec.date)),
                    originalTime: new Date(rec.date).toTimeString().split(' ')[0],
                }));
                setRecords(mappedRecords);
            }
        }
    }, [data]);

    // --- 日期格式化辅助函数 (保留) ---
    function formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- 5. 完整保留你原有的提交逻辑 ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError(null);

        const formData = new FormData(e.target as HTMLFormElement);
        const isoDate = new Date(`${date}T${originalTime}`).toISOString();
        formData.set('isoDate', isoDate);

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
        formData.set('recordIdsToDelete', JSON.stringify(recordIdsToDelete));

        const result = await updateActivityAction(activityId, formData);

        if (result?.error) {
            setFormError(result.error);
            setIsLoading(false);
        } else {
            setFormError(null);
            setIsLoading(false);
            onClose();
        }
    };

    // --- 其他辅助逻辑 (保留) ---
    const handleAddRecord = () => {
        setRecords([...records, { id: Date.now() + Math.random(), amount: '', recordTypeId: '', description: '', date: date }]);
    };

    const handleRemoveRecord = (index: number) => {
        const recordToRemove = records[index];
        if (recordToRemove.id) {
            setRecordIdsToDelete([...recordIdsToDelete, recordToRemove.id]);
        }
        setRecords(records.filter((_, i) => i !== index));
    };

    const handleRecordChange = (index: number, field: keyof FinancialRecordForm, value: string) => {
        const newRecords = [...records];
        newRecords[index] = { ...newRecords[index], [field]: value };
        setRecords(newRecords);
    };

    // --- 6. 顶层错误处理 ---
    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3" />
                <div><p className="font-semibold">加载失败</p><p className="text-sm">无法加载编辑数据，请稍后重试。</p></div>
            </div>
        );
    }

    // --- 7. 安全解构数据 ---
    const { activity, plots, activityTypes, recordCategoryTypes } = data || {};
    const selectedActivityType = activityTypes?.find(type => type.id === parseInt(activityTypeId));
    const showBudgetField = selectedActivityType?.cycleMarker === 'START';

    // --- 8. 渐进式渲染表单 ---
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-16">
            {formError && <div className="text-red-500 bg-red-50 p-3 rounded-md">{formError}</div>}

            <div>
                <label htmlFor="activityTypeId" className="block text-sm font-medium text-gray-700">活动类型 <span className="text-red-500">*</span></label>
                <select
                    id="activityTypeId"
                    name="activityTypeId"
                    value={activityTypeId}
                    onChange={(e) => setActivityTypeId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    required
                    disabled={isDataLoading}
                >
                    <option value="" disabled>{isDataLoading ? '加载中...' : '请选择活动类型'}</option>
                    {activityTypes?.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="plot" className="block text-sm font-medium text-gray-700">地块 <span className="text-red-500">*</span></label>
                <input
                    id="plot"
                    type="text"
                    value={activity?.plot.name || '加载中...'}
                    className="mt-1 block w-full bg-gray-100 pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md"
                    readOnly
                />
                <input type="hidden" name="plotId" value={activity ? activity.plotId : ''} />
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
                    disabled={isDataLoading}
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
                    disabled={isDataLoading}
                />
            </div>

            {showBudgetField && (
                <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">预算 (可选)</label>
                    <input
                        type="number"
                        id="budget"
                        name="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="例如：1000.00"
                        step="0.01"
                        disabled={isDataLoading}
                    />
                </div>
            )}

            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-3">
                    <input
                        type="checkbox"
                        id="show-financials"
                        checked={showFinancials}
                        onChange={(e) => setShowFinancials(e.target.checked)}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        disabled={isDataLoading}
                    />
                    <label htmlFor="show-financials" className="ml-2 text-sm font-medium text-gray-900">关联财务记录</label>
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
                                        disabled={isDataLoading}
                                    >
                                        <option value="">请选择财务类型</option>
                                        {recordCategoryTypes?.map(type => (
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
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`recordDate-${index}`} className="block text-xs font-medium text-gray-700">记录日期 (可选)</label>
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

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isLoading} // 使用你自己的提交状态
                >
                    取消
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    disabled={isLoading} // 使用你自己的提交状态
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    保存活动
                </button>
            </div>
        </form>
    );
}