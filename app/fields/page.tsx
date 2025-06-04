// app/activities/page.tsx
import { getAllActiviesDetails } from '@/lib/data'
import ActivitiesList from '@/components/ActivitiesList'
import FieldsOverview from '@/components/FieldsOverview'

export const FieldsPage = async () => {
    /* const [events, fields] = await Promise.all([
        getPlantingEventsWithFinance(),
        getFieldsWithCurrentCrop() // 新增获取所有地块
    ]); */

    const activities = await getAllActiviesDetails()

    return (
        <div className="h-full flex flex-col">
            <header className="bg-white p-4 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">农事活动</h1>
                <p className="text-sm text-gray-500 mt-1">2024年5月20日</p>
            </header>
            {/* <FieldsOverview fields={fields} /> */}
            <ActivitiesList initialEvents={events} fields={fields} />
        </div>)
}

export default FieldsPage