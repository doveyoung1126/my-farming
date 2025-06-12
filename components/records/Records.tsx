// components/records/Records.tsx
'use client';
import { useState } from 'react';
import { FinancialWithActivity } from '@/lib/types';

export default function Records({
    records,
    recordTypes
}: {
    records: FinancialWithActivity[];
    recordTypes: string[];
}) {
    // 筛选状态
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // 过滤财务记录
    const filteredRecords = records.filter(record => {
        // 搜索词过滤
        const matchesSearch = searchTerm === '' ||
            !record.description ||
            record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.recordType.toLowerCase().includes(searchTerm.toLowerCase());

        // 类型过滤
        const matchesType = selectedType === 'all' || record.recordType === selectedType;

        // 类别过滤
        const matchesCategory = selectedCategory === 'all' ||
            record.recordCategory === selectedCategory.toUpperCase();

        return matchesSearch && matchesType && matchesCategory;
    });

    // 按日期分组记录
    const groupByMonth = () => {
        const groups: Record<string, FinancialWithActivity[]> = {};

        filteredRecords.forEach(record => {
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

    const groupedRecords = groupByMonth();

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* 筛选区域 */}
            <div className="bg-white p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* 搜索框 */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="搜索描述或类型..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* 类型筛选下拉框 */}
                    <div className="w-full md:w-1/4">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="all">所有类型</option>
                            {recordTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* 类别筛选按钮组 */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all'
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            全部
                        </button>
                        <button
                            onClick={() => setSelectedCategory('expense')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'expense'
                                ? 'bg-red-100 text-red-700 border border-red-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            支出
                        </button>
                        <button
                            onClick={() => setSelectedCategory('income')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'income'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            收入
                        </button>
                    </div>
                </div>
            </div>

            {/* 记录列表 */}
            <div className="flex-1 overflow-y-auto pb-4">
                {Object.entries(groupedRecords).map(([month, records]) => (
                    <div key={month} className="mb-6">
                        {/* 月份标题 */}
                        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-700">{month}</h3>
                        </div>

                        {/* 当月记录列表 */}
                        <div className="space-y-2 px-2 mt-2">
                            {records.map(record => (
                                <RecordItem key={record.id} record={record} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* 无记录提示 */}
                {filteredRecords.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <div className="text-lg mb-2">未找到匹配的财务记录</div>
                        <div className="text-sm">请尝试调整筛选条件</div>
                    </div>
                )}
            </div>
        </div>
    )
}

// 单个记录项组件
function RecordItem({ record }: { record: FinancialWithActivity }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-gray-800">
                        {record.recordType}
                        {record.description && ` · ${record.description}`}
                    </h3>

                    {/* 关联活动信息（可选显示） */}
                    {record.activityType && record.plotName && (
                        <p className="text-sm text-gray-500 mt-1">
                            关联: {record.plotName} · {record.activityType}
                        </p>
                    )}
                </div>

                <div className="flex flex-col items-end">
                    {/* 金额显示 */}
                    <span className={`text-lg font-semibold ${record.recordCategory === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}>
                        {record.recordCategory === 'expense' ? '+' : '-'}
                        ¥{Math.abs(record.amount).toLocaleString()}
                    </span>

                    {/* 日期 */}
                    <span className="text-sm text-gray-400 mt-1" suppressHydrationWarning>
                        {record.date.toLocaleDateString('zh-CN')}
                    </span>
                </div>
            </div>
        </div>
    )
}