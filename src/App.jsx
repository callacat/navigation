import React, { useState, useEffect } from 'react';
import './App.css'; // 保留原有的 App.css 引入

// 定义主题模式的顺序
const themes = ['light', 'dark', 'system'];

function App() {
  // 定义主题状态，初始值从 localStorage 读取或默认为 'system'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes.includes(savedTheme)) { // 确保读取的主题是有效的
      return savedTheme;
    }
    // 如果 localStorage 中没有或无效，则根据系统偏好设置初始主题
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // 使用 useEffect 来监听主题状态变化并更新 <html> 元素的类
  useEffect(() => {
    const root = document.documentElement; // 获取 <html> 元素

    // 移除可能存在的 dark 类，避免冲突
    root.classList.remove('dark');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'system') {
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

  // 处理主题切换的函数：循环切换主题
  const handleThemeToggle = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // 根据当前主题显示对应的文本或图标（这里先用文本表示）
  const themeButtonText = theme === 'light' ? '浅' : (theme === 'dark' ? '深' : '系'); // 浅色/深色/系统

  return (
    // 使用 flexbox 布局，将内容垂直居中，并将右上角元素靠右对齐
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative flex flex-col items-center justify-center p-4">

      {/* 右上角区域 */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        {/* 主题切换按钮 */}
        <button
          className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-sm font-bold"
          onClick={handleThemeToggle}
          title={`当前主题: ${theme === 'light' ? '浅色' : (theme === 'dark' ? '深色' : '跟随系统')}`}
        >
          {themeButtonText} {/* 这里未来可以用图标替代 */}
        </button>

        {/* GitHub 链接，请替换为你的 GitHub 仓库地址 */}
        <a
          href="YOUR_GITHUB_REPO_URL" // *** 请将 YOUR_GITHUB_REPO_URL 替换为你的 GitHub 仓库地址 ***
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          title="访问我的 GitHub 仓库"
        >
          GitHub {/* 这里未来可以用图标替代 */}
        </a>
      </div>

      {/* 页面主要内容，垂直居中 */}
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold underline text-blue-600 dark:text-blue-400">
          Hello, Navigation Site!
        </h1>

        {/* 后续其他组件和内容将放在这里 */}
        {/* 例如：时间、天气、搜索框、分区等 */}
      </div>

    </div>
  );
}

export default App;
