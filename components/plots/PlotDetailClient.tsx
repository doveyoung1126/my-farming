// components/plots/PlotDetailClient.tsx
'use client';

import { ActivityCycle } from "@/lib/types";
import { OngoingCycleCard } from "@/components/newdashboard/OngoingCycleCard";
import { CompletedCycleCard } from "@/components/newdashboard/CompletedCycleCard";

export function PlotDetailClient({ cycles }: { cycles: ActivityCycle[] }) {
    const ongoingCycles = cycles.filter(cycle => cycle.end === null);
    const completedCycles = cycles.filter(cycle => cycle.end !== null).sort((a, b) => b.end!.getTime() - a.end!.getTime());

    return (
        <div className="p-4 space-y-6">
            {/* Ongoing Cycles Section */}
            <section>
                <h2 className="text-lg font-semibold text-slate-700 mb-3">地里正在长的周期</h2>
                {ongoingCycles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ongoingCycles.map(cycle => (
                            <OngoingCycleCard key={cycle.id} cycle={cycle} />
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">该地块当前没有正在进行的生产周期。</p>
                )}
            </section>

            {/* Completed Cycles Section */}
            <section>
                <h2 className="text-lg font-semibold text-slate-700 mb-3">已经收获的周期</h2>
                {completedCycles.length > 0 ? (
                    <div className="space-y-4">
                        {completedCycles.map(cycle => (
                            <CompletedCycleCard key={cycle.id} cycle={cycle} />
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">该地块还没有已完成的生产周期。</p>
                )}
            </section>
        </div>
    );
}