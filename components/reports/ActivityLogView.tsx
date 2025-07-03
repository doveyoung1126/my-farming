// components/reports/ActivityLogView.tsx
'use client';

import { ActivityWithFinancials, PrismaPlots } from "@/lib/types";

interface ActivityLogViewProps {
    activities: ActivityWithFinancials[];
    plots: PrismaPlots[];
}

/**
 * 农事日志视图
 * 
 * 职责:
 * 1. 接收所有农事活动和地块信息。
 * 2. (未来) 实现按地块、活动类型、时间范围的筛选逻辑。
 * 3. (未来) 可视化展示活动日历。
 * 4. 渲染农事活动明细列表。
 */
export function ActivityLogView({ activities, plots }: ActivityLogViewProps) {
    // TODO: 在此实现筛选和日历视图

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">农事日志</h2>
                <p className="text-sm text-gray-500">此处将显示详细的农事活动记录和筛选器。</p>
                 {/* 临时展示数据条数以确认数据已传入 */}
                 <p className="mt-4 text-blue-600">已加载 {activities.length} 条农事活动，涉及 {plots.length} 个地块。</p>
            </div>
            {/* 此处将渲染活动列表 */}
        </div>
    );
}