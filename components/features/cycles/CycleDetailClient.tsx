// components/cycles/CycleDetailClient.tsx
'use client';

import { useMemo, useState } from 'react';
import { ActivityCycle, ActivityType, FinancialWithActivity, PrismaPlots } from "@/lib/types";
import ActivitiesList from '@/components/features/reports/ActivitiesList';
import { RecordItem } from '@/components/features/reports/RecordItem';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FormModal } from '@/components/ui/FormModal';
import { EditFinancialRecordForm } from '../records/forms/EditFinancialRecordForm';
import { EditActivityForm } from '../activities/forms/EditActivityForm';
import { RecordCategoryType } from '@prisma/client';

interface CycleDetailClientProps {
    cycle: ActivityCycle
    plots: PrismaPlots[]
    recordCategoryTypes: RecordCategoryType[]
    activityTypes: ActivityType[]
}
export function CycleDetailClient({ cycle, plots, recordCategoryTypes, activityTypes }: CycleDetailClientProps) {
    const [activeView, setActiveView] = useState('activity'); // 默认显示农事日志

    // 将周期内的财务记录扁平化，并注入关联的活动信息
    const { activities } = cycle
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
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // 按日期降序排序
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams(); // Initialize useSearchParams
    const editActivityId = searchParams.get('editActivity'); // Get activity ID from URL
    const editRecordId = searchParams.get('editRecord'); // Get record ID from URL

    const activityToEdit = useMemo(() => {
        if (!editActivityId) return null;
        return activities.find(a => a.id === parseInt(editActivityId));
    }, [editActivityId, activities]);

    const recordToEdit = useMemo(() => {
        if (!editRecordId) return null;
        return records.find(r => r.id === parseInt(editRecordId));
    }, [editRecordId, records]);

    const handleCloseModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('editActivity');
        params.delete('editRecord');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div>
            {/* 视图切换器 */}
            <div className="px-4">
                <div className="flex border-b border-slate-200">
                    <button onClick={() => setActiveView('activity')} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'activity' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>农事日志</button>
                    <button onClick={() => setActiveView('financial')} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'financial' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>财务数据</button>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
                {activeView === 'financial' ?
                    <FinancialRecordListView records={records} /> :
                    <ActivitiesList activities={cycle.activities} isEditAble />
                }
            </div>

            {/* Modal 展示 */}
            {activityToEdit && (
                <FormModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    title="编辑农事活动"
                >
                    <EditActivityForm
                        initialActivity={activityToEdit} // 传递完整的对象
                        activityTypes={activityTypes}
                        plots={plots}
                        recordCategoryTypes={recordCategoryTypes}
                    />
                </FormModal>
            )}

            {recordToEdit && (
                <FormModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    title="编辑财务记录"
                >
                    <EditFinancialRecordForm
                        record={recordToEdit}
                        recordCategoryTypes={recordCategoryTypes}
                    />
                </FormModal>
            )}
        </div>
    );
}

function FinancialRecordListView({ records }: { records: FinancialWithActivity[] }) {
    if (records.length === 0) return <EmptyState message="没有找到相关的财务记录。" />;
    return (
        <div className="space-y-3">
            {records.map(record => <RecordItem key={record.id} record={record} isEditAble />)}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-10">
            <p className="text-slate-500">{message}</p>
        </div>
    );
}