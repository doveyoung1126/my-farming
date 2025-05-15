import { getFinancialSummary, getFinancialRecords } from '@/lib/data';
import RecordsList from '@/components/RecordsList';

export default async function RecordsPage() {

    const [summary, records] = await Promise.all([
        getFinancialSummary(),
        getFinancialRecords()
    ]);

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
                        ¥{summary.totalExpenses.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                    <div className="text-sm text-gray-500">总收入</div>
                    <div className="text-2xl font-bold text-green-600">
                        ¥{summary.totalIncome.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                    <div className="text-sm text-gray-500">净收益</div>
                    <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        ¥{summary.netProfit.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* 过滤选项卡 */}
            <RecordsList initialRecords={records} />

        </div>
    );
}