import { ActivityWithFinancials, PrismaActivityWithFinancials, PrismaPlots } from './types'
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