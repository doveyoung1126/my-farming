import { ActivityCycle } from "@/lib/types";
import { getActivitiesRecordsSummary } from "@/lib/data";
import { Leaf, TrendingUp } from "lucide-react";

export const OngoingCycleCard = ({ cycle }: { cycle: ActivityCycle }) => {
    const summary = getActivitiesRecordsSummary(cycle.activities);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-800">{cycle.plot.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Leaf className="w-4 h-4 mr-1.5 text-green-500" />
                        {cycle.plot.crop}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
                        进行中
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">当前累计支出</p>
                <p className="text-2xl font-semibold text-red-600">
                    ¥{Math.abs(summary.cycleExpense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );
};