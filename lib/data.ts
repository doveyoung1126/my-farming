import { connectDB } from './db';

const db = await connectDB();

// 获取首页统计数据
export async function getDashboardStats() {

  return Promise.all([
    // 总支出
    db.get<{ total: number }>(
      `SELECT SUM(amount) as total FROM expenses`
    ),
    // 总收入
    db.get<{ total: number }>(
      `SELECT SUM(amount) as total FROM income`
    ),
    // 当前作物数量（简化逻辑：统计不同作物）
    db.get<{ count: number }>(
      `SELECT COUNT(DISTINCT crop_name) as count 
       FROM planting_events 
       WHERE event_type != '采收'`
    )
  ]).then(([expenses, income, crops]) => ({
    totalSpent: expenses?.total || 0,
    totalEarned: income?.total || 0,
    currentCrops: crops?.count || 0
  }));
}

// 获取近期综合活动
export async function getRecentActivities(limit = 5) {

  return db.all(`
    SELECT 
      'event' as type,
      id,
      event_type as action,
      crop_name as subject,
      event_date as timestamp,
      NULL as amount
    FROM planting_events
    
    UNION ALL
    
    SELECT 
      'expense' as type,
      id,
      type as action,
      memo as subject,
      created_at as timestamp,
      amount
    FROM expenses
    
    UNION ALL
    
    SELECT 
      'income' as type,
      id,
      '销售' as action,
      buyer as subject,
      created_at as timestamp,
      amount
    FROM income
    
    ORDER BY timestamp DESC
    LIMIT ?
  `, limit);
}

// 获取财务统计摘要
export async function getFinancialSummary() {

  return Promise.all([
    db.get<{ total: number }>(`SELECT SUM(amount) as total FROM expenses`),
    db.get<{ total: number }>(`SELECT SUM(amount) as total FROM income`)
  ]).then(([expenses, income]) => ({
    totalExpenses: expenses?.total || 0,
    totalIncome: income?.total || 0,
    netProfit: (income?.total || 0) - (expenses?.total || 0)
  }));
}

// 获取财务记录（带关联信息）
export async function getFinancialRecords(
  type: 'all' | 'income' | 'expense' = 'all'
) {

  return db.all(`
    SELECT 
      'expense' as type,
      e.id,
      e.amount,
      e.created_at,
      e.memo,
      e.event_id,
      pe.crop_name,
      pe.event_type
    FROM expenses e
    LEFT JOIN planting_events pe ON e.event_id = pe.id
    ${type === 'income' ? 'WHERE 1=0' : ''} -- 当筛选收入时排除支出记录
    
    UNION ALL
    
    SELECT 
      'income' as type,
      i.id,
      i.amount,
      i.created_at,
      i.buyer as memo,
      i.event_id,
      pe.crop_name,
      pe.event_type  
    FROM income i
    LEFT JOIN planting_events pe ON i.event_id = pe.id
    ${type === 'expense' ? 'WHERE 1=0' : ''} -- 当筛选支出时排除收入记录
    
    ORDER BY created_at DESC
    LIMIT 100
  `);
}

// 获取地块
export async function getAllFields() {
  return db.all<{ id: number; name: string }[]>(`
    SELECT id, name FROM fields ORDER BY id DESC
  `);
}

// 获取农事活动
export async function getPlantingEventsWithFinance() {

  return db.all(`
    SELECT 
      pe.id,
      pe.field_id,
      pe.event_type,
      pe.crop_name,
      pe.event_date,
      pe.notes,
      f.name as field_name,
      COALESCE(SUM(e.amount), 0) as total_expense,
      COALESCE(SUM(i.amount), 0) as total_income,
      (COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0)) as net_value
    FROM planting_events pe
    LEFT JOIN fields f ON pe.field_id = f.id
    LEFT JOIN expenses e ON pe.id = e.event_id
    LEFT JOIN income i ON pe.id = i.event_id
    GROUP BY pe.id
    ORDER BY pe.event_date DESC 
  `);
}

// 获取所有地块以及当前农作物
export async function getFieldsWithCurrentCrop() {

  return db.all(`
    SELECT 
      f.id,
      f.name,
      f.area,
      (SELECT crop_name 
       FROM planting_events 
       WHERE field_id = f.id 
         AND event_type = '播种'
         AND id > COALESCE(
           (SELECT id 
            FROM planting_events 
            WHERE field_id = f.id 
              AND event_type = '采收'
            ORDER BY event_date DESC 
            LIMIT 1), 0)
       ORDER BY event_date DESC 
       LIMIT 1) as current_crop
    FROM fields f
    ORDER BY f.created_at DESC
  `);
}