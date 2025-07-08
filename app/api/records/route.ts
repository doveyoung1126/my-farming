// app/api/records/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            amount,
            recordTypeId,
            date,
            description
        } = body;

        // 验证必填字段
        if (!amount || !recordTypeId || !date) {
            return NextResponse.json({ message: '缺少必要的财务信息' }, { status: 400 });
        }

        const newRecord = await prisma.record.create({
            data: {
                amount: parseFloat(amount),
                recordTypeId: parseInt(recordTypeId),
                date: new Date(date),
                description: description || null,
            },
        });

        return NextResponse.json(newRecord, { status: 201 });

    } catch (error) {
        console.error('创建财务记录失败:', error);
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        return NextResponse.json({ message: '创建财务记录失败', error: errorMessage }, { status: 500 });
    }
}