// prisma/seedTestData.ts
import { PrismaClient, CycleMarker, RecordCategory } from '@prisma/client';

const prisma = new PrismaClient();

// --- HELPERS ---
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

// --- DATA POOLS ---
const PLOT_NAMES = ['一号大棚', '西边那块地', '南坡试验田', '育苗基地', '果园南区', '水稻试验田', '蔬菜区A'];
const CROP_NAMES = ['大白菜', '番茄', '黄瓜', '草莓', '辣椒', '蓝莓', '西瓜', '生菜'];

async function main() {
  console.log('Start seeding test data...');

  // 1. CLEANUP: Clear all previous data
  console.log('Cleaning old data...');
  await prisma.record.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.plot.deleteMany();
  await prisma.activityType.deleteMany();
  await prisma.recordCategoryType.deleteMany();

  // 2. SEED CORE TYPES: Create the essential types first
  console.log('Seeding core data types...');
  const activityTypesData = [
    { name: '播种', cycleMarker: CycleMarker.START },
    { name: '采收', cycleMarker: CycleMarker.END },
    { name: '施肥', cycleMarker: null },
    { name: '浇水', cycleMarker: null },
    { name: '除草', cycleMarker: null },
    { name: '喷药', cycleMarker: null },
    { name: '整地', cycleMarker: CycleMarker.START },
  ];
  const recordCategoriesData = [
    { name: '种子', category: RecordCategory.expense },
    { name: '肥料', category: RecordCategory.expense },
    { name: '农药', category: RecordCategory.expense },
    { name: '人工', category: RecordCategory.expense },
    { name: '机械', category: RecordCategory.expense },
    { name: '其他支出', category: RecordCategory.expense },
    { name: '销售', category: RecordCategory.income },
    { name: '补贴', category: RecordCategory.income },
    { name: '其他收入', category: RecordCategory.income },
  ];

  await prisma.activityType.createMany({ data: activityTypesData });
  await prisma.recordCategoryType.createMany({ data: recordCategoriesData });

  const activityTypes = await prisma.activityType.findMany();
  const recordCategoryTypes = await prisma.recordCategoryType.findMany();

  const sowType = activityTypes.find(t => t.name === '播种')!;
  const harvestType = activityTypes.find(t => t.name === '采收')!;
  const otherActivityTypes = activityTypes.filter(t => t.cycleMarker === null);

  const expenseCategories = recordCategoryTypes.filter(t => t.category === 'expense');
  const incomeCategories = recordCategoryTypes.filter(t => t.category === 'income');

  // 3. SEED PLOTS: Create a variety of plots
  console.log('Seeding plots...');
  const plots = [];
  for (let i = 0; i < 5; i++) {
    const plot = await prisma.plot.create({
      data: {
        name: `${getRandomElement(PLOT_NAMES)} #${i + 1}`,
        area: getRandomInt(10, 50) / 10, // 1.0 to 5.0 acres
        isArchived: Math.random() > 0.8, // 20% chance of being archived
      },
    });
    plots.push(plot);
  }

  // 4. SEED CYCLES & ACTIVITIES: For each plot, create realistic cycles
  console.log('Seeding cycles and activities...');
  for (const plot of plots) {
    // Create 1-2 completed cycles
    for (let i = 0; i < getRandomInt(1, 2); i++) {
      const crop = getRandomElement(CROP_NAMES);
      const cycleDuration = getRandomInt(60, 120);
      const cycleEndDate = subDays(new Date(), (i * 150) + 90);
      const cycleStartDate = subDays(cycleEndDate, cycleDuration);

      const cycle = await prisma.cycle.create({
        data: {
          plotId: plot.id,
          crop,
          budget: getRandomInt(20, 50) * 100,
          startDate: cycleStartDate,
          endDate: cycleEndDate,
          status: 'completed',
        },
      });

      // Add activities for the completed cycle
      const startActivity = await createActivity(plot.id, sowType.id, cycle.id, crop, cycleStartDate, [{ typeId: getRandomElement(expenseCategories).id, amount: -getRandomInt(200, 500) }]);
      const endActivity = await createActivity(plot.id, harvestType.id, cycle.id, crop, cycleEndDate, [{ typeId: getRandomElement(incomeCategories).id, amount: getRandomInt(3000, 8000) }]);

      for (let j = 0; j < getRandomInt(5, 15); j++) {
        await createActivity(plot.id, getRandomElement(otherActivityTypes).id, cycle.id, crop, getRandomDate(cycleStartDate, cycleEndDate), [{ typeId: getRandomElement(expenseCategories).id, amount: -getRandomInt(50, 200) }]);
      }

      await prisma.cycle.update({ where: { id: cycle.id }, data: { startActivityId: startActivity.id, endActivityId: endActivity.id } });
    }

    // Create 1 ongoing cycle for non-archived plots
    if (!plot.isArchived) {
      const crop = getRandomElement(CROP_NAMES);
      const cycleStartDate = subDays(new Date(), getRandomInt(15, 45));

      const cycle = await prisma.cycle.create({
        data: {
          plotId: plot.id,
          crop,
          budget: getRandomInt(20, 50) * 100,
          startDate: cycleStartDate,
          status: 'ongoing',
        },
      });

      await prisma.plot.update({ where: { id: plot.id }, data: { crop } });

      const startActivity = await createActivity(plot.id, sowType.id, cycle.id, crop, cycleStartDate, [{ typeId: getRandomElement(expenseCategories).id, amount: -getRandomInt(200, 500) }]);
      await prisma.cycle.update({ where: { id: cycle.id }, data: { startActivityId: startActivity.id } });

      for (let j = 0; j < getRandomInt(3, 8); j++) {
        await createActivity(plot.id, getRandomElement(otherActivityTypes).id, cycle.id, crop, getRandomDate(cycleStartDate, new Date()), [{ typeId: getRandomElement(expenseCategories).id, amount: -getRandomInt(50, 200) }]);
      }
    }
  }

  console.log('Test data seeding finished successfully.');
}

// --- DB HELPER FUNCTION ---
async function createActivity(
  plotId: number,
  typeId: number,
  cycleId: number,
  crop: string,
  date: Date,
  records: { typeId: number; amount: number; desc?: string }[] = []
) {
  return prisma.activity.create({
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
          description: r.desc || '',
          date: date,
        })),
      },
    },
  });
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
