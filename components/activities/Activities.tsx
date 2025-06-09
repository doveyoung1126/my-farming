// components/activities/Activities.tsx
'use client';
import { ActivityWithFinancials, PrismaPlots } from '@/lib/types'
import ActivitiesList from '../ActivitiesList'
import { useState } from 'react'
import { getPlotCycles } from '@/lib/data'

export default function Activities({
    plots,
    activities
}: {
    plots: PrismaPlots[]
    activities: ActivityWithFinancials[]
}) {
    const [selectedPlot, setSelectedPlot] = useState<number | 'all'>('all');
    const [selectedCycle, setSelectedCycle] = useState<string | 'all'>('all')
    console.log(activities)
    // 客户端过滤逻辑
    const filteredPlotActivities = activities.filter(activity =>
        selectedPlot === 'all' ? true : activity.plotId === selectedPlot
    );
    console.log(filteredPlotActivities)

    const cycles = selectedPlot === 'all' ? [] : getPlotCycles(filteredPlotActivities, selectedPlot)

    const filterActivities = () => {
        if (cycles.length === 0 || selectedCycle === 'all') {
            console.log(filteredPlotActivities)
            return filteredPlotActivities
        }
        else {
            const filter = cycles.filter(cycle => cycle.id === selectedCycle)
            const filteredActivities = filter[0]

            return [...filteredActivities.activities].reverse()
        }

    }
    const filteredActivities = filterActivities()

    const PlotsOverview = ({ plots }: { plots: PrismaPlots[] }) => {

        return (
            <div className="p-4 border-b">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plots.map(plot => (
                        <div
                            key={plot.id}
                            onClick={() => {
                                setSelectedPlot(prev => prev === plot.id ? "all" : plot.id)
                                setSelectedCycle('all')
                            }}
                            className={` p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow ${selectedPlot === plot.id
                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                : 'bg-white'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium">{plot.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {plot.area}亩
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-sm ${plot.crop
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {plot.crop || '空闲'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const CycleSelect = () => {
        return (
            <div className="px-4 flex gap-2 border-b">
                {cycles.map((cycle) => (
                    <button
                        key={cycle.id}
                        onClick={() => setSelectedCycle(prev => prev === cycle.id ? 'all' : cycle.id)}
                        className={`px-4 py-2 rounded-t-lg text-m font-bold mb-4 transition-colors  ${selectedCycle === cycle.id
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        suppressHydrationWarning
                    >
                        种植周期 {cycle.start.toLocaleDateString('zh-cn')} {`${(cycle.end) ? '已结束' : '进行中'}`}
                    </button>
                ))}
            </div>
        )
    }


    return (
        <>
            <PlotsOverview plots={plots} />
            {/* <p className="text-xl font-bold mb-4">时间线</p> */}
            <CycleSelect />

            {/* 地块筛选下拉框 */}
            {/* <div className="mb-4">
                <select
                    value={selectedPlot}
                    onChange={(e) => setSelectedPlot(
                        e.target.value === 'all' ? 'all' : Number(e.target.value)
                    )}
                    className="w-full p-2 border rounded-lg bg-white"
                >
                    <option value="all">所有地块</option>
                    {plots.map(plot => (
                        <option key={plot.id} value={plot.id}>
                            {plot.name}
                        </option>
                    ))}
                </select>
            </div> */}

            {/* 时间轴列表 */}
            <div className="flex-1 overflow-y-auto pb-30">
                <div className="space-y-4 p-2">
                    <ActivitiesList activities={filteredActivities} />
                </div>
            </div>
        </>
    );
}