// lib/seedTestData.ts
import { PrismaClient, RecordCategory } from '@prisma/client';

const prisma = new PrismaClient();

// 财务记录类型配置（收入/支出）
const FINANCIAL_TYPES = [
  { name: '种子采购', category: 'expense' },
  { name: '肥料购买', category: 'expense' },
  { name: '设备租赁', category: 'expense' },
  { name: '蔬菜销售', category: 'income' },
  { name: '水果销售', category: 'income' },
  { name: '政府补贴', category: 'income' },
  { name: '农药支出', category: 'expense' },
  { name: '运输收入', category: 'income' }
];

// 活动类型配置
const ACTIVITY_TYPES = [
  '整地',
  '播种',
  '灌溉',
  '施肥',
  '除草',
  '收获',
  '包装',
  '运输'
];

// 地块配置
const PLOTS = [
  { name: '北区A1', area: 5.2, crop: '西红柿' },
  { name: '北区B2', area: 3.8, crop: '黄瓜' },
  { name: '南区C3', area: 7.1, crop: '草莓' },
  { name: '东区D4', area: 4.5, crop: '生菜' },
];

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
  for (const { name, category } of FINANCIAL_TYPES) {
    const type = await prisma.recordCategoryType.create({
      data: {
        name,
        category: category as RecordCategory // 确保类型匹配
      }
    });
    recordTypes.push(type);
  }

  // 2. 创建活动类型
  const activityTypes = [];
  for (const name of ACTIVITY_TYPES) {
    const type = await prisma.activityType.create({ data: { name } });
    activityTypes.push(type);
  }

  // 3. 创建地块
  const plots = [];
  for (const plotData of PLOTS) {
    const plot = await prisma.plot.create({ data: plotData });
    plots.push(plot);
  }

  // 4. 创建农业活动及关联财务记录
  const activities = [];
  const currentDate = new Date();

  for (let i = 0; i < 30; i++) { // 生成30个活动
    const plot = plots[Math.floor(Math.random() * plots.length)];
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    const activityDate = new Date(currentDate);
    activityDate.setDate(activityDate.getDate() - Math.floor(Math.random() * 60)); // 过去60天内

    // 创建活动
    const activity = await prisma.activity.create({
      data: {
        date: activityDate,
        plot: { connect: { id: plot.id } },
        type: { connect: { id: activityType.id } },
        records: {
          create: generateFinancialRecords(recordTypes, activityDate)
        }
      },
      include: { records: true }
    });

    activities.push(activity);
  }

  console.log(`✅ 测试数据生成完成:
  地块: ${plots.length}
  活动类型: ${activityTypes.length}
  财务类型: ${recordTypes.length}
  农业活动: ${activities.length}
  财务记录: ${activities.reduce((sum, a) => sum + a.records.length, 0)}
  `);
}

// 生成财务记录（收入/支出）
function generateFinancialRecords(recordTypes: any[], activityDate: Date) {
  const records = [];
  const recordCount = Math.floor(Math.random() * 3) + 1;

  for (let j = 0; j < recordCount; j++) {
    const type = recordTypes[Math.floor(Math.random() * recordTypes.length)];
    const isIncome = type.category === 'income';

    records.push({
      amount: isIncome
        ? parseFloat((Math.random() * 5000 + 1000).toFixed(2))
        : parseFloat((Math.random() * 1000 + 50).toFixed(2)) * -1, // 支出记为负数
      date: new Date(activityDate.getTime() + Math.random() * 86400000),
      type: { connect: { id: type.id } },
      description: `${isIncome ? '收入' : '支出'}: ${type.name}`
    });
  }

  return records;
}

seedDatabase()
  .catch(e => {
    console.error('测试数据生成失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());