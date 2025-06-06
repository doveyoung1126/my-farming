// components/activities/Activities.tsx
'use client';
import { ActivityWithFinancials, PrismaPlots } from '@/lib/types'
import ActivitiesList from '../ActivitiesList'
import { useState } from 'react';

export default function Activities({
    plots,
    activities
}: {
    plots: PrismaPlots[]
    activities: ActivityWithFinancials[]
}) {
    const [selectedPlot, setSelectedPlot] = useState<number | 'all'>('all');

    // 客户端过滤逻辑
    const filteredActivities = activities.filter(activity =>
        selectedPlot === 'all' ? true : activity.plotId === selectedPlot
    );

    return (
        <>
            <p className="text-xl font-bold mb-4">时间线</p>

            {/* 地块筛选下拉框 */}
            <div className="mb-4">
                <select
                    value={selectedPlot}
                    onChange={(e) => setSelectedPlot(
                        e.target.value === 'all' ? 'all' : Number(e.target.value)
                    )}
                    className="w-full p-2 border rounded-lg bg-white"
                >
                    <option value="all">所有地块</option>
                    {plots.map(plot => (
                        <option key={plot.id} value={plot.id}>
                            {plot.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 时间轴列表 */}
            <div className="flex-1 overflow-y-auto pb-30">
                <div className="space-y-4 p-2">
                    <ActivitiesList activities={filteredActivities} />
                </div>
            </div>
        </>
    );
}