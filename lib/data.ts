// lib/data.ts
'use server'

import prisma from './db';
import { getCycleFinancialSummary } from './utils'
import {
  CycleWithDetails,
  RecordWithDetails,
  CycleFinancialSummary,
  PrismaRecordsWhere,
  Plot,
  ActivityType,
  RecordCategoryType,
  ActivityCycle,
  cycleWithDetailsValidator,
  ActivityInCycle, // 导入 cycleWithDetailsValidator
} from './types';

// -----------------------------------------------------------------------------
// 主要数据获取函数 (Getters)
// -----------------------------------------------------------------------------

const cycleInclude = cycleWithDetailsValidator.include;

/**
 * 获取所有地块
 * @param includeArchived - 是否包含已归档的地块
 */
export const getPlots = async (includeArchived = false): Promise<Plot[]> => {
  try {
    return await prisma.plot.findMany({
      where: includeArchived ? {} : { isArchived: false },
    });
  } catch (error) {
    console.error('获取地块数据失败:', error);
    throw new Error('无法获取地块数据');
  }
};

/**
 * 获取所有周期，并可选择附加财务摘要
 * @param includeSummary - 是否为每个周期计算财务摘要
 */
export const getAllCycles = async (includeSummary = false): Promise<ActivityCycle[]> => {
  try {
    const cycles = await prisma.cycle.findMany({
      include: cycleInclude,
      orderBy: { startDate: 'desc' },
    });

    if (includeSummary) {
      return cycles.map(cycle => ({
        ...cycle,
        summary: getCycleFinancialSummary(cycle),
      }));
    }

    return cycles;
  } catch (error) {
    console.error('获取所有周期数据失败:', error);
    throw new Error('无法获取周期数据');
  }
};

/**
 * 根据 ID 获取单个周期的详细信息
 * @param cycleId - 周期的 ID
 */
export const getCycleDetailsById = async (cycleId: number): Promise<ActivityCycle | null> => {
  try {
    const cycle = await prisma.cycle.findUnique({
      where: { id: cycleId },
      include: cycleInclude,
    });

    if (cycle) {
      return {
        ...cycle,
        summary: getCycleFinancialSummary(cycle),
      }
    }

    return null;

  } catch (error) {
    console.error(`获取周期详情失败 (ID: ${cycleId}):`, error);
    throw new Error('无法获取周期详情');
  }
};

/**
 * 获取单个地块的详细信息，包括其所有周期
 * @param plotId - 地块的 ID
 */
export const getPlotDetails = async (plotId: number) => {
  try {
    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
    });

    if (!plot) return null;

    const cyclesOnPlot = await prisma.cycle.findMany({
      where: { plotId: plotId },
      include: cycleInclude,
      orderBy: { startDate: 'desc' },
    });

    const cyclesWithSummary = cyclesOnPlot.map(cycle => ({
      ...cycle,
      summary: getCycleFinancialSummary(cycle),
    }));

    return {
      plot,
      cycles: cyclesWithSummary,
    };

  } catch (error) {
    console.error(`获取地块详情失败 (ID: ${plotId}):`, error);
    throw new Error('无法获取地块详情');
  }
};


/**
 * 获取所有财务记录，并可按日期范围过滤
 * @param dateRange - 可选的日期范围 { from: Date, to: Date }
 */
export const getRecordsWithDetails = async (dateRange?: { from: Date, to: Date }): Promise<RecordWithDetails[]> => {
  try {
    const where: PrismaRecordsWhere = {};
    if (dateRange) {
      where.date = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    return await prisma.record.findMany({
      where,
      include: {
        type: true,
        activity: {
          include: {
            type: true,
            plot: true,
            cycle: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  } catch (error) {
    console.error('获取财务数据失败:', error);
    throw new Error('无法获取财务数据');
  }
};

export const getAllActivities = async () => {
  try {
    return await prisma.activity.findMany({
      include: {
        type: true,
        plot: true,
        records: { include: { type: true } },
      },
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('获取所有活动数据失败:', error);
    throw new Error('无法获取活动数据');
  }
};


// -----------------------------------------------------------------------------
// 基础数据获取函数 (用于表单等)
// -----------------------------------------------------------------------------

export const getActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    return await prisma.activityType.findMany();
  } catch (error) {
    console.error('获取活动类型失败:', error);
    throw new Error('无法获取活动类型');
  }
};

export const getRecordCategoryTypes = async (): Promise<RecordCategoryType[]> => {
  try {
    return await prisma.recordCategoryType.findMany();
  } catch (error) {
    console.error('获取财务记录类型失败:', error);
    throw new Error('无法获取财务记录类型');
  }
};

export const getActivityById = async (id: number) => {
  try {
    return await prisma.activity.findUnique({
      where: { id },
      include: {
        type: true,
        plot: true,
        cycle: true,
        records: { include: { type: true } },
      },
    });
  } catch (error) {
    console.error(`获取活动详情失败 (ID: ${id}):`, error);
    throw new Error('无法获取活动详情');
  }
};