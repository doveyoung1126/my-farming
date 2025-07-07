// components/newdashboard/CompletedCycleCard.tsx
'use client';

import Link from "next/link";
import { ActivityCycle } from "@/lib/types";
import { getActivitiesRecordsSummary } from "@/lib/data";

export const CompletedCycleCard = ({ cycle }: { cycle: ActivityCycle }) => {
    const summary = getActivitiesRecordsSummary(cycle.activities);
    const isProfitable = summary.cycleProfit >= 0;

    // 预算信息
    const displayBudget = cycle.budget ? ` / ¥${cycle.budget.toLocaleString()}` : '';
    const budgetStatus = cycle.budget ? (Math.abs(summary.cycleExpense) <= cycle.budget ? '✅ 预算内' : '❗ 超预算') : '';

    // 找到周期的起始活动ID
    const cycleStartActivity = cycle.activities.find(a => a.cycleMarker === 'START');
    if (!cycleStartActivity) return null; // 如果没有起始活动，则不渲染卡片

    return (
        <Link href={`/cycles/${cycleStartActivity.id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-200">
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800">{cycle.plot.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">作物: {cycle.plot.crop || '未指定'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isProfitable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isProfitable ? '盈利' : '亏损'}
                    </div>
                </div>

                <div className="text-center my-4">
                    <p className={`text-4xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                        {isProfitable ? '+' : ''}¥{summary.cycleProfit.toLocaleString()}
                    </p>
                </div>

                <div className="flex justify-around text-center text-sm text-slate-600 border-t border-slate-100 pt-3 mt-4">
                    <div>
                        <p className="text-xs text-slate-500">总收入</p>
                        <p className="font-semibold">¥{summary.cycleIncome.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">总支出</p>
                        <p className="font-semibold">¥{Math.abs(summary.cycleExpense).toLocaleString()}{displayBudget}</p>
                        {budgetStatus && <p className="text-xs text-slate-500 mt-0.5">{budgetStatus}</p>}
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">回报率</p>
                        <p className={`font-semibold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>{summary.cycleRoi.toFixed(1)}%</p>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-center">
                <div className="text-sm font-medium text-slate-500 hover:text-slate-700">
                    查看详情 &gt;
                </div>
            </div>
        </Link>
    );
};