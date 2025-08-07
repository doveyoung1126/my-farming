// components/cycles/CycleDetailClient.tsx
'use client';

import { Suspense, useState, useMemo } from 'react';
import { ActivityCycle, ActivityType, RecordWithDetails, Plot, RecordCategoryType } from "@/lib/types";
import ActivitiesList from '@/components/features/reports/ActivitiesList';
import { RecordItem } from '@/components/features/reports/RecordItem';
import { UrlActionHandler } from '@/components/ui/UrlActionHandler';
import { FormModal } from '@/components/ui/FormModal';
import { EditFinancialRecordForm } from '../records/forms/EditFinancialRecordForm';
import { EditActivityForm } from '../activities/forms/EditActivityForm';
import { DeleteRecordConfirmation } from '../records/forms/DeleteRecordConfirmation';
import { DeleteActivityConfirmation } from '../activities/forms/DeleteActivityConfirmation';

interface CycleDetailClientProps {
    cycle: ActivityCycle
    plots: Plot[]
    recordCategoryTypes: RecordCategoryType[]
    activityTypes: ActivityType[]
}
export function CycleDetailClient({ cycle, plots, recordCategoryTypes, activityTypes }: CycleDetailClientProps) {
    const [activeView, setActiveView] = useState('activity'); // 默认显示农事日志

    // 使用 useMemo 优化，仅在 cycle.activities 变化时重新计算
    const records = useMemo(() => {
        return cycle.activities
            .flatMap(activity =>
                // 为每个 record 注入其所属的 activity 的完整信息
                activity.records.map(record => {
                    // **关键修复**: 创建一个在类型上与 RecordWithDetails 完全匹配的对象
                    const recordWithFullActivity = {
                        ...record,
                        activity: {
                            ...activity,
                            cycle: cycle, // 注入顶层的 cycle 对象以满足类型定义
                        },
                    };
                    return recordWithFullActivity as RecordWithDetails;
                })
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [cycle.activities, cycle]);


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
                    <ActivitiesList activities={cycle.activities} isEditAble={true} /> // isEditAble 保持 false
                }
            </div>

            {/* URL 驱动执行编辑 -- 暂时注释掉以进行测试 */}
            <Suspense>
                <UrlActionHandler
                    actions={[
                        {
                            param: "editActivity",
                            render: (id, onClose) => {
                                const activityToEdit = cycle.activities.find(a => a.id === parseInt(id))
                                if (!activityToEdit) return null
                                return (
                                    <FormModal
                                        isOpen={true}
                                        onClose={onClose}
                                        title="编辑农事活动"
                                    >
                                        <EditActivityForm
                                            activityId={activityToEdit.id}
                                            onClose={onClose}
                                        />
                                    </FormModal>
                                )
                            }
                        }, {
                            param: "editRecord",
                            render: (id, onClose) => {
                                const recordToEdit = records.find(r => r.id === parseInt(id))
                                if (!recordToEdit) return null
                                return (
                                    <FormModal
                                        isOpen={true}
                                        onClose={onClose}
                                        title="编辑财务记录"
                                    >
                                        <EditFinancialRecordForm
                                            record={recordToEdit}
                                            recordCategoryTypes={recordCategoryTypes}
                                            onClose={onClose}
                                        />
                                    </FormModal>
                                )
                            }
                        },
                        {
                            param: 'deleteRecord',
                            render: (id, onClose) => {
                                const recordToDelete = records.find(r => r.id === parseInt(id));
                                if (!recordToDelete) return null;
                                return <DeleteRecordConfirmation record={recordToDelete} onClose={onClose} />
                            },
                        },
                        {
                            param: 'deleteActivity',
                            render: (id, onClose) => {
                                const activityToDelete = cycle.activities.find(a => a.id === parseInt(id));
                                if (!activityToDelete) return null;
                                return <DeleteActivityConfirmation activity={activityToDelete} onClose={onClose} />
                            },
                        },
                    ]}
                />
            </Suspense>
        </div>
    );
}

function FinancialRecordListView({ records }: { records: RecordWithDetails[] }) {
    if (records.length === 0) return <EmptyState message="没有找到相关的财务记录。" />;
    return (
        <div className="space-y-3">
            {/* isEditAble 保持 false */}
            {records.map(record => <RecordItem key={record.id} record={record} isEditAble={true} />)}
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
