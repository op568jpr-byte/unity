import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- GLOBAL STORAGE PROTECTION SHIELD ---
try {
  const testKey = '__storage_test__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
} catch (e) {
  console.warn("localStorage access is restricted (e.g., file:// protocol). Polyfilling with safe in-memory store.");
  
  const memoryStore: Record<string, string> = {};
  const localStoragePolyfill = {
    getItem: (key: string): string | null => {
      if ((window as any).MEMORY_STORE && (window as any).MEMORY_STORE[key] !== undefined) {
        const val = (window as any).MEMORY_STORE[key];
        return typeof val === 'object' ? JSON.stringify(val) : String(val);
      }
      return memoryStore[key] !== undefined ? memoryStore[key] : null;
    },
    setItem: (key: string, value: string): void => {
      memoryStore[key] = String(value);
    },
    removeItem: (key: string): void => {
      delete memoryStore[key];
    },
    clear: (): void => {
      for (const key in memoryStore) {
        delete memoryStore[key];
      }
    },
    key: (index: number): string | null => {
      return Object.keys(memoryStore)[index] || null;
    },
    get length(): number {
      return Object.keys(memoryStore).length;
    }
  };

  try {
    Object.defineProperty(window, 'localStorage', {
      value: localStoragePolyfill,
      writable: true,
      configurable: true
    });
  } catch (err) {
    console.error("Critical: Failed to override localStorage descriptor:", err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
