// app/api/plots/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            area,
            crop
        } = body;

        // 验证必填字段
        if (!name || !area) {
            return NextResponse.json({ message: '地块名称和面积是必填项' }, { status: 400 });
        }

        const newPlot = await prisma.plot.create({
            data: {
                name: name,
                area: parseFloat(area),
                crop: crop || null,
            },
        });

        return NextResponse.json(newPlot, { status: 201 });

    } catch (error) {
        console.error('创建地块失败:', error);
        // 检查是否是 Prisma 的唯一约束冲突错误
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
            return NextResponse.json({ message: '地块名称已存在，请使用其他名称。' }, { status: 409 });
        }
        
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        return NextResponse.json({ message: '创建地块失败', error: errorMessage }, { status: 500 });
    }
}