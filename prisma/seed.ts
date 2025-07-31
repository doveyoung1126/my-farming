// prisma/seed.ts
import { PrismaClient, CycleMarker, RecordCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Define the core data that the application needs to function.
const activityTypes = [
  { name: '播种', cycleMarker: CycleMarker.START },
  { name: '采收', cycleMarker: CycleMarker.END },
  { name: '施肥', cycleMarker: null },
  { name: '浇水', cycleMarker: null },
  { name: '除草', cycleMarker: null },
  { name: '喷药', cycleMarker: null },
  { name: '整地', cycleMarker: null },
];

const recordCategoryTypes = [
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

async function main() {
  console.log('Start seeding for production...');

  // Seed Activity Types
  for (const type of activityTypes) {
    await prisma.activityType.upsert({
      where: { name: type.name },
      update: {}, // No fields to update if it exists
      create: {
        name: type.name,
        cycleMarker: type.cycleMarker,
      },
    });
  }
  console.log('Activity types seeded.');

  // Seed Record Category Types
  for (const type of recordCategoryTypes) {
    await prisma.recordCategoryType.upsert({
      where: { name: type.name },
      update: {}, // No fields to update if it exists
      create: {
        name: type.name,
        category: type.category,
      },
    });
  }
  console.log('Record category types seeded.');

  // Check if any plots exist before seeding a default one.
  console.log('Checking for existing plots...');
  const plotCount = await prisma.plot.count();

  if (plotCount === 0) {
    console.log('No plots found. Seeding a default plot...');
    await prisma.plot.create({
      data: {
        name: '默认地块',
        area: 40,
      },
    });
    console.log('Default plot created.');
  } else {
    console.log('Plots already exist, skipping default plot creation.');
  }

  console.log('Production seeding finished.');
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
