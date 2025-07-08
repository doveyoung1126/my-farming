// components/common/ActionModal.tsx
'use client';

import { X, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddActivityForm } from '@/components/forms/AddActivityForm';
import { AddFinancialRecordForm } from '@/components/forms/AddFinancialRecordForm'; // 导入新的表单组件
import { ActivityType, PrismaPlots, RecordCategoryType } from '@/lib/types';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityTypes: ActivityType[];
    plots: PrismaPlots[];
    recordCategoryTypes: RecordCategoryType[];
    routerRefresh: () => void; // 新增 prop
}

type CurrentForm = 'select' | 'addActivity' | 'addFinancial' | 'addPlot';

export function ActionModal({ isOpen, onClose, activityTypes, plots, recordCategoryTypes, routerRefresh }: ActionModalProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [currentForm, setCurrentForm] = useState<CurrentForm>('select');

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setCurrentForm('select'); // 关闭时重置表单选择
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSelectAction = (action: CurrentForm) => {
        setCurrentForm(action);
    };

    const handleFormSuccess = () => {
        onClose(); // 表单提交成功后关闭模态框
        routerRefresh(); // 调用刷新函数
    };

    const handleFormCancel = () => {
        setCurrentForm('select'); // 返回到选择菜单
    };

    if (!shouldRender) return null;

    const getTitle = () => {
        switch (currentForm) {
            case 'select': return '选择操作';
            case 'addActivity': return '添加农事活动';
            case 'addFinancial': return '添加财务记录';
            case 'addPlot': return '添加地块';
            default: return '操作';
        }
    };

    return (
        <div
            className={`
                fixed inset-0 z-50 flex items-end justify-center
                transition-opacity duration-300 ease-out
                ${isVisible ? 'opacity-100 bg-gray-900/75' : 'opacity-0 pointer-events-none'}
            `}
            onClick={onClose}
        >
            <div
                className={`
                    bg-white rounded-t-xl w-full max-w-md p-4 shadow-lg
                    transform transition-transform duration-300 ease-out
                    ${isVisible ? 'translate-y-0' : 'translate-y-full'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    {currentForm !== 'select' && (
                        <button onClick={handleFormCancel} className="p-2 rounded-full hover:bg-gray-100">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-800 flex-grow text-center">{getTitle()}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {currentForm === 'select' && (
                    <div className="space-y-3">
                        <button 
                            onClick={() => handleSelectAction('addActivity')}
                            className="w-full text-left p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors"
                        >
                            添加农事活动
                        </button>
                        <button 
                            onClick={() => handleSelectAction('addFinancial')}
                            className="w-full text-left p-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium transition-colors"
                        >
                            添加财务记录
                        </button>
                        <button 
                            onClick={() => handleSelectAction('addPlot')}
                            className="w-full text-left p-4 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium transition-colors"
                        >
                            添加地块
                        </button>
                    </div>
                )}

                {currentForm === 'addActivity' && (
                    <AddActivityForm 
                        activityTypes={activityTypes} 
                        plots={plots} 
                        recordCategoryTypes={recordCategoryTypes} 
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                )}

                {currentForm === 'addFinancial' && (
                    <AddFinancialRecordForm 
                        recordCategoryTypes={recordCategoryTypes} 
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                )}

                {/* TODO: AddFinancialForm and AddPlotForm */}
            </div>
        </div>
    );
}