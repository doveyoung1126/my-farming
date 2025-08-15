
import prisma from '@/lib/db';
import { Activity } from '@prisma/client';

interface ActivityData {
  activityTypeId: number;
  date: Date;
  plotId: number;
  crop?: string | null;
  budget?: number | null;
  records?: {
    amount: number;
    recordTypeId: number;
    description?: string | null;
  }[];
}

interface CreateActivityOptions {
  activityData: ActivityData;
  startNewCycle?: boolean;
  endCurrentCycle?: boolean;
}

/**
 * 创建一个新的农事活动，并根据指令处理关联的生产周期逻辑。
 * 这是所有农事活动创建的核心业务逻辑，被 Server Actions 或 API Routes 调用。
 * 该函数通过数据库事务确保操作的原子性。
 *
 * @param {CreateActivityOptions} options - 创建活动的选项.
 * @param {ActivityData} options.activityData - 农事活动本身的数据.
 * @param {boolean} [options.startNewCycle=false] - 是否用此活动开启一个新周期.
 * @param {boolean} [options.endCurrentCycle=false] - 是否用此活动结束当前周期.
 * @returns {Promise<Activity>} 返回创建成功的农事活动对象.
 * @throws {Error} 如果违反业务规则（如在已有周期的地块上开启新周期），则抛出错误.
 */
export async function createActivityInCycle({
  activityData,
  startNewCycle = false,
  endCurrentCycle = false,
}: CreateActivityOptions): Promise<Activity> {
  const { plotId, activityTypeId, date, crop, budget, records } = activityData;

  if (!activityTypeId || !date || !plotId) {
    throw new Error('缺少必要的活动信息：活动类型、日期和地块ID是必须的。');
  }

  return await prisma.$transaction(async (tx) => {
    const plot = await tx.plot.findUnique({ where: { id: plotId } });
    if (!plot) {
      throw new Error('操作失败：找不到指定的地块。');
    }

    const ongoingCycle = await tx.cycle.findFirst({
      where: { plotId: plotId, status: 'ongoing' },
    });
    console.log('step1', ongoingCycle)

    if (startNewCycle) {
      if (ongoingCycle) {
        throw new Error('此地块上已有正在进行的生产周期，无法开启新周期。');
      }

      const newCycle = await tx.cycle.create({
        data: {
          plotId: plotId,
          crop: crop || null,
          budget: budget || null,
          startDate: date,
          status: 'ongoing',
        },
      });

      const newActivity = await tx.activity.create({
        data: {
          activityTypeId: activityTypeId,
          date: date,
          plotId: plotId,
          crop: crop || null,
          cycleId: newCycle.id,
          records: { create: records || [] },
        },
      });

      await tx.cycle.update({
        where: { id: newCycle.id },
        data: { startActivityId: newActivity.id },
      });
      await tx.plot.update({ where: { id: plotId }, data: { crop: crop || null } });

      return newActivity;

    } else if (endCurrentCycle) {
      if (!ongoingCycle) {
        throw new Error('此地块上没有正在进行的生产周期，无法结束周期。');
      }
      if (date < ongoingCycle.startDate) {
        throw new Error('结束日期不能早于周期的开始日期。');
      }

      const newActivity = await tx.activity.create({
        data: {
          activityTypeId: activityTypeId,
          date: date,
          plotId: plotId,
          crop: ongoingCycle.crop,
          cycleId: ongoingCycle.id,
          records: { create: records || [] },
        },
      });

      await tx.cycle.update({
        where: { id: ongoingCycle.id },
        data: {
          status: 'completed',
          endDate: date,
          endActivityId: newActivity.id,
        },
      });
      await tx.plot.update({ where: { id: plotId }, data: { crop: null } });

      return newActivity;

    } else {
      if (!ongoingCycle) {
        console.log(ongoingCycle)
        throw new Error('此地块上没有正在进行的生产周期，无法添加普通活动。');
      }

      return await tx.activity.create({
        data: {
          activityTypeId: activityTypeId,
          date: date,
          plotId: plotId,
          crop: ongoingCycle.crop,
          cycleId: ongoingCycle.id,
          records: { create: records || [] },
        },
      });
    }
  });
}
