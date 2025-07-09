// components/reports/ActivityLogView.tsx
'use client';

import { ActivityWithFinancials } from "@/lib/types";
import ActivitiesList from '@/components/features/reports/ActivitiesList';

/**
 * 农事日志视图 (纯列表)
 * 
 * 职责:
 * 1. 接收经过筛选的农事活动。
 * 2. 渲染农事活动明细列表。
 */
import { Pencil } from 'lucide-react'; // Import Pencil icon

export function ActivityLogView({ activities, onEditActivity }: { activities: ActivityWithFinancials[]; onEditActivity?: (activity: ActivityWithFinancials) => void; }) {
    return (
        <div>
            {activities.length > 0 ? (
                <ActivitiesList activities={activities} onEditActivity={onEditActivity} />
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500">在当前筛选条件下没有找到农事活动。</p>
                </div>
            )}
        </div>
    );
}