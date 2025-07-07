// app/reports/page.tsx
import { getAllActiviesDetails, getPlots, getRecordsWithActivity } from '@/lib/data';
import { ReportsClient } from '@/components/reports/ReportsClient';

/**
 * 分析报告页面 (服务端组件)
 * 
 * 职责:
 * 1. 从服务器独立获取所有需要的基础数据 (地块、活动、财务记录)。
 * 2. 将原始数据直接传递给客户端组件 `ReportsClient` 进行渲染和交互。
 */
export default async function ReportsPage() {

    // 1. 并行获取所有必需的数据，确保数据来源独立
    const [plots, activities, records] = await Promise.all([
        getPlots(),
        getAllActiviesDetails(),
        getRecordsWithActivity() // 直接从数据库获取所有财务记录
    ]);

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