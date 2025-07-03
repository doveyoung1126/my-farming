// components/reports/FinancialReportView.tsx
'use client';

import { useState, useEffect } from 'react';
import { FinancialWithActivity } from "@/lib/types";
import { RecordItem } from './RecordItem';

interface FinancialReportViewProps {
    records: FinancialWithActivity[];
}

/**
 * 财务报告视图 (纯列表)
 * 
 * 职责:
 * 1. 接收经过筛选的财务记录。
 * 2. 在客户端对记录进行分组和排序，以避免水合错误。
 * 3. 渲染财务明细列表。
 */
export function FinancialReportView({ records }: FinancialReportViewProps) {
    const [groupedRecords, setGroupedRecords] = useState<Map<string, FinancialWithActivity[]>>(new Map());

    useEffect(() => {
        // 将分组逻辑放在useEffect中，确保只在客户端执行
        const groups = new Map<string, FinancialWithActivity[]>();
        records.forEach(record => {
            const monthKey = new Date(record.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
            if (!groups.has(monthKey)) {
                groups.set(monthKey, []);
            }
            groups.get(monthKey)!.push(record);
        });
        setGroupedRecords(groups);
    }, [records]); // 当传入的records变化时，重新计算分组

    const sortedMonths = Array.from(groupedRecords.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (records.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">在当前筛选条件下没有找到财务记录。</p>
            </div>
        );
    }

    // 初始渲染或正在计算时，可以显示一个加载状态
    if (sortedMonths.length === 0 && records.length > 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">正在加载记录...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {sortedMonths.map(month => (
                <div key={month}>
                    <h3 className="font-semibold text-gray-700 px-2 py-1 my-2 sticky top-[160px] bg-gray-50 z-10">{month}</h3>
                    <div className="space-y-3">
                        {groupedRecords.get(month)!.map(record => (
                            <RecordItem key={record.id} record={record} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}