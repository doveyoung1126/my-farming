// app/newdashboard/page.tsx
export const dynamic = 'force-dynamic';

import { getPlots, getAllCycles, getActivityTypes, getRecordCategoryTypes } from '@/lib/data';
import { ActivityCycle, Plot, ActivityType, RecordCategoryType } from '@/lib/types';
import { OngoingCycleCard } from '@/components/features/dashboard/OngoingCycleCard';
import { CompletedCycleCard } from '@/components/features/dashboard/CompletedCycleCard';
import Link from 'next/link';
import { DashboardActions } from '@/components/features/dashboard/DashboardActions';

export default async function NewDashboardPage() {

    // 数据获取逻辑已大大简化
    const [plots, allCycles, activityTypes, recordCategoryTypes] = await Promise.all([
        getPlots(),
        getAllCycles(true), // 直接获取所有周期，并计算摘要
        getActivityTypes(),
        getRecordCategoryTypes(),
    ]);

    // 周期过滤逻辑保持不变
    const ongoingCycles = allCycles.filter(cycle => cycle.status === 'ongoing');
    const completedCycles = allCycles.filter(cycle => cycle.status === 'completed' || cycle.status === 'aborted').sort((a, b) => new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime());

    return (
        <div className="h-full bg-slate-50 overflow-y-auto pb-20">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">我的农场</h1>
                </div>
            </header>

            {/* 地块概览 */}
            <Link href="/plots" className="block px-4 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-2xl font-bold text-slate-800">{plots.length}</p>
                        <p className="text-xs text-slate-500">地块总数</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-2xl font-bold text-emerald-600">{plots.filter(p => p.crop).length}</p>
                        <p className="text-xs text-slate-500">运营中</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-2xl font-bold text-slate-800">{plots.reduce((acc, p) => acc + p.area, 0).toFixed(1)}</p>
                        <p className="text-xs text-slate-500">总面积 (亩)</p>
                    </div>
                </div>
            </Link>

            <main className="p-4 space-y-6">
                {/* Ongoing Cycles Section */}
                <section>
                    <h2 className="text-lg font-semibold text-slate-700 mb-3">地里正在长的</h2>
                    {ongoingCycles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ongoingCycles.map(cycle => (
                                <OngoingCycleCard key={cycle.id} cycle={cycle} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">当前没有正在进行的生产周期。</p>
                    )}
                </section>

                {/* Completed Cycles Section */}
                <section>
                    <h2 className="text-lg font-semibold text-slate-700 mb-3">已经收获的</h2>
                    {completedCycles.length > 0 ? (
                        <div className="space-y-4">
                            {completedCycles.map(cycle => (
                                <CompletedCycleCard key={cycle.id} cycle={cycle} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">还没有已完成的生产周期。</p>
                    )}
                </section>
            </main>

        </div>
    );
}