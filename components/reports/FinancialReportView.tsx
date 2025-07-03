// components/reports/FinancialReportView.tsx
'use client';

import { FinancialWithActivity } from "@/lib/types";

interface FinancialReportViewProps {
    records: FinancialWithActivity[];
}

/**
 * 财务报告视图
 * 
 * 职责:
 * 1. 接收所有财务记录。
 * 2. (未来) 实现时间范围、收支类型等筛选逻辑。
 * 3. (未来) 展示KPI卡片和图表。
 * 4. 渲染财务明细列表。
 */
export function FinancialReportView({ records }: FinancialReportViewProps) {
    // TODO: 在此实现筛选、图表和KPI卡片

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">财务明细</h2>
                <p className="text-sm text-gray-500">此处将显示详细的财务记录、筛选器和图表。</p>
                {/* 临时展示数据条数以确认数据已传入 */}
                <p className="mt-4 text-blue-600">已加载 {records.length} 条财务记录。</p>
            </div>
            {/* 此处将渲染记录列表 */}
        </div>
    );
}