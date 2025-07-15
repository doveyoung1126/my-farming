// app/api/records/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const recordId = parseInt(id, 10);
        if (isNaN(recordId)) {
            return NextResponse.json({ message: '无效的记录ID' }, { status: 400 });
        }

        const body = await request.json();
        const { amount, recordTypeId, date, description } = body;

        // 基本验证
        if (!amount || !recordTypeId || !date) {
            return NextResponse.json({ message: '金额、类型和日期是必填项' }, { status: 400 });
        }

        const updatedRecord = await prisma.record.update({
            where: { id: recordId },
            data: {
                amount: parseFloat(amount),
                recordTypeId: parseInt(recordTypeId, 10),
                date: new Date(date),
                description: description || null,
            },
        });

        return NextResponse.json(updatedRecord, { status: 200 });

    } catch (error) {
        console.error('更新记录失败:', error);
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        return NextResponse.json({ message: '更新记录失败', error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const recordId = parseInt(params.id, 10);
        if (isNaN(recordId)) {
            return NextResponse.json({ message: '无效的记录ID' }, { status: 400 });
        }

        // 检查记录是否存在
        const record = await prisma.record.findUnique({
            where: { id: recordId },
        });

        if (!record) {
            return NextResponse.json({ message: '记录未找到' }, { status: 404 });
        }

        // 删除记录
        await prisma.record.delete({
            where: { id: recordId },
        });

        return NextResponse.json({ message: '记录已成功删除' }, { status: 200 });

    } catch (error) {
        console.error('删除记录失败:', error);
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        return NextResponse.json({ message: '删除记录失败', error: errorMessage }, { status: 500 });
    }
}
