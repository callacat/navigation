import React, { useState, useEffect } from 'react';
import './App.css'; // 保留原有的 App.css 引入

// 定义主题模式的顺序
const themes = ['light', 'dark', 'system'];

// 定义主题对应的图标和文本
const themeIcons = {
  light: { icon: '☀️', text: '浅色模式' }, // 太阳图标
  dark: { icon: '🌙', text: '深色模式' },  // 月亮图标
  system: { icon: '⚙️', text: '跟随系统' }, // 齿轮图标
};

// 函数：获取当前北京时间并格式化
const getBeijingTime = () => {
  const now = new Date();
  // 获取 UTC 时间（毫秒）
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // 北京时间是 UTC+8
  const beijingTime = new Date(utc + (8 * 3600000));

  // 格式化时间，例如：YYYY-MM-DD HH:mm:ss
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(beijingTime.getDate()).padStart(2, '0');
  const hours = String(beijingTime.getHours()).padStart(2, '0');
  const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
  const seconds = String(beijingTime.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


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

  // 定义时间状态
  const [currentTime, setCurrentTime] = useState(getBeijingTime());

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

  // 使用 useEffect 设置定时器，每秒更新时间
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(getBeijingTime());
    }, 1000); // 每 1000 毫秒 (1秒) 更新一次

    // 清理函数：组件卸载时清除定时器
    return () => clearInterval(timerId);
  }, []); // 空依赖项数组表示只在组件挂载和卸载时运行


  // 处理主题切换的函数：循环切换主题
  const handleThemeToggle = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // 获取当前主题对应的图标和文本
  const currentThemeInfo = themeIcons[theme];

  return (
    // 使用 flexbox 布局，将内容垂直居中，并将右上角元素靠右对齐
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative flex flex-col items-center p-4"> {/* 移除 justify-center，让内容从顶部开始排列 */}

      {/* 右上角区域 */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 z-10"> {/* 添加 z-10 确保在顶部 */}
        {/* 主题切换按钮 */}
        <button
          className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-lg" // 调整文本大小以适应图标
          onClick={handleThemeToggle}
          title={`当前主题: ${currentThemeInfo.text}`}
        >
          {currentThemeInfo.icon} {/* 使用图标 */}
        </button>

        {/* GitHub 链接，请替换为你的 GitHub 仓库地址 */}
        <a
          href="https://github.com/callacat/navigation" // *** 请将 YOUR_GITHUB_REPO_URL 替换为你的 GitHub 仓库地址 ***
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-lg hover:text-blue-600 dark:hover:text-blue-400" // 添加样式使其成为圆形按钮
          title="访问我的 GitHub 仓库"
        >
          🐙 {/* 使用 Octocat 图标 */}
        </a>
      </div>

      {/* 页面主要内容，垂直居中 */}
      {/* 添加时间显示区域 */}
      <div className="mt-12 text-xl font-mono text-gray-800 dark:text-gray-200"> {/* mt-12 为顶部留出空间 */}
        {currentTime}
      </div>


      <div className="flex flex-col items-center mt-8"> {/* 添加 mt-8 在时间下方留出空间 */}
         {/* 后续其他组件和内容将放在这里 */}
         {/* 例如：天气、搜索框、分区等 */}
         {/* 移除原有的 h1 标签，或者将其移动到这里作为页面标题 */}
         {/*
         <h1 className="text-3xl font-bold underline text-blue-600 dark:text-blue-400">
           Hello, Navigation Site!
         </h1>
         */}
      </div>

    </div>
  );
}

export default App;
