// components/cycles/CycleDetailClient.tsx
'use client';

import { useState } from 'react';
import { ActivityCycle, FinancialWithActivity } from "@/lib/types";
import ActivitiesList from '@/components/activities/ActivitiesList';
import { RecordItem } from '@/components/reports/RecordItem';

export function CycleDetailClient({ cycle }: { cycle: ActivityCycle }) {
    const [activeView, setActiveView] = useState('activity'); // 默认显示农事日志

    // 将周期内的财务记录扁平化，并注入关联的活动信息
    const records: FinancialWithActivity[] = cycle.activities.flatMap(activity => {
        if (!activity.records || activity.records.length === 0) {
            return [];
        }
        return activity.records.map(record => ({
            ...record,
            activityId: activity.id,
            activityType: activity.type,
            activityDate: activity.date,
            plotName: activity.plotName,
            crop: activity.crop,
        }));
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // 按日期降序排序

    return (
        <div>
            {/* 视图切换器 */}
            <div className="px-4">
                <div className="flex border-b border-slate-200">
                    <button onClick={() => setActiveView('activity')} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'activity' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>农事日志</button>
                    <button onClick={() => setActiveView('financial')} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'financial' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>财务数据</button>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
                {activeView === 'financial' ? 
                    <FinancialRecordListView records={records} /> : 
                    <ActivitiesList activities={cycle.activities} />
                }
            </div>
        </div>
    );
}

function FinancialRecordListView({ records }: { records: FinancialWithActivity[] }) {
    if (records.length === 0) return <EmptyState message="没有找到相关的财务记录。" />;
    return (
        <div className="space-y-3">
            {records.map(record => <RecordItem key={record.id} record={record} />)}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-10">
            <p className="text-slate-500">{message}</p>
        </div>
    );
}