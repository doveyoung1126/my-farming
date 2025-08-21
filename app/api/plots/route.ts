// app/api/plots/route.ts
import { NextResponse } from 'next/server';
import { createPlotAction } from '@/lib/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 将 JSON body 转换为 FormData
    const formData = new FormData();
    for (const key in body) {
      if (body[key] !== null && body[key] !== undefined) {
        formData.append(key, body[key].toString());
      }
    }

    // 调用 Server Action
    const result = await createPlotAction(null, formData);

    if (result.success) {
      // 注意：Action 内部已经处理了 revalidation，API 层面通常不需要再次处理
      // 但如果需要返回创建的对象，我们需要修改 Action 或在这里重新查询
      // 为简单起见，我们只返回成功信息
      return NextResponse.json({ message: '地块创建成功' }, { status: 201 });
    } else {
      // 根据 Action 返回的错误信息，决定状态码
      const statusCode = result.error?.includes('已存在') ? 409 : 400;
      return NextResponse.json({ message: result.error }, { status: statusCode });
    }

  } catch (error) {
    console.error('API 调用 createPlotAction 失败:', error);
    const errorMessage = error instanceof Error ? error.message : '发生未知错误';
    return NextResponse.json({ message: '创建地块失败', error: errorMessage }, { status: 500 });
  }
}
