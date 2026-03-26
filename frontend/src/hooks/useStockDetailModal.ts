'use client';

import { useState, useCallback } from 'react';

interface StockDetailState {
  isOpen: boolean;
  stockCode: string;
  companyName: string;
}

export function useStockDetailModal() {
  const [state, setState] = useState<StockDetailState>({
    isOpen: false,
    stockCode: '',
    companyName: '',
  });

  const openModal = useCallback((stockCode: string, companyName: string) => {
    setState({ isOpen: true, stockCode, companyName });
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    isOpen: state.isOpen,
    stockCode: state.stockCode,
    companyName: state.companyName,
    openModal,
    closeModal,
  };
}
