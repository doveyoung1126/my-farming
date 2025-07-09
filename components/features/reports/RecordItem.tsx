// components/reports/RecordItem.tsx
'use client';

import { FinancialWithActivity } from "@/lib/types";
import { Link as LinkIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface RecordItemProps {
    record: FinancialWithActivity;
    onEdit?: (record: FinancialWithActivity) => void;
    onDelete?: (recordId: number) => void;
}

/**
 * 单个财务记录的展示组件
 * 
 * @param record - 包含财务和关联农事信息的记录对象
 * @param onEdit - (可选) 点击编辑按钮时触发的回调。
 * @param onDelete - (可选) 点击删除按钮时触发的回调。
 */
export function RecordItem({ record, onEdit, onDelete }: RecordItemProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isIncome = record.recordCategory === 'income';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const hasMenu = onEdit || onDelete;

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

                <div className="ml-4 flex items-center">
                    <div className="flex flex-col items-end mr-2">
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
                    {/* 仅当 onEdit 或 onDelete 函数被提供时，才渲染操作菜单 */}
                    {hasMenu && (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-slate-100">
                                <MoreVertical className="w-5 h-5 text-slate-600" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20 py-1">
                                    {onEdit && (
                                        <button
                                            onClick={() => { onEdit(record); setIsMenuOpen(false); }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                        >
                                            <Pencil className="w-4 h-4 mr-3" />
                                            编辑
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => { onDelete(record.id); setIsMenuOpen(false); }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-3" />
                                            删除
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
