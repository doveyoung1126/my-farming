import { getAllActiviesDetails, getPlots, getPlotCycles } from '@/lib/data';
import { ActivityCycle, PrismaPlots, ActivityWithFinancials } from '@/lib/types';
import { OngoingCycleCard } from '@/components/newdashboard/OngoingCycleCard';
import { CompletedCycleCard } from '@/components/newdashboard/CompletedCycleCard';
import { Plus } from 'lucide-react';

export default async function NewDashboardPage() {

    const plots: PrismaPlots[] = await getPlots();
    const activities: ActivityWithFinancials[] = await getAllActiviesDetails();

    // This logic should ideally be in a separate utility or data function
    const allCycles: ActivityCycle[] = plots.flatMap(plot => {
        const plotActivities = activities.filter(a => a.plotId === plot.id);
        return getPlotCycles(plotActivities, plot.id, plots).map(cycle => ({ ...cycle, plot }));
    });

    const ongoingCycles = allCycles.filter(cycle => cycle.end === null);
    const completedCycles = allCycles.filter(cycle => cycle.end !== null).sort((a, b) => b.end!.getTime() - a.end!.getTime());

    return (
        <div className="h-full bg-gray-50 overflow-y-auto pb-20">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">新总览</h1>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        快捷操作
                    </button>
                </div>
            </header>

            <main className="p-4 space-y-6">
                {/* Ongoing Cycles Section */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">进行中的周期</h2>
                    {ongoingCycles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ongoingCycles.map(cycle => (
                                <OngoingCycleCard key={cycle.id} cycle={cycle} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">当前没有正在进行的生产周期。</p>
                    )}
                </section>

                {/* Completed Cycles Section */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">已完成的周期</h2>
                    {completedCycles.length > 0 ? (
                        <div className="space-y-4">
                            {completedCycles.map(cycle => (
                                <CompletedCycleCard key={cycle.id} cycle={cycle} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">还没有已完成的生产周期。</p>
                    )}
                </section>
            </main>
        </div>
    );
}