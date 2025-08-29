'use client';

import React, { useEffect } from 'react';

interface AlertModalProps {
  title: string;
  body: string;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'alert';
}

const AlertModal: React.FC<AlertModalProps> = ({
  title,
  body,
  onClose,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  type = 'alert'
}) => {
  // 处理ESC键关闭模态框
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div 
      className="AlertModal--wrapper fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="AlertModal relative w-[416px] rounded-3xl bg-white p-8 shadow-[0_25px_50px_-12px_#00000040]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="AlertModal--content flex w-full flex-col justify-start">
            <h2 className="AlertModal--title mb-4 text-2xl font-bold text-slate-900">
              {title}
            </h2>
            <p className="AlertModal--body mb-6 text-base font-normal text-slate-700">
              {body}
            </p>
            
            <div className="flex w-full justify-end space-x-3">
              {type === 'confirm' && (
                <button
                  className="CancelButton flex h-10 cursor-pointer flex-row items-center justify-center rounded-lg border border-slate-400/50 bg-white/5 px-4 py-2 hover:bg-slate-300/25"
                  onClick={handleCancel}
                >
                  <span className="CancelButton--text text-sm font-bold text-slate-900">
                    {cancelText}
                  </span>
                </button>
              )}
              
              <button
                className="DeleteButton flex h-10 cursor-pointer flex-row items-center justify-center rounded-lg border-0 bg-gradient-to-b from-red-500 to-red-600 px-4 py-2 shadow-[inset_0_0_0_1px_#0000000d] hover:bg-gradient-to-b hover:from-red-400 hover:to-red-700"
                onClick={handleConfirm}
              >
                <span className="DeleteButton--text text-sm font-bold text-white">
                  {confirmText}
                </span>
              </button>
            </div>
          </div>
          
          <button 
            className="XButton absolute right-4 top-4 h-6 cursor-pointer text-slate-300 hover:text-slate-500"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;