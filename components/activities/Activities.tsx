// components/activities/Activities.tsx
'use client';
import { ActivityWithFinancials, PrismaPlots } from '@/lib/types'
import ActivitiesList from '../ActivitiesList'
import { useState } from 'react'
import { getPlotCycles, getActivitiesRecordsSummary } from '@/lib/data'

// 新增类型定义
type ActivityCycle = {
    id: string;
    start: Date;
    end: Date | null;
    activities: ActivityWithFinancials[];
};

export default function Activities({
    plots,
    activities
}: {
    plots: PrismaPlots[]
    activities: ActivityWithFinancials[]
}) {
    const [selectedPlot, setSelectedPlot] = useState<number | 'all'>('all');
    const [selectedCycle, setSelectedCycle] = useState<string | 'all'>('all');

    // 地块卡片组件
    const PlotsOverview = ({ plots }: { plots: PrismaPlots[] }) => (
        <div className="p-4 bg-white shadow-sm">
            {/* 网格容器：响应式布局 */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {plots.map(plot => (
                    <div
                        key={plot.id}
                        onClick={() => {
                            setSelectedPlot(prev => prev === plot.id ? "all" : plot.id);
                            setSelectedCycle('all');
                        }}
                        // 动态类名：根据选中状态改变样式
                        className={`
              p-4 rounded-xl cursor-pointer transition-all duration-300
              // 基础样式
              border border-gray-200 hover:border-blue-300
              // 选中状态
              ${selectedPlot === plot.id
                                ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md'
                                : 'bg-white shadow-sm'}
              // 动画效果
              transform hover:scale-[1.02] active:scale-[0.98]
            `}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                {/* 文字排版：层级分明 */}
                                <h3 className="text-lg font-semibold text-gray-800">{plot.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {plot.area}亩
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* 徽章样式：状态指示器 */}
                                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  // 动态颜色
                  ${plot.crop
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'}
                `}>
                                    {plot.crop || '空闲'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 周期选择器组件
    const CycleSelect = ({ cycles }: { cycles: ActivityCycle[] }) => {
        if (cycles.length === 0) return null;

        return (
            <div className="px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                    {/* 全部周期选项 */}
                    <button
                        onClick={() => setSelectedCycle('all')}
                        className={`
                            px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                            ${selectedCycle === 'all'
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'text-gray-500 hover:bg-gray-100'}
                        `}
                    >
                        全部周期
                    </button>

                    {/* 周期选项 */}
                    {cycles.map((cycle) => (
                        <button
                            key={cycle.id}
                            onClick={() => setSelectedCycle(cycle.id)}
                            className={`
                                px-3 py-1.5 rounded-full text-sm font-medium flex items-center
                                transition-colors
                                ${selectedCycle === cycle.id
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'text-gray-500 hover:bg-gray-100'}
                            `}
                        >
                            {/* 周期状态指示器 */}
                            <span className={`w-2 h-2 rounded-full mr-2 ${cycle.end ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></span>
                            {cycle.start.toLocaleDateString('zh-CN')}
                            {cycle.end ? ` - ${cycle.end.toLocaleDateString('zh-CN')}` : ' - 进行中'}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // 周期摘要组件
    const CycleSummary = ({ cycle }: { cycle: ActivityCycle }) => {
        const summary = getActivitiesRecordsSummary(cycle.activities);

        return (
            <div className="bg-white rounded-lg mx-4 my-3 p-3 shadow-sm border border-gray-100">
                {/* 紧凑型财务指标卡片 */}
                <div className="flex items-center justify-between">
                    {/* 支出指标 */}
                    <div className="text-center px-2 py-1">
                        <p className="text-xs text-gray-500 mb-1">支出</p>
                        <p className="text-sm font-medium text-red-600">
                            ¥{Math.abs(summary.cycleExpense).toFixed(2)}
                        </p>
                    </div>

                    {/* 分隔线 */}
                    <div className="w-px h-8 bg-gray-200"></div>

                    {/* 收入指标 */}
                    <div className="text-center px-2 py-1">
                        <p className="text-xs text-gray-500 mb-1">收入</p>
                        <p className="text-sm font-medium text-green-600">
                            ¥{summary.cycleIncome.toFixed(2)}
                        </p>
                    </div>

                    {/* 分隔线 */}
                    <div className="w-px h-8 bg-gray-200"></div>

                    {/* 利润指标 */}
                    <div className="text-center px-2 py-1">
                        <p className="text-xs text-gray-500 mb-1">利润</p>
                        <p className={`text-sm font-medium ${summary.cycleProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {summary.cycleProfit >= 0 ? '+' : '-'}¥{Math.abs(summary.cycleProfit).toFixed(2)}
                        </p>
                    </div>

                    {/* 分隔线 */}
                    <div className="w-px h-8 bg-gray-200"></div>

                    {/* ROI指标 */}
                    <div className="text-center px-2 py-1">
                        <p className="text-xs text-gray-500 mb-1">回报率</p>
                        <p className={`text-sm font-medium ${summary.cycleRoi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {summary.cycleRoi >= 0 ? '+' : ''}{summary.cycleRoi.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* 进度条 - 直观展示盈亏比例 */}
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>支出</span>
                        <span>收入</span>
                    </div>
                    <div className="w-full h-2 bg-green-500 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500"
                            style={{
                                width: `${Math.abs(summary.cycleExpense) / (Math.abs(summary.cycleExpense) + summary.cycleIncome) * 100}%`
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                            {Math.round(Math.abs(summary.cycleExpense) / (Math.abs(summary.cycleExpense) + summary.cycleIncome) * 100)}%成本
                        </span>
                        <span className="text-xs text-gray-500">
                            {Math.round(summary.cycleIncome / (Math.abs(summary.cycleExpense) + summary.cycleIncome) * 100)}%收益
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // 客户端过滤逻辑
    const filteredPlotActivities = activities.filter(activity =>
        selectedPlot === 'all' ? true : activity.plotId === selectedPlot
    );

    // 获取当前地块的周期
    const cycles = selectedPlot === 'all' ? [] :
        getPlotCycles(filteredPlotActivities, selectedPlot);

    // 获取当前周期的活动
    const getFilteredActivities = () => {
        if (cycles.length === 0 || selectedCycle === 'all') {
            return filteredPlotActivities;
        } else {
            const cycle = cycles.find(c => c.id === selectedCycle);
            return cycle ? [...cycle.activities].reverse() : [];
        }
    };

    const filteredActivities = getFilteredActivities();
    const currentCycle = cycles.find(c => c.id === selectedCycle);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* 地块概览 */}
            <PlotsOverview plots={plots} />

            {/* 周期选择器 */}
            {selectedPlot !== 'all' && <CycleSelect cycles={cycles} />}

            {/* 周期摘要 */}
            {currentCycle && <CycleSummary cycle={currentCycle} />}

            {/* 活动列表 */}

            <div className="flex-1 overflow-y-auto mt-3">
                <div className="space-y-4 px-2">
                    <ActivitiesList activities={filteredActivities} />
                </div>
            </div>
        </div>
    );
}