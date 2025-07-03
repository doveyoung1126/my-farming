// components/reports/ReportsClient.tsx
'use client';

import { useMemo, useState } from 'react';
import { ActivityWithFinancials, FinancialWithActivity, PrismaPlots } from '@/lib/types';
import { FinancialReportView } from './FinancialReportView';
import { ActivityLogView } from './ActivityLogView';
import { Calendar, ChevronDown } from 'lucide-react';

// --- 类型定义 ---
type View = 'financial' | 'activity';
type FinancialFilter = 'all' | 'income' | 'expense';
type ActivityFilter = number | 'all';
type DateFilter = 'month' | 'quarter' | 'year' | 'custom';

/**
 * 报告页面的客户端容器组件
 * 
 * 职责:
 * 1. 管理和渲染所有筛选器UI (视图、日期、类型)。
 * 2. 根据所有筛选条件处理和过滤数据。
 * 3. 将最终过滤后的数据传递给相应的纯展示子组件。
 * 4. 实现粘性头部，固定所有筛选器和摘要。
 */
export function ReportsClient({ plots, activities, records }: {
    plots: PrismaPlots[];
    activities: ActivityWithFinancials[];
    records: FinancialWithActivity[];
}) {
    // --- State管理 ---
    const [activeView, setActiveView] = useState<View>('financial');
    const [financialFilter, setFinancialFilter] = useState<FinancialFilter>('all');
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('month');
    const [customDate, setCustomDate] = useState({ start: '', end: '' });
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    // --- 数据过滤逻辑 ---

    // 根据日期筛选计算出开始和结束日期
    const dateRange = useMemo(() => {
        const end = new Date();
        const start = new Date();
        switch (dateFilter) {
            case 'month':
                start.setDate(1);
                break;
            case 'quarter':
                start.setMonth(start.getMonth() - 3);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 1);
                break;
            case 'custom':
                return {
                    start: customDate.start ? new Date(customDate.start) : null,
                    end: customDate.end ? new Date(customDate.end) : null
                };
        }
        return { start, end };
    }, [dateFilter, customDate]);

    // 应用所有筛选条件
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

    // --- 动态UI计算 ---

    // 计算财务摘要
    const summary = useMemo(() => {
        return filteredRecords.reduce((acc, record) => {
            if (record.recordCategory === 'income') acc.income += record.amount;
            else acc.expense += record.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredRecords]);

    // 获取当前日期筛选的文本描述
    const getDateFilterText = () => {
        switch (dateFilter) {
            case 'month': return '本月';
            case 'quarter': return '近三月';
            case 'year': return '近一年';
            case 'custom': 
                if(customDate.start && customDate.end) {
                    return `${customDate.start} 至 ${customDate.end}`;
                }
                return '自定义范围';
        }
    };

    return (
        <div>
            {/* 粘性头部 */}
            <div className="sticky top-0 bg-gray-50 z-20 pt-4">
                <div className="bg-white rounded-t-lg shadow-sm px-4 pt-2">
                    {/* 视图切换器 */}
                    <div className="flex border-b">
                        <button onClick={() => setActiveView('financial')} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'financial' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>财务报告</button>
                        <button onClick={() => setActiveView('activity')} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'activity' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>农事日志</button>
                    </div>

                    {/* 日期筛选器 */}
                    <div className="py-3 border-b">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                                {(['month', 'quarter', 'year'] as DateFilter[]).map(d => (
                                    <button key={d} onClick={() => setDateFilter(d)} className={`px-3 py-1.5 text-sm rounded-full ${dateFilter === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                        {d === 'month' && '本月'}
                                        {d === 'quarter' && '近三月'}
                                        {d === 'year' && '近一年'}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <button onClick={() => setDatePickerVisible(!isDatePickerVisible)} className={`px-3 py-1.5 text-sm rounded-full flex items-center ${dateFilter === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    <Calendar className="w-4 h-4 mr-1.5"/>
                                    {getDateFilterText()}
                                    <ChevronDown className="w-4 h-4 ml-1.5"/>
                                </button>
                                {isDatePickerVisible && (
                                    <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-xl z-50 p-4 w-72 space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-600">开始日期</label>
                                            <input type="date" value={customDate.start} onChange={e => setCustomDate(p => ({...p, start: e.target.value}))} className="w-full p-2 border rounded-md mt-1"/>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600">结束日期</label>
                                            <input type="date" value={customDate.end} onChange={e => setCustomDate(p => ({...p, end: e.target.value}))} className="w-full p-2 border rounded-md mt-1"/>
                                        </div>
                                        <button 
                                            onClick={() => { setDateFilter('custom'); setDatePickerVisible(false); }}
                                            disabled={!customDate.start || !customDate.end}
                                            className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-gray-300"
                                        >
                                            应用范围
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 类型筛选器 */}
                    <div className="py-3">
                        {activeView === 'financial' ? (
                            <div className="flex space-x-2">
                                <button onClick={() => setFinancialFilter('all')} className={`px-3 py-1.5 text-sm rounded-full ${financialFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>全部</button>
                                <button onClick={() => setFinancialFilter('income')} className={`px-3 py-1.5 text-sm rounded-full ${financialFilter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>收入</button>
                                <button onClick={() => setFinancialFilter('expense')} className={`px-3 py-1.5 text-sm rounded-full ${financialFilter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>支出</button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActivityFilter('all')} className={`px-3 py-1.5 text-sm rounded-full ${activityFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>全部地块</button>
                                {plots.map(plot => (
                                    <button key={plot.id} onClick={() => setActivityFilter(plot.id)} className={`px-3 py-1.5 text-sm rounded-full ${activityFilter === plot.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{plot.name}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* 财务摘要卡片 */}
                {activeView === 'financial' && (
                    <div className="grid grid-cols-3 gap-px bg-gray-200 rounded-b-lg overflow-hidden">
                        <div className="bg-white p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">总收入</p>
                            <p className="text-base font-bold text-green-600">¥{summary.income.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">总支出</p>
                            <p className="text-base font-bold text-red-600">¥{Math.abs(summary.expense).toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">净利润</p>
                            <p className={`text-base font-bold ${(summary.income + summary.expense) >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>¥{(summary.income + summary.expense).toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 内容区域 */}
            <div className="p-4">
                {activeView === 'financial' ? (
                    <FinancialReportView records={filteredRecords} />
                ) : (
                    <ActivityLogView activities={filteredActivities} />
                )}
            </div>
        </div>
    );
}