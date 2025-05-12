PRAGMA foreign_keys = ON;

-- 农田地块表
CREATE TABLE IF NOT EXISTS fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE CHECK(length(name) <= 20),
  area REAL CHECK(area > 0),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 农事活动表
CREATE TABLE IF NOT EXISTS planting_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK(event_type IN ('播种', '施肥', '灌溉', '采收', '其他')),
  crop_name TEXT NOT NULL CHECK(length(crop_name) <= 15),
  quantity REAL CHECK(quantity > 0),
  event_date INTEGER NOT NULL,
  notes TEXT CHECK(length(notes) <= 100)
);

-- 支出记录表
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('种子', '农药', '化肥', '农机', '人工', '其他')),
  amount REAL NOT NULL CHECK(amount > 0),
  event_id INTEGER REFERENCES planting_events(id) ON DELETE SET NULL,
  field_id INTEGER REFERENCES fields(id) ON DELETE SET NULL,
  memo TEXT CHECK(length(memo) <= 50),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 收入记录表
CREATE TABLE IF NOT EXISTS income (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER REFERENCES planting_events(id) ON DELETE SET NULL,
  field_id INTEGER REFERENCES fields(id) ON DELETE SET NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  buyer TEXT CHECK(length(buyer) <= 20),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

/**************** 测试数据 ****************/
INSERT INTO fields (name, area) VALUES
  ('东区玉米地', 8.5),
  ('西区小麦田', 12.3);

INSERT INTO planting_events (field_id, event_type, crop_name, quantity, event_date) VALUES
  (1, '播种', '玉米', 8.5, strftime('%s', '2024-03-15')),
  (2, '施肥', '小麦', 12.3, strftime('%s', '2024-04-01')),
  (1, '采收', '玉米', 6500, strftime('%s', '2024-05-10'));

INSERT INTO expenses (type, amount, event_id, field_id, memo) VALUES
  ('种子', 4200, 1, 1, '先锋玉米种'),
  ('化肥', 3800, 2, 2, '复合肥春季用'),
  ('农机', 1500, NULL, NULL, '拖拉机租赁');

INSERT INTO income (event_id, amount, buyer) VALUES
  (3, 18500, '粮油收购站'),
  (NULL, 3200, '散客采购');