// components/features/dashboard/CompletedCycleCard.tsx
'use client';

import Link from "next/link";
import { ActivityCycle } from "@/lib/types";

export const CompletedCycleCard = ({ cycle }: { cycle: ActivityCycle }) => {
    // summary 现在由父组件通过 props 传入
    const summary = cycle.summary;
    if (!summary) return null; // 如果没有摘要信息，则不渲染

    const isProfitable = summary.netProfit >= 0;
    const isAborted = cycle.status === 'aborted';

    // 预算信息
    const displayBudget = cycle.budget ? ` / ¥${cycle.budget.toLocaleString()}` : '';
    const budgetStatus = cycle.budget ? (Math.abs(summary.totalExpense) <= cycle.budget ? '✅ 预算内' : '❗ 超预算') : '';

    const getStatusBadge = () => {
        if (isAborted) {
            return <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">已中止</div>;
        }
        if (isProfitable) {
            return <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">盈利</div>;
        }
        return <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">亏损</div>;
    };

    return (
        // 直接使用 cycle.id 构建链接
        <Link href={`/cycles/${cycle.id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-200">
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800">{cycle.plot.name}</h3>
                        {/* 直接使用 cycle.crop */}
                        <p className="text-sm text-slate-500 mt-1">作物: {cycle.crop || '未指定'}</p>
                    </div>
                    {getStatusBadge()}
                </div>

                <div className="text-center my-4">
                    <p className={`text-4xl font-bold ${isAborted ? 'text-gray-600' : (isProfitable ? 'text-green-600' : 'text-red-600')}`}>
                        {isAborted ? '-' : (isProfitable ? '+' : '')}¥{isAborted ? Math.abs(summary.totalExpense).toLocaleString() : summary.netProfit.toLocaleString()}
                    </p>
                    {isAborted && <p className="text-xs text-gray-500 mt-1">总投入</p>}
                </div>

                <div className="flex justify-around text-center text-sm text-slate-600 border-t border-slate-100 pt-3 mt-4">
                    <div>
                        <p className="text-xs text-slate-500">总收入</p>
                        <p className="font-semibold">¥{summary.totalIncome.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">总支出</p>
                        <p className="font-semibold">¥{Math.abs(summary.totalExpense).toLocaleString()}{displayBudget}</p>
                        {budgetStatus && <p className="text-xs text-slate-500 mt-0.5">{budgetStatus}</p>}
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">回报率</p>
                        <p className={`font-semibold ${isAborted ? 'text-gray-600' : (isProfitable ? 'text-green-600' : 'text-red-600')}`}>
                            {isAborted ? 'N/A' : `${summary.roi.toFixed(1)}%`}
                        </p>
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
