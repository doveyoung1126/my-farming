import { getCycleDetailsById, getActivitiesRecordsSummary } from "@/lib/data";
import { notFound } from "next/navigation";
import { CycleDetailClient } from "@/components/cycles/CycleDetailClient";
import { CycleDetailHeader } from "@/components/cycles/CycleDetailHeader";

export default async function CycleDetailPage({ params }: { params: Promise<{ activityId: string }> }) {
    const { activityId } = await params
    const actId = parseInt(activityId, 10);
    if (isNaN(actId)) {
        notFound();
    }

    const cycle = await getCycleDetailsById(actId);

    if (!cycle) {
        notFound();
    }

    const summary = getActivitiesRecordsSummary(cycle.activities);

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-16">
            <CycleDetailHeader 
                plotName={cycle.plot.name}
                crop={cycle.plot.crop}
                startDate={cycle.start}
                endDate={cycle.end}
            />

            <main className="flex-1 overflow-y-auto">
                {/* 周期摘要卡片 */}
                <div className="p-4">
                    {cycle.end ? (
                        // 已完成周期的 "成绩单" 视图
                        <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-lg overflow-hidden shadow">
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总收入</p><p className="text-base font-bold text-green-600">¥{summary.cycleIncome.toLocaleString()}</p></div>
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总支出</p><p className="text-base font-bold text-red-600">¥{Math.abs(summary.cycleExpense).toLocaleString()}</p></div>
                            <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">净利润</p><p className={`text-base font-bold ${(summary.cycleProfit) >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>¥{summary.cycleProfit.toLocaleString()}</p></div>
                        </div>
                    ) : (
                        // 进行中周期的 "预算控制器" 视图
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex justify-between items-center text-sm text-slate-600 mb-1">
                                <span>预算执行</span>
                                <span className={`font-bold ${summary.cycleExpense > (cycle.budget || 0) ? 'text-red-600' : 'text-slate-800'}`}>
                                    ¥{Math.abs(summary.cycleExpense).toLocaleString()} / <span className="text-xs">¥{(cycle.budget || 0).toLocaleString()}</span>
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full ${(summary.cycleExpense > (cycle.budget || 0)) ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, (Math.abs(summary.cycleExpense) / (cycle.budget || 1)) * 100)}%` }}
                                ></div>
                            </div>
                            <p className={`text-xs mt-1.5 text-right ${(summary.cycleExpense > (cycle.budget || 0)) ? 'text-red-500' : 'text-slate-500'}`}>
                                { (cycle.budget || 0) - Math.abs(summary.cycleExpense) >= 0 ? `剩余 ¥${((cycle.budget || 0) - Math.abs(summary.cycleExpense)).toLocaleString()}` : `已超支 ¥${(Math.abs(summary.cycleExpense) - (cycle.budget || 0)).toLocaleString()}`}
                            </p>
                        </div>
                    )}
                </div>

                <CycleDetailClient cycle={cycle} />
            </main>
        </div>
    );
}