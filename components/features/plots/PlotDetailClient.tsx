// components/plots/PlotDetailClient.tsx
'use client';

import { ActivityCycle, PrismaPlots } from "@/lib/types";
import { OngoingCycleCard } from "@/components/features/dashboard/OngoingCycleCard";
import { CompletedCycleCard } from "@/components/features/dashboard/CompletedCycleCard";
import { Suspense, useState } from "react";
import { EditPlotForm } from "@/components/features/plots/forms/EditPlotForm";
import { useRouter } from "next/navigation";
import { PlotDetailHeader } from "./PlotDetailHeader";
import { getActivitiesRecordsSummary } from "@/lib/data";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { FormModal } from "@/components/ui/FormModal";
import { UrlActionHandler } from "@/components/ui/UrlActionHandler";

export function PlotDetailClient({ plot, cycles }: { plot: PrismaPlots, cycles: ActivityCycle[] }) {
    // --- State for Modals ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '', confirmText: '' });

    // --- Shared State for Async Operations ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const ongoingCycles = cycles.filter(cycle => cycle.status === 'ongoing');
    const completedCycles = cycles.filter(cycle => cycle.status === 'completed' || cycle.status === 'aborted').sort((a, b) => b.end!.getTime() - a.end!.getTime());

    const summary = getActivitiesRecordsSummary(cycles.flatMap(c => c.activities));

    // --- Archive Handlers ---
    const handleOpenArchiveConfirm = () => {
        setError(null);
        const actionText = plot.isArchived ? '恢复' : '归档';
        setModalContent({
            title: `确认${actionText}`,
            body: `您确定要${actionText}地块 "${plot.name}" 吗？${!plot.isArchived ? '归档后，您将无法在此地块上开展新的生产周期，但历史数据会保留。' : ''}`,
            confirmText: actionText,
        });
        setIsArchiveConfirmOpen(true);
    };

    const handleConfirmArchive = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/plots/${plot.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isArchived: !plot.isArchived }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `无法${plot.isArchived ? '恢复' : '归档'}地块`);
            }

            setIsArchiveConfirmOpen(false);
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PlotDetailHeader
                plot={plot}
                onArchive={handleOpenArchiveConfirm}
            />

            <main className="flex-1 overflow-y-auto">
                {/* ... main content ... */}
                <div className="p-4">
                    <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-lg overflow-hidden shadow">
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总收入</p><p className="text-base font-bold text-green-600">¥{summary.cycleIncome.toLocaleString()}</p></div>
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总支出</p><p className="text-base font-bold text-red-600">¥{Math.abs(summary.cycleExpense).toLocaleString()}</p></div>
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">净利润</p><p className={`text-base font-bold ${(summary.cycleProfit) >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>¥{summary.cycleProfit.toLocaleString()}</p></div>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {!plot.isArchived && (
                        <section>
                            <h2 className="text-lg font-semibold text-slate-700 mb-3">地里正在长的周期</h2>
                            {ongoingCycles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {ongoingCycles.map(cycle => (
                                        <OngoingCycleCard key={cycle.id} cycle={cycle} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-4">该地块当前没有正在进行的生产周期。</p>
                            )}
                        </section>
                    )}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-700 mb-3">已经收获的周期</h2>
                        {completedCycles.length > 0 ? (
                            <div className="space-y-4">
                                {completedCycles.map(cycle => (
                                    <CompletedCycleCard key={cycle.id} cycle={cycle} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">该地块还没有已完成的生产周期。</p>
                        )}
                    </section>
                </div>
            </main>

            {/* 使用 URL 驱动编辑和归档 */}
            <Suspense>
                <UrlActionHandler
                    actions={[
                        {
                            param: "editPlot",
                            render: (id, onClose) => {
                                const editPlot = id === plot.id.toString() ? plot : null

                                if (!editPlot) return null
                                return (
                                    <FormModal
                                        isOpen={true}
                                        onClose={onClose}
                                        title="编辑地块"
                                    >
                                        <EditPlotForm
                                            plot={editPlot}
                                            onClose={onClose}
                                        />
                                    </FormModal>
                                )
                            }
                        }
                    ]}
                />
            </Suspense>

            {/* Edit Plot Modal using the new generic FormModal */}
            {/*  <FormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="编辑地块"
            >
                <EditPlotForm
                    plot={plot}
                    onSubmit={handleConfirmEdit}
                    onCancel={() => setIsEditModalOpen(false)}
                    isLoading={isLoading}
                    error={error}
                />
            </FormModal> */}

            {/* Archive/Restore Confirmation Modal */}
            <ConfirmationModal
                isOpen={isArchiveConfirmOpen}
                onClose={() => setIsArchiveConfirmOpen(false)}
                onConfirm={handleConfirmArchive}
                title={modalContent.title}
                confirmText={modalContent.confirmText}
                isLoading={isLoading}
                error={error}
            >
                <p>{modalContent.body}</p>
            </ConfirmationModal>
        </>
    );
}
