// components/FilterTabs.tsx
'use client';

export default function FilterTabs({
    currentFilter,
    onFilterChange
}: {
    currentFilter: 'all' | 'income' | 'expense';
    onFilterChange: (type: 'all' | 'income' | 'expense') => void;
}) {
    return (
        <div className="px-4 flex gap-2 border-b">
            {[
                { value: 'all', label: '全部' },
                { value: 'income', label: '收入' },
                { value: 'expense', label: '支出' }
            ].map((option) => (
                <button
                    key={option.value}
                    onClick={() => onFilterChange(option.value as any)}
                    className={`px-4 py-2 rounded-t-lg text-sm transition-colors ${currentFilter === option.value
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}