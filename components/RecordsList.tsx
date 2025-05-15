// components/RecordsList.tsx
'use client';

import { useState } from 'react';
import FilterTabs from './FilterTabs';

export default function RecordsList({
    initialRecords,
}: {
    initialRecords: any[];
}) {
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    // 客户端过滤逻辑
    const filteredRecords = initialRecords.filter(record =>
        filter === 'all' ? true : record.type === filter
    );

    return (
        <>
            <FilterTabs currentFilter={filter} onFilterChange={setFilter} />

            {/* 记录列表 */}
            <div className="flex-1 min-h-0 overflow-y-auto pb-30">
                <div className="px-4 mt-4 space-y-3">
                    {filteredRecords.map((record) => (
                        <div
                            key={`${record.type}-${record.id}`}
                            className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium">
                                        {record.type === 'income' ? '💰 收入' : '💸 支出'} ·
                                        <span className="text-gray-600 ml-1">
                                            {record.crop_name || (record.type === 'income' ? '销售' : '常规支出')}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {record.memo || '无备注'}
                                        {record.type === 'income' && '买家：' + (record.memo || '匿名')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg ${record.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {record.type === 'income' ? '+' : '-'}
                                        ¥{record.amount.toLocaleString()}
                                    </span>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(record.created_at * 1000).toLocaleDateString('zh-CN')}
                                    </div>
                                </div>
                            </div>

                            {/* 统一显示关联农事 */}
                            {record.event_id && (
                                <div className="mt-2 text-sm text-blue-500 bg-blue-50 px-2 py-1 rounded inline-block">
                                    🚜 关联农事：{record.event_type || '未指定类型'}
                                </div>
                            )}
                        </div>))}
                </div>
            </div>
        </>
    );
}