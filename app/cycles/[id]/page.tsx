import { getCycleDetailsById, getPlots, getRecordCategoryTypes, getActivityTypes } from "@/lib/data";
import { notFound } from "next/navigation";
import { CycleDetailClient } from "@/components/features/cycles/CycleDetailClient";
import { CycleDetailHeader } from "@/components/features/cycles/CycleDetailHeader";
import { ActivityCycle } from "@/lib/types";

export default async function CycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cycleId = parseInt(id, 10);
    if (isNaN(cycleId)) {
        notFound();
    }

    // getCycleDetailsById 现在返回的周期已包含 summary
    const cycle = await getCycleDetailsById(cycleId);

    if (!cycle || !cycle.summary) {
        notFound();
    }
    const summary = cycle.summary;

    const [plots, recordCategoryTypes, activityTypes] = await Promise.all([
        getPlots(true),
        getRecordCategoryTypes(),
        getActivityTypes()
    ]);

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-16">
            <CycleDetailHeader
                plotName={cycle.plot.name}
                crop={cycle.crop} // 直接使用 cycle.crop
                startDate={cycle.startDate}
                endDate={cycle.endDate}
            />

            <main className="flex-1 overflow-y-auto">
                {/* 周期摘要卡片 */}
                <div className="p-4">
                    {cycle.status === 'ongoing' && cycle.budget ? (
                        // 进行中周期的 "预算控制器" 视图
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex justify-between items-center text-sm text-slate-600 mb-1">
                                <span>预算执行</span>
                                <span className={`font-bold ${summary.totalExpense > cycle.budget ? 'text-red-600' : 'text-slate-800'}`}>
                                    ¥{Math.abs(summary.totalExpense).toLocaleString()} / <span className="text-xs">¥{cycle.budget.toLocaleString()}</span>
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${(summary.totalExpense > cycle.budget) ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, (Math.abs(summary.totalExpense) / (cycle.budget || 1)) * 100)}%` }}
                                ></div>
                            </div>
                            <p className={`text-xs mt-1.5 text-right ${(summary.totalExpense > cycle.budget) ? 'text-red-500' : 'text-slate-500'}`}>
                                {cycle.budget - Math.abs(summary.totalExpense) >= 0 ? `剩余 ¥${(cycle.budget - Math.abs(summary.totalExpense)).toLocaleString()}` : `已超支 ¥${(Math.abs(summary.totalExpense) - cycle.budget).toLocaleString()}`}
                            </p>
                        </div>
                    ) : (
                        // 已完成或中止周期的 "成绩单" 视图
                        <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-lg overflow-hidden shadow">
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总收入</p><p className="text-base font-bold text-green-600">¥{summary.totalIncome.toLocaleString()}</p></div>
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总支出</p><p className="text-base font-bold text-red-600">¥{Math.abs(summary.totalExpense).toLocaleString()}</p></div>
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">{cycle.status === 'aborted' ? '总投入' : '净利润'}</p><p className={`text-base font-bold ${cycle.status === 'aborted' ? 'text-gray-600' : (summary.netProfit >= 0 ? 'text-emerald-600' : 'text-amber-600')}`}>{cycle.status === 'aborted' ? `¥${summary.totalExpense.toLocaleString()}` : `¥${summary.netProfit.toLocaleString()}`}</p></div>
                        </div>
                    )}
                </div>

                <CycleDetailClient
                    cycle={cycle as ActivityCycle}
                    plots={plots}
                    recordCategoryTypes={recordCategoryTypes}
                    activityTypes={activityTypes}
                />
            </main>
        </div>
    );
}