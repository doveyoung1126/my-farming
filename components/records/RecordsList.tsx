// components/RecordsList.tsx
'use client';
import { FinancialWithActivity } from '@/lib/types'
import { useState } from 'react';
// import FilterTabs from './FilterTabs';

export const RecordsList = ({
    records
}: {
    records: FinancialWithActivity[]
}) => {

    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    // 客户端过滤逻辑
    const filteredRecords = records.filter(record =>
        filter === 'all' ? true : record.recordType === filter
    )

    return (
        <>
            <FilterTabs currentFilter={filter} onFilterChange={setFilter} />

            {/* 记录列表 */}
            <div className="flex-1 min-h-0 overflow-y-auto pb-30">
                <div className="px-4 mt-4 space-y-3">
                    {filteredRecords.map((record) => (
                        <div
                            key={record.id}
                            className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium">
                                        {record.amount > 0 ? '💰 收入' : '💸 支出'} ·
                                        <span className="text-gray-600 ml-1">
                                            {record.recordType}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {record.description || '无备注'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg ${record.amount > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {record.amount > 0 ? '+' : '-'}
                                        {record.amount.toLocaleString()}
                                    </span>
                                    <div className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                                        {record.date.toLocaleDateString('zh-CN')}
                                    </div>
                                </div>
                            </div>

                            {/* 统一显示关联农事 */}
                            {record.activityType && (
                                <div className="mt-2 text-sm text-blue-500 bg-blue-50 px-2 py-1 rounded inline-block">
                                    🚜 关联农事：{record.activityType + record.plotName}
                                </div>
                            )}
                        </div>))}
                </div>
            </div>
        </>
    );
}

function FilterTabs({
    currentFilter,
    onFilterChange
}: {
    currentFilter: 'all' | 'income' | 'expense';
    onFilterChange: (type: 'all' | 'income' | 'expense') => void;
}) {
    return (
        <div className="px-4 flex gap-2 border-b">
            {[
                { value: 'all', label: '全部' },
                { value: 'income', label: '收入' },
                { value: 'expense', label: '支出' }
            ].map((option) => (
                <button
                    key={option.value}
                    onClick={() => onFilterChange(option.value as any)}
                    className={`px-4 py-2 rounded-t-lg text-sm transition-colors ${currentFilter === option.value
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}