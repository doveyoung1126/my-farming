// components/reports/RecordItem.tsx
'use client';

import { FinancialWithActivity } from "@/lib/types";
import { Link as LinkIcon } from 'lucide-react';

/**
 * 单个财务记录的展示组件
 * 
 * @param record - 包含财务和关联农事信息的记录对象
 */
export function RecordItem({ record }: { record: FinancialWithActivity }) {
    const isIncome = record.recordCategory === 'income';

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
                            {record.recordType}
                        </span>

                        {/* 关联活动标识 */}
                        {record.activityType && (
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
                    {record.activityType && record.plotName && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <div className="bg-gray-100 px-2 py-1 rounded-md">
                                {record.plotName} · {record.activityType}
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
                            {new Date(record.date).toLocaleDateString('zh-CN', { year: "numeric", month: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}