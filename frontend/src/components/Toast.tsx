'use client';

// Toast - 轻量级通知组件

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const iconMap = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const colorMap = {
  success: 'bg-green-500/90 border-green-400',
  error: 'bg-red-500/90 border-red-400',
  info: 'bg-blue-500/90 border-blue-400',
  warning: 'bg-yellow-500/90 border-yellow-400',
};

const iconColorMap = {
  success: 'text-green-200',
  error: 'text-red-200',
  info: 'text-blue-200',
  warning: 'text-yellow-200',
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${colorMap[toast.type]} backdrop-blur-sm rounded-lg border p-4 shadow-lg min-w-[300px] max-w-[400px]`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-xl ${iconColorMap[toast.type]}`}>{iconMap[toast.type]}</span>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-white/80 text-xs mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Toast Hook
const toastListeners: Array<(toast: ToastMessage) => void> = [];

export function toast(options: Omit<ToastMessage, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: ToastMessage = { ...options, id };
  toastListeners.forEach(listener => listener(newToast));
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts(prev => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      const index = toastListeners.indexOf(addToast);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, [addToast]);

  return { toasts, removeToast };
}