// components/reports/ActivitiesList.tsx
import { ActivityInCycle } from '@/lib/types'; // 使用新的、精确的派生类型
import { calculateFinancials } from '@/lib/data';
import { CalendarDays, Crop, Leaf, ShoppingCart, Warehouse, Zap, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

// 活动类型图标映射
const activityIcons: Record<string, React.JSX.Element> = {
    '种植': <Leaf className="w-4 h-4 text-green-500" />,
    '施肥': <Zap className="w-4 h-4 text-yellow-500" />,
    '播种': <Crop className="w-4 h-4 text-blue-500" />,
    '采收': <ShoppingCart className="w-4 h-4 text-purple-500" />,
    '灌溉': <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v12M6 6h12" />
    </svg>,
    '默认': <Warehouse className="w-4 h-4 text-gray-500" />
};

const ActivitiesList = ({
    activities,
    isEditAble = false
}: {
    activities: ActivityInCycle[]; // 更新 Prop 类型
    isEditAble?: boolean
}) => {
    return (
        <div className="space-y-3 mb-20">
            {activities.map((activity) => {
                const { totalIncome, totalExpense, netAmount } = calculateFinancials(activity);
                const activityIcon = activityIcons[activity.type.name] || activityIcons['默认'];

                return (
                    <div
                        key={activity.id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        {/* 活动头部 */}
                        <div className="flex items-start p-4 border-b border-gray-100">
                            <div className="flex-shrink-0 mt-0.5 mr-3 p-2 bg-gray-50 rounded-lg">
                                {activityIcon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-800 truncate">
                                        {activity.plot.name} · {activity.type.name}
                                    </h3>
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-500 whitespace-nowrap ml-2 flex items-center" suppressHydrationWarning>
                                            <CalendarDays className="w-4 h-4 mr-1 text-gray-400" />
                                            {new Date(activity.date).toLocaleDateString('zh-CN')}
                                        </span>
                                        {isEditAble && (
                                            <div className='flex items-center'>
                                                <Link
                                                    href={{ query: { editActivity: activity.id.toString() } }}
                                                    scroll={false}
                                                    replace
                                                    className="ml-2 p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                                                    aria-label="编辑活动"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={{ query: { deleteActivity: activity.id.toString() } }}
                                                    scroll={false}
                                                    replace
                                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600"
                                                    aria-label="删除活动"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center mt-2 space-x-3">
                                    {totalIncome > 0 && (
                                        <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full flex items-center">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                                            收入: ¥{totalIncome.toLocaleString()}
                                        </span>
                                    )}
                                    {totalExpense < 0 && (
                                        <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-700 rounded-full flex items-center">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                                            支出: ¥{Math.abs(totalExpense).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 财务记录详情 */}
                        {activity.records && activity.records.length > 0 && (
                            <div className="bg-gray-50 p-3">
                                <div className="text-xs text-gray-500 font-medium mb-2 flex items-center">
                                    关联财务记录
                                </div>
                                <div className="space-y-2">
                                    {activity.records.map((record) => (
                                        <div
                                            key={record.id}
                                            className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-700 truncate">{record.description || '未命名记录'}</p>
                                                <p className="text-xs text-gray-400 mt-0.5" suppressHydrationWarning>
                                                    {new Date(record.date).toLocaleDateString('zh-CN')}
                                                </p>
                                            </div>
                                            <span className={`ml-2 font-medium whitespace-nowrap ${record.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {record.amount > 0 ? '+' : ''}
                                                {record.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {activity.records.length > 1 && (
                                    <div className={`flex justify-between items-center mt-3 pt-3 border-t border-gray-200 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className="font-medium">活动净值</span>
                                        <span className="font-semibold">
                                            {netAmount >= 0 ? '+' : ''}
                                            {netAmount.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default ActivitiesList
