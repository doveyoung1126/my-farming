// components/newdashboard/OngoingCycleCard.tsx
'use client';

import Link from "next/link";
import { ActivityCycle } from "@/lib/types";
import { getActivitiesRecordsSummary } from "@/lib/data";

export const OngoingCycleCard = ({ cycle }: { cycle: ActivityCycle }) => {
    const summary = getActivitiesRecordsSummary(cycle.activities);
    const days = Math.floor((new Date().getTime() - cycle.start.getTime()) / (1000 * 60 * 60 * 24));

    // 预算相关计算
    const hasBudget = typeof cycle.budget === 'number' && cycle.budget > 0;
    const expense = Math.abs(summary.cycleExpense);
    const budgetProgress = hasBudget ? (expense / cycle.budget!) * 100 : 0;
    const remainingBudget = hasBudget ? cycle.budget! - expense : 0;
    const isOverBudget = hasBudget && expense > cycle.budget!;

    // 找到周期的起始活动ID
    const cycleStartActivity = cycle.activities.find(a => a.cycleMarker === 'START');
    if (!cycleStartActivity) return null; // 如果没有起始活动，则不渲染卡片

    return (
        <Link href={`/cycles/${cycleStartActivity.id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-200">
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
            <div className="p-4 space-y-4">
                {hasBudget ? (
                    <div>
                        <div className="flex justify-between items-center text-sm text-slate-600 mb-1">
                            <span>预算执行</span>
                            <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-800'}`}>
                                ¥{expense.toLocaleString()} / <span className="text-xs">¥{cycle.budget!.toLocaleString()}</span>
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div 
                                className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, budgetProgress)}%` }}
                            ></div>
                        </div>
                        <p className={`text-xs mt-1.5 text-right ${isOverBudget ? 'text-red-500' : 'text-slate-500'}`}>
                            {isOverBudget ? `已超支 ¥${Math.abs(remainingBudget).toLocaleString()}` : `剩余 ¥${remainingBudget.toLocaleString()}`}
                        </p>
                    </div>
                ) : (
                    <div className="text-center p-3 bg-slate-100 rounded-lg">
                        <p className="font-medium text-slate-700">已投入 ¥{expense.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-1">未设置预算</p>
                    </div>
                )}
                
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                    最近操作: {cycle.activities[cycle.activities.length - 1]?.type || '无'}
                </div>
            </div>

            {/* Card Footer */}
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100">
                <div className="w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    + 添加记录
                </div>
            </div>
        </Link>
    );
};