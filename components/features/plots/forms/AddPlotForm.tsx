// components/forms/AddPlotForm.tsx
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AddPlotFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddPlotForm({ onSuccess, onCancel }: AddPlotFormProps) {
    const [name, setName] = useState('');
    const [area, setArea] = useState('');
    const [crop, setCrop] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                name: name,
                area: parseFloat(area),
                crop: crop || null,
            };

            const response = await fetch('/api/plots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '提交失败');
            }

            onSuccess(); // 调用成功回调
        } catch (err: any) {
            setError(err.message || '发生未知错误');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">地块名称 <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：西红柿地块"
                    required
                />
            </div>

            <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700">面积 (亩) <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：1.5"
                    step="0.1"
                    required
                />
            </div>

            <div>
                <label htmlFor="crop" className="block text-sm font-medium text-gray-700">当前作物 (可选)</label>
                <input
                    type="text"
                    id="crop"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：西红柿"
                />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    取消
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    保存地块
                </button>
            </div>
        </form>
    );
}