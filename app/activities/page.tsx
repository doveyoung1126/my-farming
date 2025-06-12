// app/activities/page.tsx
import { getAllActiviesDetails, getPlots } from '@/lib/data'
import Activities from '@/components/activities/Activities'
import { PrismaPlots } from '@/lib/types'
import { CalendarDays } from 'lucide-react'

export const ActiviesPage = async () => {

    const plots: PrismaPlots[] = await getPlots()
    const activities = await getAllActiviesDetails()

    // 更友好的日期格式
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="h-full flex flex-col pb-30">
            {/* 优化头部样式 */}
            <header className="bg-white px-5 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
                                    农事活动
                                </span>
                            </h1>
                            <div className="flex items-center mt-1 text-gray-500 text-sm">
                                <CalendarDays className="w-4 h-4 mr-1.5 text-gray-400" />
                                {formattedDate}
                            </div>
                        </div>

                        {/* 添加状态指示器 */}
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                                运营中地块: {plots.filter(p => p.crop).length}
                            </div>
                            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                                活动总数: {activities.length}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="h-2 bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100"></div>
            <Activities activities={activities} plots={plots} />
        </div>)
}

export default ActiviesPage