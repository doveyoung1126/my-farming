import {
    ActivityWithFinancials,
    PrismaActivityWithFinancials,
    ActivityCycle, PrismaRecords,
    PrismaRecordsWhere,
    FinancialWithActivity,
    PrismaPlots
} from './types'
import prisma from './db'

function transformActivity(activity: PrismaActivityWithFinancials): ActivityWithFinancials {
    return {
        id: activity.id,
        budget: activity.budget,
        type: activity.type.name,
        cycleMarker: activity.type.cycleMarker,
        crop: activity.crop,
        date: activity.date,
        plotId: activity.plot.id,
        plotName: activity.plot.name,
        plotArea: activity.plot.area,
        records: activity.records.map(record => ({
            id: record.id,
            amount: record.amount,
            description: record.description,
            recordType: record.type.category,
            recordCategory: record.type.category,
            date: record.date
        }))
    }
}

export const getAllActiviesDetails = async () => {
    try {
        const activities: PrismaActivityWithFinancials[] = await prisma.activity.findMany({
            include: {
                type: true,
                plot: true,
                records: {
                    include: {
                        type: true
                    }
                }

            },
            orderBy: {
                date: 'desc'
            }
        })

        return activities.map(transformActivity)
    }
    catch (error) {
        console.error('获取活动数据失败:', error)
        throw new Error('无法获取活动数据')
    } finally {
        await prisma.$disconnect()
    }
}

export const getPlots = async () => {
    try {
        const plots = await prisma.plot.findMany()

        return plots
    } catch (error) {
        console.error('获取农田数据失败:', error)
        throw new Error('无法获取农田数据')
    } finally {
        await prisma.$disconnect()
    }
}

export const getPlotCycles = (activities: ActivityWithFinancials[], plotId: number, plots: PrismaPlots[]) => {
    const sortedActivities = [...activities].reverse()
    const generateCycleId = (plotId: number, startDate: Date) => {
        return `cycle-${plotId}-${startDate.getTime()}`
    }
    const selectPlot = plots.filter(p => p.id === plotId)[0]

    const calculateCycles = () => {
        let currentCycle: ActivityCycle | null = null
        const cycles: ActivityCycle[] = []

        for (const activity of sortedActivities) {
            if (activity.cycleMarker === 'START') {
                if (currentCycle) cycles.push(currentCycle);
                currentCycle = {
                    id: generateCycleId(plotId, activity.date),
                    plotId: plotId,
                    plot: selectPlot,
                    start: activity.date,
                    budget: activity.budget,
                    end: null,
                    activities: [activity]
                };
            }
            else if (activity.cycleMarker === 'END' && currentCycle) {
                currentCycle.end = activity.date;
                currentCycle.activities.push(activity);
                cycles.push(currentCycle);
                currentCycle = null;
            }
            else if (currentCycle) {
                currentCycle.activities.push(activity);
            }
        }
        if (currentCycle) cycles.push(currentCycle);
        return cycles;
    }
    return calculateCycles()
}

export const getActivitiesRecordsSummary = (activities: ActivityWithFinancials[]) => {
    // const expenseRecords = activities.filter(activity => activity.)
    const activitiesRecordSummary = activities.map(activity => {
        return getActivityRecordsSummary(activity)
    })
    const totalExpense = activitiesRecordSummary.reduce((sum, summary) => {
        return sum + summary.expense
    }, 0)
    const totalIncom = activitiesRecordSummary.reduce((sum, summary) => {
        return sum + summary.income
    }, 0)

    return {
        cycleExpense: totalExpense,
        cycleIncome: totalIncom,
        cycleProfit: totalExpense + totalIncom,
        cycleRoi: (totalExpense + totalIncom) / Math.abs(totalExpense) * 100
    }
}

const getActivityRecordsSummary = (activity: ActivityWithFinancials) => {
    const { records } = activity
    const totalExpense = records.reduce((sum, record) => {
        return record.amount > 0 ? sum : sum + record.amount
    }, 0)
    const totalIncom = records.reduce((sum, record) => {
        return record.amount > 0 ? sum + record.amount : sum
    }, 0)

    return {
        activityId: activity.id,
        expense: totalExpense,
        income: totalIncom,
        profit: totalIncom + totalExpense
    }
}

export const getRecordsWithActivity = async (date1?: Date, date2?: Date): Promise<FinancialWithActivity[]> => {
    try {
        const where: PrismaRecordsWhere = {}

        if (date1 && date2) {
            const [start, end] = [date1, date2].sort((a, b) => a.getTime() - b.getTime())

            where.date = {
                gte: start,
                lte: new Date(end.setHours(23, 59, 59, 999))
            }
        } else if (date1) {
            const start = new Date(date1)
            start.setHours(0, 0, 0, 0)

            const end = new Date(date1)
            end.setHours(23, 59, 59, 999)

            where.date = {
                gte: start,
                lte: end
            }
        }
        const records: PrismaRecords[] = await prisma.record.findMany({
            where,
            include: {
                type: true,
                activity: {
                    include: {
                        type: true,
                        plot: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })

        return records.map(transformRecord)

        function transformRecord(record: PrismaRecords): FinancialWithActivity {
            return {
                id: record.id,
                amount: record.amount,
                date: record.date,
                description: record.description,
                recordType: record.type.name,
                recordCategory: record.type.category,
                activityId: record.activity?.id,
                activityDate: record.activity?.date,
                activityType: record.activity?.type.name,
                plotName: record.activity?.plot.name,
                crop: record.activity?.plot.crop
            }
        }
    }
    catch (error) {
        console.log('获取财务数据失败：', error)
        throw new Error('无法获取财务数据')
    }
    finally {
        await prisma.$disconnect();
    }
};

export const getActivityTypes = async () => {
    try {
        const activityTypes = await prisma.activityType.findMany();
        return activityTypes;
    } catch (error) {
        console.error('获取活动类型失败:', error);
        throw new Error('无法获取活动类型');
    } finally {
        await prisma.$disconnect();
    }
};

export const getRecordCategoryTypes = async () => {
    try {
        const recordCategoryTypes = await prisma.recordCategoryType.findMany();
        return recordCategoryTypes;
    } catch (error) {
        console.error('获取财务记录类型失败:', error);
        throw new Error('无法获取财务记录类型');
    } finally {
        await prisma.$disconnect();
    }
};

export const getPlotDetails = async (plotId: number) => {
    try {
        const plot = await prisma.plot.findUnique({
            where: { id: plotId },
        });

        if (!plot) {
            return null;
        }

        const activitiesOnPlot: PrismaActivityWithFinancials[] = await prisma.activity.findMany({
            where: { plotId: plotId },
            include: {
                type: true,
                plot: true,
                records: {
                    include: {
                        type: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        const transformedActivities = activitiesOnPlot.map(transformActivity);

        // 获取所有地块，因为 getPlotCycles 需要
        const allPlots = await prisma.plot.findMany();

        const cyclesOnPlot = getPlotCycles(transformedActivities, plotId, allPlots);

        // 计算该地块所有活动的汇总财务数据
        const plotSummary = getActivitiesRecordsSummary(transformedActivities);

        return {
            plot,
            activities: transformedActivities,
            cycles: cyclesOnPlot,
            summary: plotSummary,
        };

    } catch (error) {
        console.error('获取地块详情失败:', error);
        throw new Error('无法获取地块详情');
    } finally {
        await prisma.$disconnect();
    }
};

export const getCycleDetailsById = async (cycleId: number): Promise<ActivityCycle | null> => {
    try {
        // 1. 找到周期的起始活动
        const startActivity = await prisma.activity.findUnique({
            where: { id: cycleId },
            include: {
                type: true,
                plot: true,
            }
        });

        if (!startActivity || startActivity.type.cycleMarker !== 'START') {
            console.error('未找到对应的周期起始活动');
            return null;
        }

        // 2. 找到下一个周期的起始活动，以确定当前周期的结束时间
        const nextCycleStart = await prisma.activity.findFirst({
            where: {
                plotId: startActivity.plotId,
                type: { cycleMarker: 'START' },
                date: { gt: startActivity.date },
            },
            orderBy: {
                date: 'asc'
            }
        });

        const endDate = nextCycleStart ? new Date(nextCycleStart.date) : null;

        // 3. 查询此周期内的所有活动
        const activitiesInCycle = await prisma.activity.findMany({
            where: {
                plotId: startActivity.plotId,
                date: {
                    gte: startActivity.date,
                    ...(endDate && { lt: endDate })
                }
            },
            include: {
                type: true,
                plot: true,
                records: {
                    include: {
                        type: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // 4. 构建并返回周期对象
        const cycle: ActivityCycle = {
            id: `cycle-${startActivity.plotId}-${startActivity.date.getTime()}`,
            plotId: startActivity.plotId,
            plot: startActivity.plot,
            start: startActivity.date,
            end: endDate,
            budget: startActivity.budget,
            activities: activitiesInCycle.map(transformActivity),
        };

        return cycle;

    } catch (error) {
        console.error('获取周期详情失败:', error);
        throw new Error('无法获取周期详情');
    } finally {
        await prisma.$disconnect();
    }
};