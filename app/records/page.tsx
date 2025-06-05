// import { getFinancialSummary, getFinancialRecords } from '@/lib/data';
import { getAllActiviesDetails } from '@/lib/data'
import { RecordsList } from '@/components/records/RecordsList';
import { FinancialWithActivity } from '@/lib/types'

export default async function RecordsPage() {

    const activities = await getAllActiviesDetails()
    // const records = activities.filter(activity => activity.records.length > 0)
    const records: FinancialWithActivity[] = activities.flatMap(activity => {
        if (!activity.records || activity.records.length === 0) {
            return []
        }
        return activity.records.map(record => ({
            activityId: activity.id,
            activityType: activity.type,
            activityDate: activity.date,
            plotName: activity.plotName,
            crop: activity.crop,
            ...record
        }))
    })
    /* const [summary, records] = await Promise.all([
        getFinancialSummary(),
        getFinancialRecords()
    ]); */
    const totalIncome = 1000
    const totalExpenses = 2000
    return (
        <div className="h-full flex flex-col">
            <header className="bg-white p-4 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">财务状况</h1>
                <p className="text-sm text-gray-500 mt-1">2024年5月20日</p>
            </header>
            {/* 统计卡片 */}
            <div className="p-4 grid grid-cols-3 gap-2">
                <div className="bg-white p-4 rounded-xl shadow">
                    <div className="text-sm text-gray-500">总支出</div>
                    <div className="text-2xl font-bold text-red-600">
                        ¥{totalExpenses.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                    <div className="text-sm text-gray-500">总收入</div>
                    <div className="text-2xl font-bold text-green-600">
                        ¥{totalIncome.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                    <div className="text-sm text-gray-500">净收益</div>
                    <div className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {(totalIncome - totalExpenses).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* 过滤选项卡 */}
            <RecordsList records={records} />

        </div>
    );
}