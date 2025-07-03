// components/newdashboard/OngoingCycleCard.tsx
'use client';
import { ActivityCycle } from "@/lib/types";
import { getActivitiesRecordsSummary } from "@/lib/data";

export const OngoingCycleCard = ({ cycle }: { cycle: ActivityCycle }) => {
    const summary = getActivitiesRecordsSummary(cycle.activities);
    const days = Math.floor((new Date().getTime() - cycle.start.getTime()) / (1000 * 60 * 60 * 24));

    // 计算预算进度条的百分比
    const budgetProgress = cycle.budget ? (Math.abs(summary.cycleExpense) / cycle.budget) * 100 : 0;
    const displayBudget = cycle.budget ? ` / ¥${cycle.budget.toLocaleString()}` : '';

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-200">
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-800">{cycle.plot.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">作物: {cycle.plot.crop || '未指定'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{days}</p>
                        <p className="text-xs text-slate-500">天</p>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
                <div>
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                        <span>已投入</span>
                        <span className="font-semibold text-red-600">¥{Math.abs(summary.cycleExpense).toLocaleString()}{displayBudget}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, budgetProgress)}%` }}></div>
                    </div>
                    {budgetProgress > 100 && (
                        <p className="text-xs text-red-500 mt-1">已超出预算！</p>
                    )}
                </div>
                <div className="text-xs text-slate-400 pt-2">
                    最近操作: {cycle.activities[cycle.activities.length - 1]?.type || '无'}
                </div>
            </div>

            {/* Card Footer */}
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100">
                <button className="w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    + 添加记录
                </button>
            </div>
        </div>
    );
};