// lib/types.ts
import { Prisma, Cycle, Plot, Activity, Record, ActivityType, RecordCategoryType } from '@prisma/client';

// -----------------------------------------------------------------------------
// 1. Prisma 类型扩展 (GetPayload)
//    定义我们数据查询的“形状”，并从中生成精确的类型。
// -----------------------------------------------------------------------------

// 定义一个包含所有关联的 Cycle 查询的“形状”
export const cycleWithDetailsValidator = Prisma.validator<Prisma.CycleDefaultArgs>()({
  include: {
    plot: true,
    activities: {
      orderBy: { date: 'asc' },
      include: {
        type: true,
        plot: true, // 确保每个活动都包含其地块信息
        records: {
          include: {
            type: true,
          },
        },
      },
    },
    startActivity: true,
    endActivity: true,
  },
});

// 定义一个包含所有关联的 Record 查询的“形状”
const recordWithDetailsValidator = Prisma.validator<Prisma.RecordDefaultArgs>()({
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
});

// -----------------------------------------------------------------------------
// 2. 导出的精确类型
//    这些是我们将在整个应用中使用的、从上述“形状”生成的类型。
// -----------------------------------------------------------------------------

// 这是我们最重要、最顶层的类型，代表一个完整的周期及其所有数据。
export type CycleWithDetails = Prisma.CycleGetPayload<typeof cycleWithDetailsValidator>;

// **关键修复**: 我们不单独定义 Activity 的类型，而是直接从 CycleWithDetails 中派生它。
// 这确保了类型永远与数据同步。
export type ActivityInCycle = CycleWithDetails['activities'][number];

// 从 prisma.activity findMany 调用中派生出的类型
const activityWithDetailsValidator = Prisma.validator<Prisma.ActivityDefaultArgs>()({
  include: {
    type: true,
    plot: true,
    records: {
      include: {
        type: true,
      },
    },
  },
});

export type ActivityWithDetails =
  Prisma.ActivityGetPayload<typeof activityWithDetailsValidator>;

// 财务记录的精确类型
export type RecordWithDetails = Prisma.RecordGetPayload<typeof recordWithDetailsValidator>;

// 导出基础模型类型（如果需要）
export type { Plot, Activity, Cycle, Record, ActivityType, RecordCategoryType };

// -----------------------------------------------------------------------------
// 3. 自定义/应用层类型
// -----------------------------------------------------------------------------

// 周期概览的财务摘要
export interface CycleFinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  roi: number; // 投资回报率
}

// 用于在组件中传递的最终周期类型，可以附加计算出的字段
export interface ActivityCycle extends CycleWithDetails {
  summary?: CycleFinancialSummary;
}

// Prisma Where 输入类型，用于过滤查询
export type PrismaRecordsWhere = Prisma.RecordWhereInput;