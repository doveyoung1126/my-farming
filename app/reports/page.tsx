export const dynamic = 'force-dynamic'; // 为了数据准确性，需要声明动态页面，但是后期必须更改

import { getAllActivities, getPlots, getRecordCategoryTypes, getRecordsWithDetails, getActivityTypes } from '@/lib/data';
import { ReportsClient } from '@/components/features/reports/ReportsClient';

/**
 * 分析报告页面 (服务端组件)
 * 
 * 职责:
 * 1. 从服务器独立获取所有需要的基础数据。
 * 2. 将数据传递给 ReportsProvider，由它来管理状态和交互。
 */
export default async function ReportsPage() {

    // 1. 并行获取所有必需的数据
    const [plots, activities, records, recordCategoryTypes, activityTypes] = await Promise.all([
        getPlots(true), // 传入 true 来获取所有地块
        getAllActivities(),
        getRecordsWithDetails(), // 直接从数据库获取所有财务记录
        getRecordCategoryTypes(), // 获取财务记录类型
        getActivityTypes() // Fetch activity types
    ]);

    // 准备要传递给 Provider 的初始数据 (不包含 plots)
    const providerInitialData = { plots, activityTypes, recordCategoryTypes };

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
                    recordCategoryTypes={recordCategoryTypes}
                    activityTypes={activityTypes} // Pass activityTypes
                />
            </main>
        </div>
    );
}
