// components/ActivitiesList.tsx
'use client';

import { useState } from 'react';

export default function ActivitiesList({
    initialEvents,
    fields
}: {
    initialEvents: any[];
    fields: {
        id: number,
        name: string,
        area: number,
        current_crop: string
    }[]
}) {
    const [selectedField, setSelectedField] = useState<number | 'all'>('all');

    // 客户端过滤逻辑
    const filteredEvents = initialEvents.filter(event =>
        selectedField === 'all' ? true : event.field_id === selectedField
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <p className="text-xl font-bold mb-4">时间线</p>

            {/* 地块筛选下拉框 */}
            <div className="mb-4">
                <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(
                        e.target.value === 'all' ? 'all' : Number(e.target.value)
                    )}
                    className="w-full p-2 border rounded-lg bg-white"
                >
                    <option value="all">所有地块</option>
                    {fields.map(field => (
                        <option key={field.id} value={field.id}>
                            {field.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 时间轴列表 */}
            <div className="space-y-4">
                {filteredEvents.map(event => (
                    <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                        {/* 头部信息 */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="font-medium">
                                    {event.field_name} ·
                                    <span className="text-green-600 ml-1">{event.crop_name}</span>
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {event.event_type} ·
                                    {new Date(event.event_date * 1000).toLocaleDateString('zh-CN')}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg ${event.net_value >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {event.net_value >= 0 ? "¥" : "-¥"}
                                    {Math.abs(event.net_value).toLocaleString()}
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                    {event.net_value >= 0 ? '收益' : '成本'}
                                </p>
                            </div>
                        </div>

                        {/* 财务关联区块 */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">支出：</span>
                                ¥{event.total_expense.toLocaleString()}
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">收入：</span>
                                ¥{event.total_income.toLocaleString()}
                            </div>
                        </div>

                        {/* 备注信息 */}
                        {event.memo && (
                            <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                📝 {event.memo}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}