import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function connectDB() {
    return open({
        filename: './farm.db', // 确保路径正确
        driver: sqlite3.Database,
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
    });
}

// 启用外键约束
async function initDB() {
    const db = await connectDB();
    await db.run('PRAGMA foreign_keys = ON;');
}
initDB();