// app/api/activities/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            activityTypeId,
            date,
            plotId,
            crop,
            budget,
            records
        } = body;

        // 验证必填字段
        if (!activityTypeId || !date || !plotId) {
            return NextResponse.json({ message: '缺少必要的活动信息' }, { status: 400 });
        }

        const newActivity = await prisma.activity.create({
            data: {
                activityTypeId: parseInt(activityTypeId),
                date: new Date(date),
                plotId: parseInt(plotId),
                crop: crop || null,
                budget: budget ? parseFloat(budget) : null,
                records: {
                    create: records.map((record: any) => ({
                        amount: parseFloat(record.amount),
                        recordTypeId: parseInt(record.recordTypeId),
                        date: new Date(record.date || date), // 如果记录没有独立日期，则使用活动日期
                        description: record.description || null,
                    })),
                },
            },
        });

        return NextResponse.json(newActivity, { status: 201 });

    } catch (error) {
        console.error('创建农事活动失败:', error);
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        return NextResponse.json({ message: '创建农事活动失败', error: errorMessage }, { status: 500 });
    }
}
