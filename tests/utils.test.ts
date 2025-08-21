
// tests/utils.test.ts

import { calculateFinancials, getCycleFinancialSummary } from '../lib/utils';
import { ActivityInCycle, CycleWithDetails } from '../lib/types'; // 我们需要导入类型来构建测试数据

describe('calculateFinancials', () => {

  it('should correctly calculate income, expense, and net amount from records', () => {
    // 1. 准备 (Arrange): 创建一个完全符合 ActivityInCycle 类型的模拟对象
    const mockActivity: ActivityInCycle = {
      // --- 基础 Activity 属性 ---
      id: 1,
      date: new Date('2025-08-20T10:00:00Z'),
      plotId: 101,
      cycleId: 201,
      activityTypeId: 301,
      crop: '番茄',
      // --- Prisma include 的关联对象 ---
      plot: { id: 101, name: '一号大棚', area: 2.5, isArchived: false, crop: '' },
      type: { id: 301, name: '采收', cycleMarker: null },
      // --- 关键测试数据 ---
      records: [
        { id: 1, description: '销售收入', amount: 1000, date: new Date('2025-08-20T11:00:00Z'), activityId: 1, recordTypeId: 1, type: { id: 1, name: '销售', category: 'income' } },
        { id: 2, description: '运输费', amount: -300, date: new Date('2025-08-20T12:00:00Z'), activityId: 1, recordTypeId: 2, type: { id: 2, name: '物流', category: 'expense' } },
        { id: 3, description: '包装费', amount: -150, date: new Date('2025-08-20T12:30:00Z'), activityId: 1, recordTypeId: 3, type: { id: 3, name: '物料', category: 'expense' } },
      ],
    };

    // 2. 执行 (Act)
    const result = calculateFinancials(mockActivity);

    // 3. 断言 (Assert)
    expect(result.totalIncome).toBe(1000);
    expect(result.totalExpense).toBe(-450);
    expect(result.netAmount).toBe(550);
  });

  it('should return all zeros if there are no records', () => {
    // 准备 (Arrange): 同样，这个对象也需要符合完整的类型
    const mockActivityWithNoRecords: ActivityInCycle = {
      id: 2,
      date: new Date('2025-09-01T09:00:00Z'),
      plotId: 102,
      cycleId: 202,
      activityTypeId: 401,
      crop: '白菜',
      plot: { id: 102, name: '二号大棚', area: 3.0, isArchived: false, crop: '' },
      type: { id: 401, name: '施肥', cycleMarker: null },
      records: [], // 记录为空
    };

    // 执行 (Act)
    const result = calculateFinancials(mockActivityWithNoRecords);

    // 断言 (Assert)
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.netAmount).toBe(0);
  });

});

describe('getCycleFinancialSummary', () => {
  // 基础模拟数据，可以在每个测试中按需修改
  const baseMockCycle: CycleWithDetails = {
    id: 1,
    plotId: 1,
    crop: '玉米',
    budget: 5000,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-06-30'),
    status: 'completed',
    plot: { id: 1, name: '东边地块', area: 10, isArchived: false, crop: '玉米' },
    startActivityId: 10,
    endActivityId: 20,
    startActivity: { id: 10, activityTypeId: 1, date: new Date('2025-01-01'), plotId: 1, cycleId: 1, crop: '玉米' },
    endActivity: { id: 20, activityTypeId: 2, date: new Date('2025-06-30'), plotId: 1, cycleId: 1, crop: '玉米' },
    activities: [], // 每个测试用例会填充这个
  };

  it('should correctly calculate summary for a cycle with income and expenses', () => {
    const mockCycle: CycleWithDetails = {
      ...baseMockCycle,
      activities: [
        {
          id: 11,
          date: new Date('2025-02-10'),
          plotId: 1,
          cycleId: 1,
          activityTypeId: 101,
          crop: '玉米',
          plot: { id: 1, name: '东边地块', area: 10, isArchived: false, crop: '玉米' },
          type: { id: 101, name: '施肥', cycleMarker: null },
          records: [
            { id: 1001, amount: -500, date: new Date(), recordTypeId: 201, description: '肥料成本', activityId: 11, type: { id: 201, name: '物料', category: 'expense' } },
            { id: 1002, amount: -300, date: new Date(), recordTypeId: 202, description: '人工费', activityId: 11, type: { id: 202, name: '人工', category: 'expense' } },
          ],
        },
        {
          id: 12,
          date: new Date('2025-06-20'),
          plotId: 1,
          cycleId: 1,
          activityTypeId: 102,
          crop: '玉米',
          plot: { id: 1, name: '东边地块', area: 10, isArchived: false, crop: '玉米' },
          type: { id: 102, name: '采收', cycleMarker: null },
          records: [
            { id: 1003, amount: 2000, date: new Date(), recordTypeId: 203, description: '销售收入', activityId: 12, type: { id: 203, name: '销售', category: 'income' } },
          ],
        },
      ],
    };

    const summary = getCycleFinancialSummary(mockCycle);

    expect(summary.totalIncome).toBe(2000);
    expect(summary.totalExpense).toBe(-800);
    expect(summary.netProfit).toBe(1200);
    // ROI = (1200 / 800) * 100
    expect(summary.roi).toBe(150);
  });

  it('should return all zeros if there are no financial records', () => {
    const mockCycle: CycleWithDetails = {
      ...baseMockCycle,
      activities: [
        {
          id: 13,
          date: new Date('2025-03-15'),
          plotId: 1,
          cycleId: 1,
          activityTypeId: 103,
          crop: '玉米',
          plot: { id: 1, name: '东边地块', area: 10, isArchived: false, crop: '玉米' },
          type: { id: 103, name: '灌溉', cycleMarker: null },
          records: [], // No records
        },
      ],
    };

    const summary = getCycleFinancialSummary(mockCycle);

    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(0);
    expect(summary.netProfit).toBe(0);
    expect(summary.roi).toBe(0);
  });

  it('should return 0 for ROI if there are no expenses', () => {
    const mockCycle: CycleWithDetails = {
      ...baseMockCycle,
      activities: [
        {
          id: 14,
          date: new Date('2025-06-25'),
          plotId: 1,
          cycleId: 1,
          activityTypeId: 102,
          crop: '玉米',
          plot: { id: 1, name: '东边地块', area: 10, isArchived: false, crop: '玉米' },
          type: { id: 102, name: '采收', cycleMarker: null },
          records: [
            { id: 1004, amount: 1500, date: new Date(), recordTypeId: 203, description: '销售收入', activityId: 14, type: { id: 203, name: '销售', category: 'income' } },
          ],
        },
      ],
    };

    const summary = getCycleFinancialSummary(mockCycle);

    expect(summary.totalIncome).toBe(1500);
    expect(summary.totalExpense).toBe(0);
    expect(summary.netProfit).toBe(1500);
    expect(summary.roi).toBe(0); // Crucial check for division by zero
  });
});
