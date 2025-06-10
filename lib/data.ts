import { ActivityWithFinancials, PrismaActivityWithFinancials, ActivityCycle } from './types'
import prisma from './db'

export const getAllActiviesDetails = async () => {
    try {
        const activities = await prisma.activity.findMany({
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

    function transformActivity(activity: PrismaActivityWithFinancials): ActivityWithFinancials {
        return {
            id: activity.id,
            type: activity.type.name,
            cycleMarker: activity.type.cycleMarker,
            crop: activity.plot.crop,
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

export const getPlotCycles = (activities: ActivityWithFinancials[], plotId: number) => {
    const sortedActivities = [...activities].reverse()
    const generateCycleId = (plotId: number, startDate: Date) => {
        return `cycle-${plotId}-${startDate.getTime()}`
    }

    const calculateCycles = () => {
        let currentCycle: ActivityCycle | null = null
        const cycles: ActivityCycle[] = []

        for (const activity of sortedActivities) {
            if (activity.cycleMarker === 'START') {
                if (currentCycle) cycles.push(currentCycle);
                currentCycle = {
                    id: generateCycleId(plotId, activity.date),
                    plotId: plotId,
                    start: activity.date,
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