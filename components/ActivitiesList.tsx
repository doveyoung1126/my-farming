// components/ActivitiesList.tsx
import { ActivityWithFinancials } from '@/lib/types'

const ActivitiesList = ({
    activities
}: {
    activities: ActivityWithFinancials[]
}) => {
    return <>
        {activities.map((activity) => (
            <div
                key={`${activity.type}-${activity.id}`}
                className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-gray-800">
                            {activity.plotName} · {activity.type}
                            {/* {activity.type === 'event' && ` · ${activity.subject}`} */}
                        </h3>

                        {/* <p className="text-sm text-gray-500 mt-1">
                      {activity.type === 'income' && `买家：${activity.subject}`}
                      {activity.type === 'expense' && activity.subject}
                      {activity.crop}
                    </p> */}
                    </div>
                    <span className="text-sm text-gray-400" suppressHydrationWarning>
                        {activity.date.toLocaleDateString('zh-CN')}
                    </span>
                </div>

                {/* 金额显示 */}
                {(activity.records) && activity.records.map((record) => (
                    <div key={record.id} className="flex justify-between items-start">
                        <p className="text-sm text-gray-500 mt-1" suppressHydrationWarning>
                            {record.date.toLocaleDateString('zh-CN')} - {record.description}
                        </p>
                        <span className={`${record.amount > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                            }`}>
                            {record.amount.toLocaleString()}
                        </span>
                    </div>

                ))}
                {/* {activity.amount && (
                  <div className="mt-2 text-right">
                    <span className={`${activity.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}>
                      {activity.type === 'income' ? '+' : '-'}
                      ¥{activity.amount.toLocaleString()}
                    </span>
                  </div>
                )} */}
            </div>
        ))}
    </>
}

export default ActivitiesList