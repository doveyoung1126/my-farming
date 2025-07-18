// prisma/seedTestData.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding test data...');

  // 清理旧数据
  await prisma.record.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.plot.deleteMany();
  await prisma.activityType.deleteMany();
  await prisma.recordCategoryType.deleteMany();
  console.log('Old data cleaned.');

  // 创建基础数据
  const plot1 = await prisma.plot.create({ data: { name: '一号大棚', area: 1.2 } });
  const plot2 = await prisma.plot.create({ data: { name: '二号大棚', area: 1.5, isArchived: true } });
  const plot3 = await prisma.plot.create({ data: { name: '南边那块地', area: 3.0 } });
  console.log('Plots created.');

  const sow = await prisma.activityType.create({ data: { name: '播种', cycleMarker: 'START' } });
  const harvest = await prisma.activityType.create({ data: { name: '采收', cycleMarker: 'END' } });
  const fertilize = await prisma.activityType.create({ data: { name: '施肥' } });
  const water = await prisma.activityType.create({ data: { name: '浇水' } });
  const weed = await prisma.activityType.create({ data: { name: '除草' } });
  console.log('Activity types created.');

  const seedCost = await prisma.recordCategoryType.create({ data: { name: '种子', category: 'expense' } });
  const fertilizerCost = await prisma.recordCategoryType.create({ data: { name: '肥料', category: 'expense' } });
  const laborCost = await prisma.recordCategoryType.create({ data: { name: '人工', category: 'expense' } });
  const sales = await prisma.recordCategoryType.create({ data: { name: '销售', category: 'income' } });
  console.log('Record category types created.');

  // --- 模拟周期 1: 地块1上的一个完整白菜周期 ---
  console.log('Seeding Cycle 1: Completed Cabbage Cycle on Plot 1...');
  const cycle1_start_date = new Date('2024-03-01T10:00:00Z');
  const cycle1_end_date = new Date('2024-05-15T14:00:00Z');

  const cycle1 = await prisma.cycle.create({
    data: {
      plotId: plot1.id,
      crop: '大白菜',
      budget: 2000,
      startDate: cycle1_start_date,
      endDate: cycle1_end_date,
      status: 'completed',
    },
  });

  const c1_a1 = await createActivity(plot1.id, sow.id, cycle1.id, '大白菜', cycle1_start_date, [{ typeId: seedCost.id, amount: -500, desc: '购买白菜种子' }]);
  const c1_a2 = await createActivity(plot1.id, fertilize.id, cycle1.id, '大白菜', new Date('2024-03-20T09:00:00Z'), [{ typeId: fertilizerCost.id, amount: -300, desc: '基肥' }]);
  const c1_a3 = await createActivity(plot1.id, water.id, cycle1.id, '大白菜', new Date('2024-04-10T11:00:00Z'));
  const c1_a4 = await createActivity(plot1.id, harvest.id, cycle1.id, '大白菜', cycle1_end_date, [{ typeId: sales.id, amount: 4500, desc: '售出500kg' }, { typeId: laborCost.id, amount: -800, desc: '采收人工费' }]);

  await prisma.cycle.update({ where: { id: cycle1.id }, data: { startActivityId: c1_a1.id, endActivityId: c1_a4.id } });
  await prisma.plot.update({ where: { id: plot1.id }, data: { crop: null } }); // 周期结束，地块作物清空
  console.log('Cycle 1 seeded.');


  // --- 模拟周期 2: 地块1上的一个正在进行中的番茄周期 ---
  console.log('Seeding Cycle 2: Ongoing Tomato Cycle on Plot 1...');
  const cycle2_start_date = new Date('2024-06-01T09:00:00Z');

  const cycle2 = await prisma.cycle.create({
    data: {
      plotId: plot1.id,
      crop: '番茄',
      budget: 3000,
      startDate: cycle2_start_date,
      status: 'ongoing',
    },
  });

  const c2_a1 = await createActivity(plot1.id, sow.id, cycle2.id, '番茄', cycle2_start_date, [{ typeId: seedCost.id, amount: -800, desc: '购买番茄苗' }]);
  const c2_a2 = await createActivity(plot1.id, weed.id, cycle2.id, '番茄', new Date('2024-06-20T15:00:00Z'), [{ typeId: laborCost.id, amount: -400, desc: '除草人工' }]);

  await prisma.cycle.update({ where: { id: cycle2.id }, data: { startActivityId: c2_a1.id } });
  await prisma.plot.update({ where: { id: plot1.id }, data: { crop: '番茄' } }); // 周期开始，更新地块作物
  console.log('Cycle 2 seeded.');


  // --- 模拟周期 3: 地块3上的一个被中止的黄瓜周期 ---
  console.log('Seeding Cycle 3: Aborted Cucumber Cycle on Plot 3...');
  const cycle3_start_date = new Date('2024-04-01T10:00:00Z');
  const cycle3_abort_date = new Date('2024-05-05T11:00:00Z'); // 下一个周��的开始日期

  const cycle3 = await prisma.cycle.create({
    data: {
      plotId: plot3.id,
      crop: '黄瓜',
      budget: 1500,
      startDate: cycle3_start_date,
      endDate: cycle3_abort_date,
      status: 'aborted',
    },
  });

  const c3_a1 = await createActivity(plot3.id, sow.id, cycle3.id, '黄瓜', cycle3_start_date, [{ typeId: seedCost.id, amount: -400, desc: '购买黄瓜种子' }]);
  const c3_a2 = await createActivity(plot3.id, water.id, cycle3.id, '黄瓜', new Date('2024-04-15T14:00:00Z'));
  
  // 模拟下一个周期的开始活动，它导致了前一个周期的中止
  const cycle4_start_activity = await createActivity(plot3.id, sow.id, null, '辣椒', cycle3_abort_date); // 这个活动暂时不属于任何周期

  await prisma.cycle.update({ where: { id: cycle3.id }, data: { startActivityId: c3_a1.id } });
  // 注意：中止的周期可能不会清空地块作物，因为新的作物立即就种下了
  console.log('Cycle 3 seeded.');


  console.log('Test data seeding finished.');
}

// 辅助函数，用于创建活动及其关联的财务记录
async function createActivity(
  plotId: number,
  typeId: number,
  cycleId: number | null,
  crop: string,
  date: Date,
  records: { typeId: number; amount: number; desc?: string }[] = []
) {
  const activity = await prisma.activity.create({
    data: {
      plotId,
      activityTypeId: typeId,
      cycleId,
      crop,
      date,
      records: {
        create: records.map(r => ({
          recordTypeId: r.typeId,
          amount: r.amount,
          description: r.desc,
          date: date, // 财务记录日期默认为活动日期
        })),
      },
    },
  });
  return activity;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });