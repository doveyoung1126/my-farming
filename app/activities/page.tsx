// app/activities/page.tsx
import { getAllActiviesDetails, getPlots } from '@/lib/data'
import Activities from '@/components/activities/Activities'
import { PrismaPlots } from '@/lib/types'
// import FieldsOverview from '@/components/FieldsOverview'

export const ActiviesPage = async () => {
    /* const [events, fields] = await Promise.all([
        getPlantingEventsWithFinance(),
        getFieldsWithCurrentCrop() // 新增获取所有地块
    ]); */

    const plots: PrismaPlots[] = await getPlots()
    const activities = await getAllActiviesDetails()

    return (
        <div className="h-full flex flex-col pb-30">
            <header className="bg-white p-4 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">农事活动</h1>
                <p className="text-sm text-gray-500 mt-1">2024年5月20日</p>
            </header>
            {/* <PlotsOverview plots={plots} /> */}
            <Activities activities={activities} plots={plots} />
        </div>)
}

const PlotsOverview = ({ plots }: { plots: PrismaPlots[] }) => {

    return (
        <div className="p-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plots.map(plot => (
                    <div
                        key={plot.id}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-medium">{plot.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {plot.area}亩
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-sm ${plot.crop
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {plot.crop || '空闲'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ActiviesPage