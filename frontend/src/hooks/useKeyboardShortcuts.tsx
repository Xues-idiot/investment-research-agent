'use client';

// useKeyboardShortcuts - 全局快捷键Hook

import { useEffect, useCallback } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Skip if user is typing in an input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Shortcut display component
export function ShortcutHint({ shortcuts }: { shortcuts: Shortcut[] }) {
  if (shortcuts.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
      {shortcuts.map((s, i) => (
        <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-background-600/50 rounded border border-background-400/50">
          {s.ctrl && <kbd className="px-1.5 py-0.5 bg-background-500 rounded text-gray-300 font-mono text-[10px]">Ctrl</kbd>}
          {s.shift && <kbd className="px-1.5 py-0.5 bg-background-500 rounded text-gray-300 font-mono text-[10px]">Shift</kbd>}
          {s.alt && <kbd className="px-1.5 py-0.5 bg-background-500 rounded text-gray-300 font-mono text-[10px]">Alt</kbd>}
          <kbd className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded font-mono text-[10px]">{s.key.toUpperCase()}</kbd>
          <span className="text-gray-400">{s.description}</span>
        </span>
      ))}
    </div>
  );
}
