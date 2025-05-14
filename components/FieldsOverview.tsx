// components/FieldsOverview.tsx
'use client';

export default function FieldsOverview({ fields }: {
    fields: {
        id: number,
        name: string,
        area: number,
        current_crop: string
    }[]
}) {
    return (
        <div className="p-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map(field => (
                    <div
                        key={field.id}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-medium">{field.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {field.area}亩
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-sm ${field.current_crop
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {field.current_crop || '空闲'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}