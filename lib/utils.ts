
import { ActivityWithFinancials } from '@/lib/types';

export function calculateFinancials(activity: ActivityWithFinancials) {
  const totalIncome = activity.records?.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0) || 0;
  const totalExpense = activity.records?.filter(r => r.amount < 0).reduce((sum, r) => sum + r.amount, 0) || 0;
  const netAmount = totalIncome + totalExpense;

  return { totalIncome, totalExpense, netAmount };
}
