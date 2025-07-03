// prisma/seedTestData.ts
import { PrismaClient, RecordCategory, CycleMarker, ActivityType, RecordCategoryType } from '@prisma/client';

const prisma = new PrismaClient();

// --- 配置数据 ---

// 地块配置
const PLOTS_CONFIG = [
  { name: 'A1-番茄试验田', area: 2.5 },
  { name: 'B2-高效黄瓜棚', area: 4.0 },
  { name: 'C3-有机草莓园', area: 3.2 },
  { name: 'D4-水培生菜区', area: 1.8 },
  { name: 'E5-备用空闲地', area: 5.0 },
];

// 作物类型
const CROPS = ['番茄', '黄瓜', '草莓', '生菜', '辣椒'];

// 活动类型配置 (包含周期标记)
const ACTIVITY_TYPES_CONFIG = [
  { name: '土地休整', cycleMarker: null },
  { name: '播种育苗', cycleMarker: CycleMarker.START },
  { name: '日常灌溉', cycleMarker: null },
  { name: '营养施肥', cycleMarker: null },
  { name: '病虫害防治', cycleMarker: null },
  { name: '成熟采收', cycleMarker: CycleMarker.END },
  { name: '产品包装', cycleMarker: null },
  { name: '市场运输', cycleMarker: null },
];

// 财务类型配置 (关联到活动类型)
const FINANCIAL_TYPES_CONFIG = [
  // 周期开始成本
  { name: '种子/种苗采购', category: 'expense', activityTypeName: '播种育苗' },
  { name: '育苗基质', category: 'expense', activityTypeName: '播种育苗' },
  // 生长过程成本
  { name: '有机肥料', category: 'expense', activityTypeName: '营养施肥' },
  { name: '复合肥料', category: 'expense', activityTypeName: '营养施肥' },
  { name: '生物农药', category: 'expense', activityTypeName: '病虫害防治' },
  { name: '灌溉水电费', category: 'expense', activityTypeName: '日常灌溉' },
  // 收获及后续成本
  { name: '雇佣采收人工', category: 'expense', activityTypeName: '成熟采收' },
  { name: '包装材料', category: 'expense', activityTypeName: '产品包装' },
  { name: '物流运输费', category: 'expense', activityTypeName: '市场运输' },
  // 收入
  { name: '一级果蔬销售', category: 'income', activityTypeName: '成熟采收' },
  { name: '次级果蔬销售', category: 'income', activityTypeName: '成熟采收' },
  // 其他
  { name: '农机租赁', category: 'expense', activityTypeName: null },
  { name: '政府项目补贴', category: 'income', activityTypeName: null },
];

// --- 全局变量，用于存储创建的类型 ---
let activityTypes: ActivityType[] = [];
let financialTypes: RecordCategoryType[] = [];

// --- 辅助函数 ---

/**
 * 在指定范围内生成一个随机日期
 * @param start 开始日期
 * @param end 结束日期
 * @returns 随机日期
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * 在数字范围内生成随机数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数
 */
function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 智能计算财务金额
 * @param category 收入或支出
 * @param plotArea 地块面积
 * @returns 金额
 */
function calculateAmount(category: 'income' | 'expense', plotArea: number): number {
  let baseValue = 0;
  if (category === 'income') {
    baseValue = randomNumber(800, 1500) * plotArea; // 收入与面积强相关
  } else {
    baseValue = randomNumber(50, 200) * plotArea; // 支出与面积弱相关
  }
  const amount = parseFloat(baseValue.toFixed(2));
  return category === 'income' ? amount : -amount; // 支出为负数
}


// --- 主逻辑 ---

async function main() {
  console.log('🚀 开始填充测试数据...');

  // 1. 清理数据库
  console.log('🧹 清理旧数据...');
  await prisma.$transaction([
    prisma.record.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.plot.deleteMany(),
    prisma.activityType.deleteMany(),
    prisma.recordCategoryType.deleteMany(),
  ]);

  // 2. 创建基础类型数据
  console.log('🌱 创建基础类型...');

  // 创建活动类型并存入全局变量
  activityTypes = await Promise.all(
    ACTIVITY_TYPES_CONFIG.map(at => prisma.activityType.create({ data: at }))
  );

  // 创建财务类型并存入全局变量
  financialTypes = await Promise.all(
    FINANCIAL_TYPES_CONFIG.map(ft => prisma.recordCategoryType.create({
      data: { name: ft.name, category: ft.category as RecordCategory }
    }))
  );

  // 3. 创建地块
  console.log('🏞️ 创建地块...');
  const plots = await Promise.all(
    PLOTS_CONFIG.map(p => prisma.plot.create({ data: p }))
  );

  // 4. 为每个地块创建生产周期和活动
  console.log('🔄 创建生产周期和活动...');
  for (const plot of plots) {
    // E5地块保持空闲
    if (plot.name.includes('空闲')) {
      console.log(`   - 地块 ${plot.name} 保持空闲.`);
      continue;
    }

    const crop = CROPS[Math.floor(Math.random() * CROPS.length)];
    await prisma.plot.update({ where: { id: plot.id }, data: { crop } });
    console.log(`   - 为地块 ${plot.name} 分配作物: ${crop}`);

    // 为每个地块创建2个周期 (1个完成, 1个进行中)
    for (let i = 0; i < 2; i++) {
      const isCompletedCycle = i === 0;
      const cycleYear = new Date().getFullYear() - (1 - i); // 第一个周期是去年的

      // a. 定义周期的开始和结束活动类型
      const startType = activityTypes.find(at => at.cycleMarker === CycleMarker.START)!;
      const endType = activityTypes.find(at => at.cycleMarker === CycleMarker.END)!;

      // b. 创建周期开始活动
      const startDate = randomDate(new Date(`${cycleYear}-03-01`), new Date(`${cycleYear}-04-15`));
      await createActivity(plot.id, crop, startType.id, startDate, plot.area);

      // c. 创建生长过程中的活动 (3-5个)
      const growthActivityCount = Math.floor(randomNumber(3, 5));
      const growthTypes = activityTypes.filter(at => at.cycleMarker === null && !['产品包装', '市场运输'].includes(at.name));
      for (let j = 0; j < growthActivityCount; j++) {
        const activityDate = new Date(startDate.getTime() + randomNumber(15, 75) * 24 * 60 * 60 * 1000);
        const randomType = growthTypes[Math.floor(Math.random() * growthTypes.length)];
        await createActivity(plot.id, crop, randomType.id, activityDate, plot.area);
      }

      // d. 如果是已完成的周期，则创建结束活动和后续活动
      if (isCompletedCycle) {
        const endDate = new Date(startDate.getTime() + randomNumber(90, 120) * 24 * 60 * 60 * 1000);
        await createActivity(plot.id, crop, endType.id, endDate, plot.area);

        // 创建包装和运输活动
        const packagingType = activityTypes.find(at => at.name === '产品包装')!;
        const transportType = activityTypes.find(at => at.name === '市场运输')!;
        await createActivity(plot.id, crop, packagingType.id, new Date(endDate.getTime() + 1 * 24 * 60 * 60 * 1000), plot.area);
        await createActivity(plot.id, crop, transportType.id, new Date(endDate.getTime() + 2 * 24 * 60 * 60 * 1000), plot.area);
        console.log(`     - 为 ${plot.name} 创建了一个于 ${cycleYear} 年完成的周期.`);
      } else {
        console.log(`     - 为 ${plot.name} 创建了一个当前正在进行的周期.`);
      }
    }
  }

  console.log('✅ 测试数据填充成功!');
}

/**
 * 创建一个活动及其关联的财务记录
 * @param plotId 地块ID
 * @param crop 作物
 * @param activityTypeId 活动类型ID
 * @param date 活动日期
 * @param plotArea 地块面积
 */
async function createActivity(plotId: number, crop: string, activityTypeId: number, date: Date, plotArea: number) {
  const activityTypeInDb = activityTypes.find(t => t.id === activityTypeId);
  if (!activityTypeInDb) return;

  // 查找与此活动类型关联的财务类型
  const relatedFinancialTypes = FINANCIAL_TYPES_CONFIG.filter(ft => ft.activityTypeName === activityTypeInDb.name);

  await prisma.activity.create({
    data: {
      plotId,
      crop,
      activityTypeId,
      date,
      records: {
        create: relatedFinancialTypes.map(ft => {
          const financialType = financialTypes.find(t => t.name === ft.name)!;
          return {
            recordTypeId: financialType.id,
            amount: calculateAmount(ft.category as 'income' | 'expense', plotArea),
            description: `${crop}的${ft.name}`,
            date: date,
          };
        }),
      },
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ 数据填充过程中发生错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
