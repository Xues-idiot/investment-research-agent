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
    <div className="min-h-screen bg-background-500">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">⭐ 我的收藏</h1>
          <p className="text-gray-400">管理您关注的股票，快速访问研究页面</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-background-600 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-gray-400 text-sm">收藏数量</span>
              <p className="text-2xl font-bold text-white">{favorites.length}</p>
            </div>
            <div className="text-right">
              <Link
                href="/research"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                + 添加股票
              </Link>
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
            <div className="bg-background-600 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">📌</div>
              <h3 className="text-xl font-medium text-white mb-2">暂无收藏</h3>
              <p className="text-gray-400 mb-4">在研究页面点击星标添加收藏</p>
              <Link
                href="/research"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
                className="bg-background-600 rounded-lg p-4 flex items-center justify-between hover:bg-background-500 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {stock.code.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{stock.name}</h3>
                      <span className="text-gray-500 text-sm">{stock.code}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      添加于 {formatDate(stock.addedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/research?code=${stock.code}`}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-colors text-sm"
                  >
                    研究
                  </Link>
                  <Link
                    href={`/compare?codes=${stock.code}`}
                    className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors text-sm"
                  >
                    对比
                  </Link>
                  <button
                    onClick={() => removeFavorite(stock.code)}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors text-sm"
                  >
                    移除
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
