// 测试
import { connectDB } from '@/lib/db';

export async function GET() {
    const db = await connectDB();
    const fields = await db.all('SELECT * FROM fields');
    return Response.json(fields);
}