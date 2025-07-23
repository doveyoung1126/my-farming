// app/api/activities/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const activityId = parseInt(id, 10);

        if (isNaN(activityId)) {
            return NextResponse.json({ message: '无效的农事活动 ID' }, { status: 400 });
        }

        const body = await request.json();
        const {
            activityTypeId,
            date,
            // plotId, // 不允许修改活动所属的地块
            crop,
            records,
            recordIdsToDelete,
        } = body;

        // 1. 基础验证
        if (!activityTypeId || !date) {
            return NextResponse.json({ message: '缺少必要的活动信息' }, { status: 400 });
        }

        // 2. 事务化处理
        const transaction = await prisma.$transaction(async (tx) => {
            // ��取原始活动及其周期信息
            const originalActivity = await tx.activity.findUnique({
                where: { id: activityId },
                include: { cycle: true, type: true },
            });

            if (!originalActivity) {
                throw new Error('未找到要更新的农事活动');
            }
            if (originalActivity.activityTypeId !== parseInt(activityTypeId)) {
                throw new Error('不允许修改农事活动的类型。如需更改，请删除后重建。');
            }

            // 3. 更新活动本身
            const updatedActivity = await tx.activity.update({
                where: { id: activityId },
                data: {
                    date: new Date(date),
                    crop: crop || null, // 允许更新快照
                },
            });

            // 4. 如果更新的是周期的关键活动，则同步更新周期
            if (originalActivity.cycle) {
                const cycle = originalActivity.cycle;
                // 如果是开始活动
                if (cycle.startActivityId === activityId) {
                    if (cycle.endDate && new Date(date) > cycle.endDate) {
                        throw new Error('周期的开始日期不能晚于结束日期。');
                    }
                    await tx.cycle.update({
                        where: { id: cycle.id },
                        data: { startDate: new Date(date), crop: crop || null },
                    });
                }
                // 如果是结束活动
                if (cycle.endActivityId === activityId) {
                    if (new Date(date) < cycle.startDate) {
                        throw new Error('周期的结束日期不能早于开始日期。');
                    }
                    await tx.cycle.update({
                        where: { id: cycle.id },
                        data: { endDate: new Date(date) },
                    });
                }
            }

            // 5. 处理财务记录 (创建、更新、删除)
            if (records && Array.isArray(records)) {
                const recordsToCreate = records.filter(r => !r.id);
                const recordsToUpdate = records.filter(r => r.id);

                if (recordIdsToDelete && recordIdsToDelete.length > 0) {
                    await tx.record.deleteMany({
                        where: { id: { in: recordIdsToDelete.map((id: string) => parseInt(id)) } },
                    });
                }

                if (recordsToCreate.length > 0) {
                    await tx.record.createMany({
                        data: recordsToCreate.map((r: any) => ({
                            ...r,
                            activityId: updatedActivity.id,
                        })),
                    });
                }

                for (const r of recordsToUpdate) {
                    await tx.record.update({
                        where: { id: parseInt(r.id) },
                        data: { ...r, id: undefined }, // id 不能被更新
                    });
                }
            }

            return updatedActivity;
        });

        return NextResponse.json(transaction);

    } catch (error) {
        console.error(`更新农事活动 ${id} 失败:`, error);
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        return NextResponse.json({ message: `更新失败: ${errorMessage}` }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const activityId = parseInt(id, 10);
        if (isNaN(activityId)) {
            return NextResponse.json({ message: '无效的农事活动 ID' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. 获取活动及其周期的详细信息
            const activityToDelete = await tx.activity.findUnique({
                where: { id: activityId },
                include: {
                    cycle: {
                        include: {
                            _count: {
                                select: { activities: true }
                            }
                        }
                    }
                }
            });

            if (!activityToDelete) {
                throw new Error('要删除的农事活动不存在。');
            }

            const cycle = activityToDelete.cycle;

            // 2. 应用我们讨论的业务逻辑
            if (cycle) {
                // 规则 1: 禁止删除已完结周期内的任何活动
                if (cycle.status === 'completed') {
                    throw new Error('无法删除已完结生产周期内的农事活动。');
                }

                // 规则 2: 处理“开始”活动
                if (cycle.startActivityId === activityId) {
                    if (cycle._count.activities > 1) {
                        throw new Error('无法删除开始活动，请先删除周期内的其他普通活动。');
                    }
                    // 如果是唯一活动，则删除活动和周期本身
                    await tx.record.deleteMany({ where: { activityId: activityId } });
                    await tx.activity.delete({ where: { id: activityId } });
                    await tx.cycle.delete({ where: { id: cycle.id } });
                    return { message: '农事活动及空的生产周期已成功删除。' };
                }
                // 规则 3: 禁止删除“结束”活动 (虽然周期未完结时理论上不应该有结束活动，但作为安全校验)
                if (cycle.endActivityId === activityId) {
                    throw new Error('无法删除一个生产周期的结束活动。');
                }
            }

            // 规则 4: 删除普通活动 (或不属于任何周期的活动)
            await tx.record.deleteMany({ where: { activityId: activityId } });
            const deletedActivity = await tx.activity.delete({ where: { id: activityId } });

            return { message: '农事活动已成功删除。', data: deletedActivity };
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error(`[API_ACTIVITIES_DELETE]`, error);
        // P2025 是 Prisma "not found" 错误
        if (error.code === 'P2025') {
            return NextResponse.json({ message: '要删除的农事活动不存在' }, { status: 404 });
        }
        const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
        return NextResponse.json({ message: `删除失败: ${errorMessage}` }, { status: 500 });
    }
}