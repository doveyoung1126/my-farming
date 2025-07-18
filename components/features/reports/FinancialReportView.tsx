// components/reports/FinancialReportView.tsx
'use client';

import { useState, useEffect } from 'react';
import { RecordWithDetails } from "@/lib/types";
import { RecordItem } from './RecordItem';

/**
 * 财务报告视图 (纯列表)
 */
export function FinancialReportView({ records }: { records: RecordWithDetails[] }) {
    const [groupedRecords, setGroupedRecords] = useState<Map<string, RecordWithDetails[]>>(new Map());

    useEffect(() => {
        const groups = new Map<string, RecordWithDetails[]>();
        records.forEach(record => {
            const monthKey = new Date(record.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
            if (!groups.has(monthKey)) {
                groups.set(monthKey, []);
            }
            groups.get(monthKey)!.push(record);
        });
        setGroupedRecords(groups);
    }, [records]);

    const sortedMonths = Array.from(groupedRecords.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (records.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">在当前筛选条件下没有找到财务记录。</p>
            </div>
        );
    }

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
                    <h3 className="font-semibold text-slate-600 px-2 py-1 my-4 sticky top-[280px] bg-slate-100 z-10 rounded-md">{month}</h3>
                    <div className="space-y-3">
                        {groupedRecords.get(month)!.map(record => (
                            <RecordItem
                                key={record.id}
                                record={record}
                                isEditAble
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}