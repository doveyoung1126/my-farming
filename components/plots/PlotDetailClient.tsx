// components/plots/PlotDetailClient.tsx
'use client';

import { ActivityCycle, PrismaPlots } from "@/lib/types";
import { OngoingCycleCard } from "@/components/newdashboard/OngoingCycleCard";
import { CompletedCycleCard } from "@/components/newdashboard/CompletedCycleCard";
import { useState, useEffect } from "react";
import { EditPlotForm } from "@/components/forms/EditPlotForm";
import { useRouter } from "next/navigation";
import { PlotDetailHeader } from "./PlotDetailHeader";
import { getActivitiesRecordsSummary } from "@/lib/data";

export function PlotDetailClient({ plot, cycles }: { plot: PrismaPlots, cycles: ActivityCycle[] }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [shouldRenderModal, setShouldRenderModal] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isEditModalOpen) {
            setShouldRenderModal(true);
            const timer = setTimeout(() => setIsModalVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsModalVisible(false);
            const timer = setTimeout(() => setShouldRenderModal(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isEditModalOpen]);

    const ongoingCycles = cycles.filter(cycle => cycle.status === 'ongoing');
    const completedCycles = cycles.filter(cycle => cycle.status === 'completed' || cycle.status === 'aborted').sort((a, b) => b.end!.getTime() - a.end!.getTime());

    const summary = getActivitiesRecordsSummary(cycles.flatMap(c => c.activities));

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        router.refresh();
    };

    return (
        <>
            <PlotDetailHeader
                plotName={plot.name}
                plotArea={plot.area}
                currentCrop={plot.crop}
                onEdit={() => setIsEditModalOpen(true)}
            />

            <main className="flex-1 overflow-y-auto">
                {/* 地块汇总数据 */}
                <div className="p-4">
                    <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-lg overflow-hidden shadow">
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总收入</p><p className="text-base font-bold text-green-600">¥{summary.cycleIncome.toLocaleString()}</p></div>
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总支出</p><p className="text-base font-bold text-red-600">¥{Math.abs(summary.cycleExpense).toLocaleString()}</p></div>
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">净利润</p><p className={`text-base font-bold ${(summary.cycleProfit) >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>¥{summary.cycleProfit.toLocaleString()}</p></div>
                    </div>
                </div>

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
            </main>

            {shouldRenderModal && (
                <div 
                    className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-out ${isModalVisible ? 'opacity-100 bg-gray-900/75' : 'opacity-0'}`}
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div 
                        className={`bg-white rounded-lg w-full max-w-md p-4 shadow-lg transform transition-transform duration-300 ease-out ${isModalVisible ? 'scale-100' : 'scale-95'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">编辑地块</h2>
                        <EditPlotForm 
                            plot={plot}
                            onSuccess={handleEditSuccess}
                            onCancel={() => setIsEditModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}