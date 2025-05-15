// app/(dashboard)/page.tsx
import { getDashboardStats, getRecentActivities } from '@/lib/data';

export default async function Home() {

  const [stats, activities] = await Promise.all([
    getDashboardStats(),
    getRecentActivities()
  ]);

  // 日期格式化
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 头部 */}
      <header className="bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">农田总览</h1>
        <p className="text-sm text-gray-500 mt-1">2024年5月20日</p>
      </header>

      {/* 数据卡片 */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">总支出</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            ¥{stats.totalSpent.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center">
            <span className="text-red-500">↑</span>
            较上月 +12%
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">总收入</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            ¥{stats.totalEarned.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center">
            <span className="text-green-500">↑</span>
            较上月 +8%
          </div>
        </div>

        <div className="col-span-2 bg-blue-50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">当前作物</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {stats.currentCrops} 种
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              🌱
            </div>
          </div>
        </div>
      </div>

      {/* 近期活动部分改造 */}
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col px-4 mt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">近期活动</h2>
          <div className="flex-1 min-h-0 overflow-y-auto pb-30 space-y-4">
            {activities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {activity.action}
                      {activity.type === 'event' && ` · ${activity.subject}`}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.type === 'income' && `买家：${activity.subject}`}
                      {activity.type === 'expense' && activity.subject}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>

                {/* 金额显示 */}
                {activity.amount && (
                  <div className="mt-2 text-right">
                    <span className={`${activity.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}>
                      {activity.type === 'income' ? '+' : '-'}
                      ¥{activity.amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 悬浮操作按钮 */}
      <button className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 底部导航 */}
      {/* <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 h-14">
          {['📊 总览', '📝 记账', '🌱 农事', '📅 提醒', '⚙️ 设置'].map((item) => (
            <button
              key={item}
              className="flex flex-col items-center justify-center text-sm text-gray-600 hover:bg-gray-50"
            >
              <span className="text-lg">{item.split(' ')[0]}</span>
              <span className="text-xs">{item.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </nav> */}
    </div>
  );
}