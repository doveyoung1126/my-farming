import { ActivityCycle } from "@/lib/types";
import { getActivitiesRecordsSummary } from "@/lib/data";
import { Leaf, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const CompletedCycleCard = ({ cycle }: { cycle: ActivityCycle }) => {
    const summary = getActivitiesRecordsSummary(cycle.activities);

    const ProfitIndicator = () => {
        if (summary.cycleProfit > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (summary.cycleProfit < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-500" />;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-800">{cycle.plot.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Leaf className="w-4 h-4 mr-1.5 text-gray-400" />
                        {cycle.plot.crop} (已完成)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${summary.cycleProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        ROI: {summary.cycleRoi.toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-xs text-gray-500 mb-1">总支出</p>
                    <p className="text-md font-medium text-red-600">
                        ¥{Math.abs(summary.cycleExpense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">总收入</p>
                    <p className="text-md font-medium text-green-600">
                        ¥{summary.cycleIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">净利润</p>
                    <p className={`text-md font-bold ${summary.cycleProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.cycleProfit >= 0 ? '+' : '-'}
                        ¥{Math.abs(summary.cycleProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
};