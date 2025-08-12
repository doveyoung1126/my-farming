// components/features/plots/forms/AddPlotForm.tsx
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPlotAction } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

interface AddPlotFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const initialState = {
    error: null,
    success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
            disabled={pending}
        >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            保存地块
        </button>
    );
}

export function AddPlotForm({ onSuccess, onCancel }: AddPlotFormProps) {
    const [state, formAction] = useActionState(createPlotAction, initialState);

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-4 p-4">
            {state.error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{state.error}</div>}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">地块名称 <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：西红柿地块"
                    required
                />
            </div>

            <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700">面积 (亩) <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    inputMode='decimal'
                    id="area"
                    name="area"
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
                    name="crop"
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
                <SubmitButton />
            </div>
        </form>
    );
}
