// lib/seedTestData.ts
import { PrismaClient, RecordCategory, CycleMarker } from '@prisma/client';

const prisma = new PrismaClient();

// 财务记录类型配置（收入/支出） - 按活动类型分类
const FINANCIAL_TYPES = [
  // 种植相关支出
  { name: '种子采购', category: 'expense', activityType: '整地' },
  { name: '土地准备', category: 'expense', activityType: '整地' },

  // 生长期支出
  { name: '肥料购买', category: 'expense', activityType: '施肥' },
  { name: '农药支出', category: 'expense', activityType: '施肥' },
  { name: '灌溉设备', category: 'expense', activityType: '灌溉' },

  // 收获相关收入
  { name: '蔬菜销售', category: 'income', activityType: '收获' },
  { name: '水果销售', category: 'income', activityType: '收获' },
  { name: '包装收入', category: 'income', activityType: '包装' },

  // 其他
  { name: '设备租赁', category: 'expense', activityType: '运输' },
  { name: '运输收入', category: 'income', activityType: '运输' },
  { name: '政府补贴', category: 'income', activityType: null }
];

// 活动类型配置 - 添加周期标记
const ACTIVITY_TYPES = [
  { name: '整地', cycleMarker: CycleMarker.START }, // 周期开始
  { name: '播种', cycleMarker: CycleMarker.START }, // 周期开始
  { name: '灌溉', cycleMarker: null },
  { name: '施肥', cycleMarker: null },
  { name: '除草', cycleMarker: null },
  { name: '收获', cycleMarker: CycleMarker.END },   // 周期结束
  { name: '包装', cycleMarker: null },
  { name: '运输', cycleMarker: null }
];

// 地块配置 - 移除plantDate
const PLOTS = [
  { name: '北区A1', area: 5.2, crop: '西红柿' },
  { name: '北区B2', area: 3.8, crop: '黄瓜' },
  { name: '南区C3', area: 7.1, crop: '草莓' },
  { name: '东区D4', area: 4.5, crop: '生菜' },
];

// 基础日期范围
const START_DATE = new Date(2023, 0, 1); // 2023年1月1日
const END_DATE = new Date(); // 当前日期

async function seedDatabase() {
  // 清空现有测试数据
  await prisma.$transaction([
    prisma.record.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.plot.deleteMany(),
    prisma.activityType.deleteMany(),
    prisma.recordCategoryType.deleteMany(),
  ]);

  // 1. 创建财务记录类型
  const recordTypes = [];
  for (const ft of FINANCIAL_TYPES) {
    const type = await prisma.recordCategoryType.create({
      data: {
        name: ft.name,
        category: ft.category as RecordCategory
      }
    });
    recordTypes.push({ ...type, activityType: ft.activityType });
  }

  // 2. 创建活动类型（带周期标记）
  const activityTypes = [];
  for (const at of ACTIVITY_TYPES) {
    const type = await prisma.activityType.create({
      data: {
        name: at.name,
        cycleMarker: at.cycleMarker
      }
    });
    activityTypes.push(type);
  }

  // 3. 创建地块
  const plots = [];
  for (const plotData of PLOTS) {
    const plot = await prisma.plot.create({ data: plotData });
    plots.push(plot);
  }

  // 4. 为每个地块创建完整的种植周期
  const activities = [];

  for (const plot of plots) {
    // 获取关键活动类型
    const plantingType = activityTypes.find(at =>
      at.cycleMarker === CycleMarker.START && at.name.includes('播种')
    ) || activityTypes[1]; // 默认播种

    const harvestType = activityTypes.find(at =>
      at.cycleMarker === CycleMarker.END && at.name.includes('收获')
    ) || activityTypes[5]; // 默认收获

    // 随机生成种植日期（在2023年内）
    const plantingDate = randomDate(START_DATE, new Date(2024, 11, 31));

    // 创建周期开始活动（种植）
    const plantingActivity = await createActivityWithRecords(
      plot,
      plantingType,
      plantingDate,
      recordTypes.filter(rt =>
        rt.activityType === '整地' || rt.name.includes('种子')
      )
    );
    activities.push(plantingActivity);

    // 创建生长周期活动（3-5个）
    const growthActivitiesCount = Math.floor(Math.random() * 3) + 3;
    const growthTypes = activityTypes.filter(at =>
      !at.cycleMarker && !at.name.includes('收获')
    );

    for (let i = 0; i < growthActivitiesCount; i++) {
      // 在种植日期后5-60天内
      const activityDate = new Date(plantingDate);
      activityDate.setDate(activityDate.getDate() + 5 + (i * 15));

      const activityType = growthTypes[Math.floor(Math.random() * growthTypes.length)];

      const activity = await createActivityWithRecords(
        plot,
        activityType,
        activityDate,
        recordTypes.filter(rt =>
          rt.activityType === activityType.name ||
          (activityType.name === '施肥' && rt.name.includes('肥料'))
        )
      );
      activities.push(activity);
    }

    // 创建周期结束活动（收获）
    const harvestDate = new Date(plantingDate);
    harvestDate.setMonth(plantingDate.getMonth() + 3); // 3个月后收获

    const harvestActivity = await createActivityWithRecords(
      plot,
      harvestType,
      harvestDate,
      recordTypes.filter(rt =>
        rt.category === 'income' &&
        (rt.name.includes('销售') || rt.name.includes(plot.crop || ''))
      )
    );
    activities.push(harvestActivity);
  }

  // 5. 添加额外的独立活动（非周期内）
  for (let i = 0; i < 10; i++) {
    const plot = plots[Math.floor(Math.random() * plots.length)];
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    const activityDate = randomDate(START_DATE, END_DATE);

    const activity = await createActivityWithRecords(
      plot,
      activityType,
      activityDate,
      recordTypes.filter(rt =>
        rt.activityType === activityType.name ||
        (activityType.cycleMarker ? rt.name.includes('设备') : true)
      )
    );
    activities.push(activity);
  }

  console.log(`✅ 测试数据生成完成:
  地块: ${plots.length}
  活动类型: ${activityTypes.length}
  财务类型: ${recordTypes.length}
  农业活动: ${activities.length}
  财务记录: ${activities.reduce((sum, a) => sum + a.records.length, 0)}
  
  生成的完整周期: ${plots.length} (每个地块1个)
  `);
}

// 创建活动及关联财务记录
async function createActivityWithRecords(
  plot: any,
  activityType: any,
  date: Date,
  applicableRecords: any[]
) {
  // 创建活动
  const activity = await prisma.activity.create({
    data: {
      date,
      plot: { connect: { id: plot.id } },
      type: { connect: { id: activityType.id } },
      records: {
        create: applicableRecords.map(record => ({
          amount: calculateRecordAmount(record, plot, activityType),
          date: new Date(date.getTime() + Math.random() * 86400000), // 同一天内随机时间
          type: { connect: { id: record.id } },
          description: `${record.name} - ${plot.crop}`
        }))
      }
    },
    include: { records: true }
  });

  return activity;
}

// 智能计算财务金额
function calculateRecordAmount(record: any, plot: any, activityType: any) {
  const isIncome = record.category === 'income';

  // 基础值
  let baseValue = isIncome ?
    (Math.random() * 4000 + 1000) :
    (Math.random() * 500 + 50);

  // 地块面积影响
  baseValue *= plot.area * 0.5;

  // 活动类型调整
  if (activityType.name === '收获') baseValue *= 1.5;
  if (activityType.name === '整地') baseValue *= 0.8;

  // 精确到两位小数
  const amount = parseFloat(baseValue.toFixed(2));

  // 支出记为负数
  return isIncome ? amount : -amount;
}

// 生成指定范围内的随机日期
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

seedDatabase()
  .catch(e => {
    console.error('测试数据生成失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());