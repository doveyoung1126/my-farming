// app/api/activities/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activityTypeId, date, plotId, crop, budget, records } = body;

    // 1. 基础验证
    if (!activityTypeId || !date || !plotId) {
      return NextResponse.json({ message: '缺少必要的活动信息' }, { status: 400 });
    }

    const activityType = await prisma.activityType.findUnique({ where: { id: parseInt(activityTypeId) } });
    if (!activityType) {
      return NextResponse.json({ message: '无效的活动类型' }, { status: 400 });
    }

    // 2. 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      const plot = await tx.plot.findUnique({ where: { id: parseInt(plotId) } });
      if (!plot) {
        throw new Error('地块不存在');
      }

      const ongoingCycle = await tx.cycle.findFirst({
        where: { plotId: parseInt(plotId), status: 'ongoing' },
      });

      // 3. 根据 CycleMarker 执行不同逻辑
      if (activityType.cycleMarker === 'START') {
        // --- 创建一个新的周期 ---
        if (ongoingCycle) {
          throw new Error('此地块上已有正在进行的生产周期，无法创建新的开始活动。');
        }

        const newCycle = await tx.cycle.create({
          data: {
            plotId: parseInt(plotId),
            crop: crop || null,
            budget: budget ? parseFloat(budget) : null,
            startDate: new Date(date),
            status: 'ongoing',
          },
        });

        const newActivity = await tx.activity.create({
          data: {
            activityTypeId: parseInt(activityTypeId),
            date: new Date(date),
            plotId: parseInt(plotId),
            crop: crop || null, // 活动快照
            cycleId: newCycle.id,
            records: { create: records || [] },
          },
        });

        // 回填 startActivityId 并更新地块作物
        await tx.cycle.update({ where: { id: newCycle.id }, data: { startActivityId: newActivity.id } });
        await tx.plot.update({ where: { id: parseInt(plotId) }, data: { crop: crop || null } });

        return newActivity;

      } else if (activityType.cycleMarker === 'END') {
        // --- 完结一个现有周期 ---
        if (!ongoingCycle) {
          throw new Error('此地块上没有正在进行的生产周期，无法创建结束活动。');
        }
        if (new Date(date) < ongoingCycle.startDate) {
          throw new Error('结束日期不能早于周期的开始日期。');
        }

        const newActivity = await tx.activity.create({
          data: {
            activityTypeId: parseInt(activityTypeId),
            date: new Date(date),
            plotId: parseInt(plotId),
            crop: ongoingCycle.crop, // 快照使用周期定义的作物
            cycleId: ongoingCycle.id,
            records: { create: records || [] },
          },
        });

        // 更新周期状态和地块作物
        await tx.cycle.update({
          where: { id: ongoingCycle.id },
          data: {
            status: 'completed',
            endDate: new Date(date),
            endActivityId: newActivity.id,
          },
        });
        await tx.plot.update({ where: { id: parseInt(plotId) }, data: { crop: null } });

        return newActivity;

      } else {
        // --- 创建一个普通活动 ---
        if (!ongoingCycle) {
          throw new Error('此地块上没有正在进行的生产周期，无法添加普通活动。');
        }

        const newActivity = await tx.activity.create({
          data: {
            activityTypeId: parseInt(activityTypeId),
            date: new Date(date),
            plotId: parseInt(plotId),
            crop: ongoingCycle.crop, // 快照使用周期定义的作物
            cycleId: ongoingCycle.id,
            records: { create: records || [] },
          },
        });

        return newActivity;
      }
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('创建农事活动失败:', error);
    const errorMessage = error instanceof Error ? error.message : '发生未知错误';
    return NextResponse.json({ message: '创建农事活动失败', error: errorMessage }, { status: 500 });
  }
}