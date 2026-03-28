'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFavorites, FavoriteStock } from '@/hooks/useFavorites';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-terminal-900">
      <div className="fixed inset-0 bg-mesh pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-3">
                <span>⭐</span>
                <span>我的收藏</span>
              </div>
              <h1 className="text-4xl font-display font-bold text-content-primary mb-2">我的收藏</h1>
              <p className="text-content-muted">管理您关注的股票，快速访问研究页面</p>
            </div>
            <Link
              href="/research"
              className="btn btn-primary px-5 py-2.5 shadow-glow"
            >
              <span>+</span>
              <span>添加股票</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="text-2xl">📌</span>
              </div>
              <div>
                <span className="text-content-muted text-sm">收藏数量</span>
                <p className="text-2xl font-display font-bold text-content-primary tabular-nums">{favorites.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-brand">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mr-1"></span>
                活跃
              </span>
            </div>
          </div>
        </motion.div>

        {/* Favorites List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {favorites.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-yellow-500/10 flex items-center justify-center text-5xl mx-auto mb-6">
                📌
              </div>
              <h3 className="text-2xl font-display font-semibold text-content-primary mb-2">暂无收藏</h3>
              <p className="text-content-muted mb-6 max-w-sm mx-auto">
                在研究页面点击星标添加收藏，快速访问您关注的股票
              </p>
              <Link
                href="/research"
                className="btn btn-primary px-6 py-3 shadow-glow"
              >
                开始研究
              </Link>
            </div>
          ) : (
            favorites.map((stock: FavoriteStock, index: number) => (
              <motion.div
                key={stock.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-4 flex items-center justify-between hover:border-border-default transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/20 border border-brand-500/30 flex items-center justify-center text-content-primary font-bold text-lg font-mono tabular-nums">
                    {stock.code.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-content-primary font-medium">{stock.name}</h3>
                      <span className="badge text-xs">{stock.code}</span>
                    </div>
                    <p className="text-content-muted text-xs">
                      添加于 {formatDate(stock.addedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/research?code=${stock.code}`}
                    className="btn btn-secondary px-4 py-2 text-sm"
                  >
                    <span>📊</span>
                    <span>研究</span>
                  </Link>
                  <Link
                    href={`/compare?codes=${stock.code}`}
                    className="btn btn-secondary px-4 py-2 text-sm"
                  >
                    <span>📈</span>
                    <span>对比</span>
                  </Link>
                  <button
                    onClick={() => removeFavorite(stock.code)}
                    className="btn px-4 py-2 text-sm bg-loss/10 text-loss border border-loss/20 hover:bg-loss hover:text-white hover:border-loss"
                  >
                    <span>×</span>
                    <span>移除</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
