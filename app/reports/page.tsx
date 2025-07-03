// app/reports/page.tsx
import { getAllActiviesDetails, getPlots } from '@/lib/data';
import { ActivityWithFinancials, FinancialWithActivity, PrismaPlots } from '@/lib/types';
import { ReportsClient } from '@/components/reports/ReportsClient';

/**
 * 分析报告页面 (服务端组件)
 * 
 * 职责:
 * 1. 从服务器获取所有需要的基础数据 (地块、活动、财务记录)。
 * 2. 对数据进行初步处理，以符合客户端组件的需要。
 * 3. 将处理后的数据传递给客户端组件 `ReportsClient` 进行渲染和交互。
 */
export default async function ReportsPage() {

    // 1. 并行获取所有必需的数据
    const [plots, activities] = await Promise.all([
        getPlots(),
        getAllActiviesDetails(),
    ]);

    // 2. 将活动中的财务记录提取并扁平化，同时注入关联的活动信息
    // 这是为了方便在财务报告中直接显示每笔收支所关联的农事活动
    const records: FinancialWithActivity[] = activities.flatMap(activity => {
        if (!activity.records || activity.records.length === 0) {
            return [];
        }
        return activity.records.map(record => ({
            ...record,
            activityId: activity.id,
            activityType: activity.type,
            activityDate: activity.date,
            plotName: activity.plotName,
            crop: activity.crop,
        }));
    });

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-16">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-800">分析报告</h1>
                <p className="text-sm text-gray-500 mt-1">在这里回顾您的所有农事活动和财务状况。</p>
            </header>

            <main className="flex-1 overflow-y-auto">
                <ReportsClient 
                    plots={plots} 
                    activities={activities} 
                    records={records} 
                />
            </main>
        </div>
    );
}