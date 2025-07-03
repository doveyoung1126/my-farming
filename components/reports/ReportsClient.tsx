// components/reports/ReportsClient.tsx
'use client';

import { useState } from 'react';
import { ActivityWithFinancials, FinancialWithActivity, PrismaPlots } from '@/lib/types';
import { FinancialReportView } from './FinancialReportView';
import { ActivityLogView } from './ActivityLogView';

type View = 'financial' | 'activity';

interface ReportsClientProps {
    plots: PrismaPlots[];
    activities: ActivityWithFinancials[];
    records: FinancialWithActivity[];
}

/**
 * 报告页面的客户端容器组件
 * 
 * 职责:
 * 1. 管理当前激活的视图状态 (财务报告 vs 农事日志)。
 * 2. 渲染标签页切换器，并处理切换逻辑。
 * 3. 根据当前激活的视图，渲染对应的子组件，并传入所需的数据。
 */
export function ReportsClient({ plots, activities, records }: ReportsClientProps) {
    const [activeView, setActiveView] = useState<View>('financial');

    return (
        <div>
            {/* 视图切换器 */}
            <div className="bg-white sticky top-[88px] z-10 px-4 pt-4 shadow-sm">
                <div className="flex border-b">
                    <button 
                        onClick={() => setActiveView('financial')} 
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeView === 'financial' 
                                ? 'border-b-2 border-blue-600 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        财务报告
                    </button>
                    <button 
                        onClick={() => setActiveView('activity')} 
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeView === 'activity' 
                                ? 'border-b-2 border-blue-600 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        农事日志
                    </button>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
                {activeView === 'financial' && (
                    <FinancialReportView records={records} />
                )}
                {activeView === 'activity' && (
                    <ActivityLogView activities={activities} plots={plots} />
                )}
            </div>
        </div>
    );
}