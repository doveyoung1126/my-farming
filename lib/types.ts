// lib/types.ts
import { Prisma } from '@prisma/client'

// 活动基本类型
export interface ActivityBasic {
    id: number;
    type: string;        // 活动类型名称
    crop: string | null;
    date: Date;
    plotName: string;    // 地块名称
    plotArea: number;    // 地块面积
    plotId: number
}

// 财务记录类型
export interface FinancialRecord {
    id: number;
    amount: number;
    description: string | null;
    recordType: string;  // 财务类型名称
    date: Date;
}

// 活动详情类型（包含财务记录）
export interface ActivityWithFinancials extends ActivityBasic {
    records: FinancialRecord[];
}

// 财务记录详情（包含农事活动）
export interface FinancialWithActivity extends FinancialRecord {
    activityId: number,
    activityType: string,
    activityDate: Date,
    plotName: string,
    crop: string | null
}

// 使用 Prisma 工具定义查询返回类型
const activityWithFinancials = {
    include: {
        type: true,     // 包含活动类型
        plot: true,     // 包含地块
        records: {      // 包含财务记录
            include: {
                type: true  // 在财务记录中包含财务类型
            }
        }
    }
} as const

// 基于查询结构生成精确类型
export type PrismaActivityWithFinancials = Prisma.ActivityGetPayload<typeof activityWithFinancials>
export type PrismaPlots = Prisma.PlotGetPayload<{}>
export type PrismaRecords = Prisma.RecordGetPayload<{}>