// components/reports/RecordItem.tsx
'use client';

import { RecordWithDetails } from "@/lib/types"; // 使用新的、精确的类型
import { Link as LinkIcon, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface RecordItemProps {
    record: RecordWithDetails; // 更新 Prop 类型
    isEditAble?: boolean
}

export function RecordItem({ record, isEditAble = false }: RecordItemProps) {
    // record.type 现在是一个对象
    const isIncome = record.type.category === 'income';

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIncome
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {record.type.name} {/* 从 record.type 对象中获取 name */}
                        </span>
                        {record.activity && ( // 检查 activity 对象是否存在
                            <span className="ml-2 text-xs text-gray-500 flex items-center">
                                <LinkIcon className="w-3 h-3 mr-1" />
                                关联活动
                            </span>
                        )}
                    </div>

                    {record.description && (
                        <h3 className="font-medium text-gray-800 mt-2 truncate">
                            {record.description}
                        </h3>
                    )}

                    {record.activity && ( // 检查 activity 对象是否存在
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <div className="bg-gray-100 px-2 py-1 rounded-md">
                                {/* 从嵌套结构中获取数据 */}
                                {record.activity.plot.name} · {record.activity.type.name}
                            </div>
                        </div>
                    )}
                </div>

                <div className="ml-4 flex flex-col items-end flex-shrink-0">
                    <span className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {isIncome ? '+' : '-'}
                        ¥{Math.abs(record.amount).toLocaleString('zh-CN')}
                    </span>

                    <div className="mt-1">
                        <span className="text-xs text-gray-400" suppressHydrationWarning>
                            {new Date(record.date).toLocaleDateString('zh-CN', { year: "numeric", month: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                    {isEditAble && (<div className="flex items-center mt-2 space-x-4">
                        <Link
                            href={{ query: { editRecord: record.id } }}
                            scroll={false}
                            replace
                            className="flex items-center text-xs text-gray-500 hover:text-blue-600 transition-colors"
                            aria-label="编辑记录"
                        >
                            <Pencil className="w-3 h-3 mr-1" />
                            编辑
                        </Link>
                        <Link
                            href={{ query: { deleteRecord: record.id } }}
                            scroll={false}
                            replace
                            className="flex items-center text-xs text-gray-500 hover:text-red-600 transition-colors"
                            aria-label="删除记录"
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            删除
                        </Link>
                    </div>)}
                </div>
            </div>
        </div>
    );
}
