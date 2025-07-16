'use server';

import { revalidatePath } from 'next/cache';

// 定义我们期望从表单接收的数据的类型
interface PlotUpdatePayload {
  name: string;
  crop?: string;
  area: number;
}

interface RecordUpdatePayload {
  amount: number,
  recordTypeId: number,
  date: Date,
  description: string
}

/**
 * 更新地块信息的 Server Action
 * @param formData 从表单自动接收的数据
 */
export async function updatePlotAction(formData: FormData) {
  const plotId = formData.get('plotId');

  // 1. 数据校验
  if (!plotId) {
    return { error: '地块 ID 缺失，无法更新。' };
  }

  // 2. 从 formData 中提取并构建 payload
  const payload: PlotUpdatePayload = {
    name: formData.get('name') as string,
    crop: formData.get('crop') as string,
    area: parseFloat(formData.get('area') as string),
  };

  try {
    // 3. 调用已有的 API 端点
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiBaseUrl}/api/plots/${plotId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新地块失败。');
    }

    // 4. 成功后，重新验证缓存并让页面刷新数据
    revalidatePath('/plots');
    revalidatePath(`/plots/${plotId}`);

    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * 更新农事活动及其关联的财务记录的 Server Action
 * @param payload 包含活动和记录数据的对象, 从客户端组件传来
 */
export async function updateActivityWithRecordsAction(payload: any) {
  const { id } = payload;

  if (!id) {
    return { error: '农事活动 ID 缺失，无法更新。' };
  }

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiBaseUrl}/api/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新农事活动失败。');
    }

    revalidatePath('/reports');
    if (payload.plotId) {
      revalidatePath(`/cycles/${payload.plotId}`);
    }

    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}


/**
 * 更新财务记录的 Server Action
 */
export async function updateFinancialRecordAction(formData: FormData) {
  const recordId = formData.get('recordId');
  if (!recordId) {
    return { error: '财务记录 ID 缺失，无法更新。' };
  }

  // const dateString = formData.get('date') as string;
  // const timeString = formData.get('time') as string || '00:00:00.000Z'; // 从隐藏字段获取时间，提供默认值以防万一

  // const date = new Date(`${dateString}T${timeString}`);
  const date = new Date(formData.get('isoDate') as string)
  console.log('serverDate', date)
  const payload: RecordUpdatePayload = {
    date: date,
    amount: parseFloat(formData.get('amount') as string),
    recordTypeId: parseInt(formData.get('recordCategoryId') as string),
    description: formData.get('description') as string,
  };

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiBaseUrl}/api/records/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新财务记录失败。');
    }

    revalidatePath('/reports');

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
