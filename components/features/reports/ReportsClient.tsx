// components/reports/ReportsClient.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityWithFinancials, FinancialWithActivity, PrismaPlots, RecordCategoryType, ActivityType } from '@/lib/types';
import { FinancialReportView } from './FinancialReportView';
import { ActivityLogView } from './ActivityLogView';
import { Calendar, ChevronDown } from 'lucide-react';
import { FormModal } from '../../ui/FormModal';
import { EditFinancialRecordForm } from '../records/forms/EditFinancialRecordForm';
import { EditActivityForm } from '../activities/forms/EditActivityForm';
import { UrlActionHandler } from '../../ui/UrlActionHandler'; // 1. 导入新组件

// --- 类型定义 ---
type View = 'financial' | 'activity';
type FinancialFilter = 'all' | 'income' | 'expense';
type ActivityFilter = number | 'all';
type DateFilter = 'month' | 'quarter' | 'year' | 'custom';

/**
 * 报告页面的客户端容器组件
 */
export function ReportsClient({ activities, records, plots, recordCategoryTypes, activityTypes }: {
    activities: ActivityWithFinancials[];
    records: FinancialWithActivity[];
    plots: PrismaPlots[];
    recordCategoryTypes: RecordCategoryType[];
    activityTypes: ActivityType[];
}) {
    // --- State管理 ---
    const [activeView, setActiveView] = useState<View>('financial');
    const [financialFilter, setFinancialFilter] = useState<FinancialFilter>('all');
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('month');
    const [customDate, setCustomDate] = useState({ start: '', end: '' });
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    // --- Async Operation State ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    // 2. 移除所有手动处理 URL 参数的逻辑
    // const pathname = usePathname();
    // const searchParams = useSearchParams();
    // const editActivityId = searchParams.get('editActivity');
    // const editRecordId = searchParams.get('editRecord');
    // const activityToEdit = useMemo(...);
    // const recordToEdit = useMemo(...);
    // const handleCloseModal = () => { ... };

    // --- 数据过滤逻辑 (这部分完全不受影响) ---
    const dateRange = useMemo(() => {
        const end = new Date();
        const start = new Date();
        switch (dateFilter) {
            case 'month': start.setDate(1); break;
            case 'quarter': start.setMonth(start.getMonth() - 3); break;
            case 'year': start.setFullYear(start.getFullYear() - 1); break;
            case 'custom': return { start: customDate.start ? new Date(customDate.start) : null, end: customDate.end ? new Date(customDate.end) : null };
        }
        return { start, end };
    }, [dateFilter, customDate]);

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const recordDate = new Date(r.date);
            const inDateRange = (!dateRange.start || recordDate >= dateRange.start) && (!dateRange.end || recordDate <= dateRange.end);
            const matchesCategory = financialFilter === 'all' || r.recordCategory === financialFilter;
            return inDateRange && matchesCategory;
        });
    }, [records, dateRange, financialFilter]);

    const filteredActivities = useMemo(() => {
        return activities.filter(a => {
            const activityDate = new Date(a.date);
            const inDateRange = (!dateRange.start || activityDate >= dateRange.start) && (!dateRange.end || activityDate <= dateRange.end);
            const matchesPlot = activityFilter === 'all' || a.plotId === activityFilter;
            return inDateRange && matchesPlot;
        });
    }, [activities, dateRange, activityFilter]);

    // --- 动态UI计算 (不受影响) ---
    const summary = useMemo(() => {
        return filteredRecords.reduce((acc, record) => {
            if (record.recordCategory === 'income') acc.income += record.amount; else acc.expense += record.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredRecords]);

    const getDateFilterText = () => {
        switch (dateFilter) {
            case 'month': return '本月';
            case 'quarter': return '近三月';
            case 'year': return '近一年';
            case 'custom': return (customDate.start && customDate.end) ? `${customDate.start} 至 ${customDate.end}` : '自定义范围';
        }
    };

    // --- 样式常量 ---
    const activeClass = 'bg-emerald-600 text-white';
    const inactiveClass = 'bg-slate-200 text-slate-700 hover:bg-slate-300';

    return (
        <>
            <div>
                {/* ... 粘性头部 (无变化) ... */}
                <div className="sticky top-0 bg-slate-50 z-20 pt-4 border-b border-slate-200 shadow-sm">
                    <div className="bg-white rounded-t-lg px-4 pt-2">
                        {/* ... 视图切换器 ... */}
                        <div className="flex border-b border-slate-200">
                            <button onClick={() => setActiveView('financial')} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'financial' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>财务报告</button>
                            <button onClick={() => setActiveView('activity')} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'activity' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>农事日志</button>
                        </div>
                        {/* ... 日期筛选器 ... */}
                        <div className="py-3 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {(['month', 'quarter', 'year'] as DateFilter[]).map(d => (
                                        <button key={d} onClick={() => setDateFilter(d)} className={`px-3 py-1.5 text-sm rounded-full ${dateFilter === d ? activeClass : inactiveClass}`}>
                                            {d === 'month' && '本月'}{d === 'quarter' && '近三月'}{d === 'year' && '近一年'}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <button onClick={() => setDatePickerVisible(!isDatePickerVisible)} className={`px-3 py-1.5 text-sm rounded-full flex items-center ${dateFilter === 'custom' ? activeClass : inactiveClass}`}>
                                        <Calendar className="w-4 h-4 mr-1.5" />
                                        {getDateFilterText()}
                                        <ChevronDown className="w-4 h-4 ml-1.5" />
                                    </button>
                                    {isDatePickerVisible && (
                                        <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 w-72 space-y-3">
                                            <div>
                                                <label className="text-xs text-slate-600">开始日期</label>
                                                <input type="date" value={customDate.start} onChange={e => setCustomDate(p => ({ ...p, start: e.target.value }))} className="w-full p-2 border border-slate-300 rounded-md mt-1" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-600">结束日期</label>
                                                <input type="date" value={customDate.end} onChange={e => setCustomDate(p => ({ ...p, end: e.target.value }))} className="w-full p-2 border border-slate-300 rounded-md mt-1" />
                                            </div>
                                            <button onClick={() => { setDateFilter('custom'); setDatePickerVisible(false); }} disabled={!customDate.start || !customDate.end} className="w-full bg-emerald-600 text-white py-2 rounded-md disabled:bg-slate-300">应用范围</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* ... 类型筛选器 ... */}
                        <div className="py-3">
                            {activeView === 'financial' ? (
                                <div className="flex space-x-2">
                                    <button onClick={() => setFinancialFilter('all')} className={`px-3 py-1.5 text-sm rounded-full ${financialFilter === 'all' ? activeClass : inactiveClass}`}>全部</button>
                                    <button onClick={() => setFinancialFilter('income')} className={`px-3 py-1.5 text-sm rounded-full ${financialFilter === 'income' ? 'bg-green-600 text-white' : inactiveClass}`}>收入</button>
                                    <button onClick={() => setFinancialFilter('expense')} className={`px-3 py-1.5 text-sm rounded-full ${financialFilter === 'expense' ? 'bg-red-600 text-white' : inactiveClass}`}>支出</button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setActivityFilter('all')} className={`px-3 py-1.5 text-sm rounded-full ${activityFilter === 'all' ? activeClass : inactiveClass}`}>全部地块</button>
                                    {plots.map(plot => (
                                        <button key={plot.id} onClick={() => setActivityFilter(plot.id)} className={`px-3 py-1.5 text-sm rounded-full ${activityFilter === plot.id ? activeClass : inactiveClass}`}>{plot.isArchived ? `${plot.name} (已归档)` : plot.name}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* ... 财务摘要卡片 ... */}
                    {activeView === 'financial' && (
                        <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-b-lg overflow-hidden">
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总收入</p><p className="text-base font-bold text-green-600">¥{summary.income.toLocaleString()}</p></div>
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总支出</p><p className="text-base font-bold text-red-600">¥{Math.abs(summary.expense).toLocaleString()}</p></div>
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">净利润</p><p className={`text-base font-bold ${(summary.income + summary.expense) >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>¥{(summary.income + summary.expense).toLocaleString()}</p></div>
                        </div>
                    )}
                </div>

                {/* 内容区域 */}
                <div className="p-4">
                    {activeView === 'financial' ? <FinancialReportView records={filteredRecords} /> : <ActivityLogView activities={filteredActivities} />}
                </div>
            </div>

            {/* 3. 添加 UrlActionHandler 并配置 actions */}
            <UrlActionHandler
                actions={[
                    {
                        param: 'editActivity',
                        render: (id, onClose) => {
                            const activityToEdit = activities.find(a => a.id === parseInt(id));
                            if (!activityToEdit) return null;
                            return (
                                <FormModal isOpen={true} onClose={onClose} title="编辑农事活动">
                                    <EditActivityForm
                                        initialActivity={activityToEdit}
                                        activityTypes={activityTypes}
                                        plots={plots}
                                        recordCategoryTypes={recordCategoryTypes}
                                    />
                                </FormModal>
                            );
                        },
                    },
                    {
                        param: 'editRecord',
                        render: (id, onClose) => {
                            const recordToEdit = records.find(r => r.id === parseInt(id));
                            if (!recordToEdit) return null;
                            return (
                                <FormModal isOpen={true} onClose={onClose} title="编辑财务记录">
                                    <EditFinancialRecordForm
                                        record={recordToEdit}
                                        recordCategoryTypes={recordCategoryTypes}
                                    />
                                </FormModal>
                            );
                        },
                    },
                ]}
            />
        </>
    );
}

