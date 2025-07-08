// app/api/plots/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const plotId = parseInt(id, 10);
        if (isNaN(plotId)) {
            return NextResponse.json({ message: '无效的地块ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, area, crop } = body;

        // 验证必填字段
        if (!name || !area) {
            return NextResponse.json({ message: '地块名称和面积是必填项' }, { status: 400 });
        }

        // 使用事务确保数据一致性
        const updatedPlot = await prisma.$transaction(async (tx) => {
            // 1. 获取当前地块数据，用于判断作物是否变化
            const currentPlot = await tx.plot.findUnique({
                where: { id: plotId },
            });

            if (!currentPlot) {
                // 虽然在前端不太可能发生，但最好有这个检查
                throw new Error('地块不存在');
            }

            // 2. 更新地块信息
            const plotUpdate = await tx.plot.update({
                where: { id: plotId },
                data: {
                    name: name,
                    area: parseFloat(area),
                    crop: crop || null,
                },
            });

            // 3. 判断作物是否发生变化，并且新的作物值存在
            const cropHasChanged = currentPlot.crop !== crop && crop;

            if (cropHasChanged) {
                // 4. 查找当前地块上进行中的周期
                // 一个周期被认为是“进行中”的，如果它有一个START标记，但没有对应的END标记
                const lastStartActivity = await tx.activity.findFirst({
                    where: {
                        plotId: plotId,
                        type: { cycleMarker: 'START' },
                    },
                    orderBy: { date: 'desc' },
                });

                if (lastStartActivity) {
                    // 检查这个开始标记之后是否有结束标记
                    const subsequentEndActivity = await tx.activity.findFirst({
                        where: {
                            plotId: plotId,
                            type: { cycleMarker: 'END' },
                            date: { gte: lastStartActivity.date },
                        },
                    });

                    // 如果没有结束标记，说明周期仍在进行中
                    if (!subsequentEndActivity) {
                        // 5. 更新这个进行中周期内所有活动的 crop 字段
                        await tx.activity.updateMany({
                            where: {
                                plotId: plotId,
                                date: { gte: lastStartActivity.date },
                            },
                            data: {
                                crop: crop,
                            },
                        });
                    }
                }
            }

            return plotUpdate;
        });

        return NextResponse.json(updatedPlot, { status: 200 });

    } catch (error) {
        console.error('更新地块失败:', error);
        // 检查是否是 Prisma 的唯一约束冲突错误
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
            return NextResponse.json({ message: '地块名称已存在，请使用其他名称。' }, { status: 409 });
        }
        // 处理事务中抛出的自定义错误
        if (error instanceof Error && error.message === '地块不存在') {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }

        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        return NextResponse.json({ message: '更新地块失败', error: errorMessage }, { status: 500 });
    }
}
