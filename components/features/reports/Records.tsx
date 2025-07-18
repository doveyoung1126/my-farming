// components/records/Records.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { RecordWithDetails } from '@/lib/types';
import { TrendingUp, TrendingDown, Link as LinkIcon, Calendar, ChevronDown } from 'lucide-react';

export function Records({
    records,
}: {
    records: RecordWithDetails[];
}) {

    // 时间过滤状态
    const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'half-year' | 'custom'>('month');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

    // 计算当前日期范围
    const getDateRange = () => {
        const today = new Date();
        const startDate = new Date();

        switch (timeFilter) {
            case 'month':
                startDate.setDate(1); // 本月第一天
                return { start: startDate, end: today };
            case 'quarter':
                startDate.setMonth(today.getMonth() - 3); // 最近3个月
                return { start: startDate, end: today };
            case 'half-year':
                startDate.setMonth(today.getMonth() - 6); // 最近半年
                return { start: startDate, end: today };
            case 'custom':
                const start = customStartDate ? new Date(customStartDate) : new Date();
                const end = customEndDate ? new Date(customEndDate) : new Date();
                return { start, end };
        }
    };

    // 获取日期范围文本
    const getDateRangeText = () => {
        const { start, end } = getDateRange();

        switch (timeFilter) {
            case 'month':
                return start.toLocaleDateString('zh-CN', { month: 'long' })
            case 'quarter':
                return '最近3个月';
            case 'half-year':
                return '最近半年';
            case 'custom':
                return `${start.toLocaleDateString('zh-CN')} - ${end.toLocaleDateString('zh-CN')}`;
        }
    };

    // 过滤记录
    const filteredRecords = useMemo(() => {
        const { start, end } = getDateRange();

        return records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        });
    }, [records, timeFilter, customStartDate, customEndDate]);


    // 按月份分组记录
    const groupByMonth = (records: RecordWithDetails[]) => {
        const groups: Record<string, RecordWithDetails[]> = {};

        records.forEach(record => {
            const monthKey = record.date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long'
            });

            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }

            groups[monthKey].push(record);
        });

        return groups;
    };

    // 对每个月的记录按日期倒序排序（最新的在前）
    const sortRecords = (groups: Record<string, RecordWithDetails[]>) => {
        const sortedGroups: Record<string, RecordWithDetails[]> = {};
        Object.keys(groups).forEach(month => {
            sortedGroups[month] = groups[month].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        });

        // 对月份进行排序，最新的月份在前
        const sortedMonths = Object.keys(sortedGroups).sort((a, b) => {
            // 将月份字符串转换为日期（假设每个月的第一天作为比较基准）
            const dateA = new Date(a.replace('年', '-').replace('月', ''));
            const dateB = new Date(b.replace('年', '-').replace('月', ''));
            return dateB.getTime() - dateA.getTime();
        });

        // 创建一个新的对象，按照排序后的月份顺序
        const result: Record<string, RecordWithDetails[]> = {};
        sortedMonths.forEach(month => {
            result[month] = sortedGroups[month];
        });

        return result;
    };

    // 初始化分组
    const [groupedRecords, setGroupedRecords] = useState<Record<string, RecordWithDetails[]>>({});

    useEffect(() => {
        const grouped = groupByMonth(filteredRecords);
        const sortedGrouped = sortRecords(grouped);
        setGroupedRecords(sortedGrouped);
    }, [filteredRecords]);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* 时间过滤组件 */}
            <div className="bg-white p-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                            时间范围: <span className="ml-2 text-blue-600">{getDateRangeText()}</span>
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            {/* 过滤选项按钮 */}
                            {(['month', 'quarter', 'half-year'] as const).map(option => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setTimeFilter(option);
                                        setShowCustomPicker(false);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors ${timeFilter === option
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {option === 'month' && '本月'}
                                    {option === 'quarter' && '最近3个月'}
                                    {option === 'half-year' && '最近半年'}
                                </button>
                            ))}

                            {/* 自定义时间按钮 */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowCustomPicker(!showCustomPicker)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors ${timeFilter === 'custom'
                                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    其他时间
                                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showCustomPicker ? 'rotate-180' : ''
                                        }`} />
                                </button>

                                {/* 自定义日期选择器 */}
                                {showCustomPicker && (
                                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80 p-4">
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                开始日期
                                            </label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={e => setCustomStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                结束日期
                                            </label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={e => setCustomEndDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (customStartDate && customEndDate) {
                                                    setTimeFilter('custom');
                                                    setShowCustomPicker(false);
                                                }
                                            }}
                                            className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white ${customStartDate && customEndDate
                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                : 'bg-gray-400 cursor-not-allowed'
                                                }`}
                                            disabled={!customStartDate || !customEndDate}
                                        >
                                            应用筛选
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 过滤后的财务摘要 */}
            <div className="bg-white p-4 mx-4 my-3 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <TrendingUp className="text-blue-600 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">期间收入</p>
                                <p className="text-lg font-bold text-green-600">
                                    ¥{filteredRecords
                                        .filter(r => r.type.category === 'income')
                                        .reduce((sum, r) => sum + r.amount, 0)
                                        .toLocaleString('zh-CN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-red-100 p-2 rounded-full mr-3">
                                <TrendingDown className="text-red-600 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">期间支出</p>
                                <p className="text-lg font-bold text-red-600">
                                    ¥{filteredRecords
                                        .filter(r => r.type.category === 'expense')
                                        .reduce((sum, r) => sum + Math.abs(r.amount), 0)
                                        .toLocaleString('zh-CN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 进度条 */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>支出</span>
                        <span>收入</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full"
                            style={{
                                width: '100%',
                                background: `linear-gradient(to right, red 0%, red ${expensePercentage(filteredRecords)}%, green ${expensePercentage(filteredRecords)}%, green 100%)`
                            }}
                        ></div>
                    </div>
                </div>
            </div>




            {/* 记录列表 */}
            <div className="flex-1 overflow-y-auto pb-10">
                {Object.entries(groupedRecords).map(([month, records]) => (
                    <div key={month} className="mb-6">
                        {/* 月份标题 */}
                        <div className="sticky top-0 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 z-10">
                            <h3 className="font-semibold text-gray-700 text-lg">{month}</h3>
                        </div>

                        {/* 当月记录列表 */}
                        <div className="space-y-3 px-4 mt-3">
                            {records.map(record => (
                                <RecordItem key={record.id} record={record} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* 无记录提示 */}
                {records.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <div className="text-lg mb-2">暂无财务记录</div>
                        <div className="text-sm">请添加新的财务记录</div>
                    </div>
                )}
            </div>
        </div>
    )
}

// 计算支出百分比（用于进度条）
const expensePercentage = (records: RecordWithDetails[]) => {
    const totalExpense = records
        .filter(r => r.type.category === 'expense' || !r.type.category)
        .reduce((sum, r) => sum + Math.abs(r.amount), 0);

    const totalIncome = records
        .filter(r => r.type.category === 'income')
        .reduce((sum, r) => sum + r.amount, 0);

    if (totalExpense + totalIncome === 0) return 50;

    return (totalExpense / (totalExpense + totalIncome)) * 100;
};

// 单个记录项组件
function RecordItem({ record }: { record: RecordWithDetails }) {
    const isIncome = record.type.category === 'income';

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                        {/* 类型标签 */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIncome
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {record.type.name}
                        </span>

                        {/* 关联活动标识 */}
                        {record.activity?.type.name && (
                            <span className="ml-2 text-xs text-gray-500 flex items-center">
                                <LinkIcon className="w-3 h-3 mr-1" />
                                关联活动
                            </span>
                        )}
                    </div>

                    {/* 描述 */}
                    {record.description && (
                        <h3 className="font-medium text-gray-800 mt-2 truncate">
                            {record.description}
                        </h3>
                    )}

                    {/* 关联活动信息（可选显示） */}
                    {record.activity && record.activity.plot.name && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <div className="bg-gray-100 px-2 py-1 rounded-md">
                                {record.activity.plot.name} · {record.activity.type.name}
                            </div>
                        </div>
                    )}
                </div>

                <div className="ml-4 flex flex-col items-end">
                    {/* 金额显示 */}
                    <span className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {isIncome ? '+' : '-'}
                        ¥{Math.abs(record.amount).toLocaleString('zh-CN')}
                    </span>

                    {/* 日期 */}
                    <div className="mt-1">
                        <span className="text-xs text-gray-400" suppressHydrationWarning>
                            {record.date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}