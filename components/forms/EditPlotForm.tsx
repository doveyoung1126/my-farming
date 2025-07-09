// components/forms/EditPlotForm.tsx
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PrismaPlots } from '@/lib/types';

export interface EditPlotPayload {
    name: string;
    area: number;
    crop: string | null;
}

interface EditPlotFormProps {
    plot: PrismaPlots;
    onSubmit: (data: EditPlotPayload) => void;
    onCancel: () => void;
    isLoading: boolean;
    error: string | null;
}

export function EditPlotForm({ plot, onSubmit, onCancel, isLoading, error }: EditPlotFormProps) {
    const [name, setName] = useState(plot.name);
    const [area, setArea] = useState(plot.area.toString());
    const [crop, setCrop] = useState(plot.crop || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: name,
            area: parseFloat(area),
            crop: crop || null,
        });
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
                />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                >
                    取消
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    保存更改
                </button>
            </div>
        </form>
    );
}
