import { ActivityInCycle, CycleFinancialSummary, CycleWithDetails } from './types'
/**
 * 计算单个周期的财务摘要
 * @param cycle - 包含所有活动和记录的完整周期对象
 * @returns 财务摘要对象
 */
export const getCycleFinancialSummary = (cycle: CycleWithDetails): CycleFinancialSummary => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const activity of cycle.activities) {
        for (const record of activity.records) {
            if (record.type.category === 'income') {
                totalIncome += record.amount;
            } else if (record.type.category === 'expense') {
                totalExpense += record.amount;
            }
        }
    }

    const netProfit = totalIncome + totalExpense;
    const roi = totalExpense !== 0 ? (netProfit / Math.abs(totalExpense)) * 100 : 0;

    return {
        totalIncome,
        totalExpense,
        netProfit,
        roi,
    };
};


export function calculateFinancials(activity: ActivityInCycle) {
    const totalIncome = activity.records?.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0) || 0;
    const totalExpense = activity.records?.filter(r => r.amount < 0).reduce((sum, r) => sum + r.amount, 0) || 0;
    const netAmount = totalIncome + totalExpense;

    return { totalIncome, totalExpense, netAmount };
}
