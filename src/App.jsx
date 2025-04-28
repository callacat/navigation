import React, { useState, useEffect } from 'react';
import './App.css'; // 保留原有的 App.css 引入

function App() {
  // 定义主题状态，初始值从 localStorage 读取或默认为 'system'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // 如果 localStorage 中没有，则根据系统偏好设置初始主题
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // 使用 useEffect 来监听主题状态变化并更新 <html> 元素的类
  useEffect(() => {
    const root = document.documentElement; // 获取 <html> 元素
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else { // theme === 'system'
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      // 根据当前系统主题设置初始类
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // 添加监听器
      mediaQuery.addEventListener('change', handleChange);

      // 清理函数：移除监听器
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // 将当前主题保存到 localStorage
    localStorage.setItem('theme', theme);

  }, [theme]); // 依赖项为 theme 状态，只有当 theme 变化时才重新运行 effect

  // 处理主题切换的函数
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    // 在主容器中使用 Tailwind 类来设置背景和文本颜色，并根据主题变化
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-3xl font-bold underline text-blue-600 dark:text-blue-400">
        Hello, Navigation Site!
      </h1>

      {/* 主题切换按钮示例 */}
      <div className="mt-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          onClick={() => handleThemeChange('light')}
        >
          浅色模式
        </button>
        <button
           className={`mr-2 px-4 py-2 rounded ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          onClick={() => handleThemeChange('dark')}
        >
          深色模式
        </button>
        <button
          className={`px-4 py-2 rounded ${theme === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          onClick={() => handleThemeChange('system')}
        >
          跟随系统
        </button>
      </div>

      {/* 后续其他组件和内容将放在这里 */}
    </div>
  );
}

export default App;
