import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const activityId = parseInt(id, 10);

        if (isNaN(activityId)) {
            return NextResponse.json({ message: '无效的活动ID' }, { status: 400 });
        }

        const body = await request.json();
        const {
            activityTypeId,
            date,
            plotId,
            crop,
            budget,
            records // This will contain the updated list of records
        } = body;

        // Basic validation
        if (!activityTypeId || !date || !plotId) {
            return NextResponse.json({ message: '缺少必要的活动信息' }, { status: 400 });
        }

        // Start transaction
        const updatedActivity = await prisma.$transaction(async (prisma) => {
            // 1. Update the main activity
            const activity = await prisma.activity.update({
                where: { id: activityId },
                data: {
                    activityTypeId: activityTypeId,
                    date: new Date(date),
                    plotId: plotId,
                    crop: crop || null,
                    budget: budget ? parseFloat(budget) : null,
                },
                include: {
                    records: true // Include records to compare later
                }
            });

            // 2. Manage associated financial records
            const existingRecordIds = activity.records.map(rec => rec.id);
            const incomingRecordIds = records.map((rec: any) => rec.id).filter(Boolean); // Filter out temporary client-side IDs

            // Records to delete (exist in DB but not in incoming payload)
            const recordsToDelete = existingRecordIds.filter(
                (existingId) => !incomingRecordIds.includes(existingId)
            );

            // Records to create/update
            const recordOperations = records.map((record: any) => {
                if (record.id && existingRecordIds.includes(record.id)) {
                    // Update existing record
                    return prisma.record.update({
                        where: { id: record.id },
                        data: {
                            amount: parseFloat(record.amount),
                            recordTypeId: parseInt(record.recordTypeId),
                            date: new Date(record.date),
                            description: record.description || null,
                        },
                    });
                } else {
                    // Create new record
                    return prisma.record.create({
                        data: {
                            amount: parseFloat(record.amount),
                            recordTypeId: parseInt(record.recordTypeId),
                            date: new Date(record.date),
                            description: record.description || null,
                            activityId: activity.id, // Link to the updated activity
                        },
                    });
                }
            });

            // Execute delete operations
            if (recordsToDelete.length > 0) {
                await prisma.record.deleteMany({
                    where: {
                        id: {
                            in: recordsToDelete,
                        },
                    },
                });
            }

            // Execute create/update operations
            await Promise.all(recordOperations);

            return activity; // Return the updated activity
        });

        return NextResponse.json(updatedActivity, { status: 200 });

    } catch (error) {
        console.error('更新农事活动失败:', error);
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        return NextResponse.json({ message: '更新农事活动失败', error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const activityId = parseInt(params.id, 10);
        if (isNaN(activityId)) {
            return NextResponse.json({ message: '无效的农事活动ID' }, { status: 400 });
        }

        // 使用事务确保数据一致性
        const result = await prisma.$transaction(async (prisma) => {
            // 1. 删除所有关联的财务记录
            await prisma.record.deleteMany({
                where: { activityId: activityId },
            });

            // 2. 删除农事活动本身
            const deletedActivity = await prisma.activity.delete({
                where: { id: activityId },
            });

            return deletedActivity;
        });

        return NextResponse.json({ message: `农事活动已成功删除` }, { status: 200 });

    } catch (error: any) {
        console.error('[API_ACTIVITIES_DELETE]', error);

        // 处理 Prisma 特定的错误，例如记录未找到
        if (error.code === 'P2025') {
            return NextResponse.json({ message: '要删除的农事活动不存在' }, { status: 404 });
        }

        return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
    }
}
