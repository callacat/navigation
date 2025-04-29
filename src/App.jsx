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

// 函数：获取当前北京时间（包含星期，不含秒钟）并格式化
const getBeijingTime = () => {
  const now = new Date();
  // 获取 UTC 时间（毫秒）
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // 北京时间是 UTC+8
  const beijingTime = new Date(utc + (8 * 3600000));

  // 格式化时间，例如：YYYY-MM-DD HH:mm 星期X
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(beijingTime.getDate()).padStart(2, '0');
  const hours = String(beijingTime.getHours()).padStart(2, '0');
  const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][beijingTime.getDay()]; // 获取星期

  return `${year}-${month}-${day} ${hours}:${minutes} ${dayOfWeek}`; // 移除秒钟部分
};

// 直接在这里设置你的天气 API Key
// 请替换 'YOUR_HEFENG_API_KEY' 为你的和风天气 API Key
// **注意：和风天气 V7 版本 Key 需要放在 Authorization: Bearer 头部**
const WEATHER_API_KEY = 'YOUR_HEFENG_API_KEY'; // <-- 在这里填写你的 API Key

// 和风天气 V7 实时天气 API 基础 URL
const WEATHER_BASE_URL = 'https://devapi.qweather.com/v7/weather/now';

// 定义默认搜索引擎配置
const defaultSearchEngines = [
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  // { name: '秘塔AI搜索', url: 'https://metaso.cn/search?q=' }, // 移除秘塔AI搜索
  { name: '知乎', url: 'https://www.zhihu.com/search?q=' },
  { name: 'Bilibili', url: 'https://search.bilibili.com/all?keyword=' },
  { name: '在线翻译', url: 'https://fanyi.baidu.com/#en/zh/' }, // 示例：百度翻译，可能需要调整URL格式
  // 可以根据需要添加更多搜索引擎
];


function App() {
  // ... (主题和时间相关的状态和 useEffect 保持不变) ...
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

  // 定义天气状态
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null); // 用户位置信息 (城市名等)


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

  // 使用 useEffect 设置定时器，每分钟更新时间 (因为不再显示秒钟)
  useEffect(() => {
    // 首次渲染时立即更新一次时间
    setCurrentTime(getBeijingTime());

    // 设置定时器，每分钟更新一次（60000毫秒）
    const timerId = setInterval(() => {
      setCurrentTime(getBeijingTime());
    }, 60000); // 每 60 秒 (1分钟) 更新一次

    // 清理函数：组件卸载时清除定时器
    return () => clearInterval(timerId);
  }, []); // 空依赖项数组表示只在组件挂载和卸载时运行


  // 使用 useEffect 获取用户位置并获取天气
  useEffect(() => {
    // 检查 API Key 是否已设置（是否还是默认的占位符）
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_HEFENG_API_KEY') {
      setWeatherError("请在 src/App.jsx 文件中设置您的天气 API Key"); // <-- 更新提示信息
      return;
    }

    // 尝试使用 Geolocation API 获取当前位置经纬度
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // 和风天气实时天气接口使用经纬度作为 location 参数，格式为 经度,纬度
          const locationCoord = `${longitude},${latitude}`; // **修改这里，使用经度,纬度**

          try {
            // 调用和风天气 API 获取天气信息
            // 使用 Headers 将 API Key 放在 Authorization: Bearer 头部
            const response = await fetch(`${WEATHER_BASE_URL}?location=${locationCoord}&lang=zh`, { // **移除 ?key=... 参数**
              headers: { // **添加 Headers**
                'Authorization': `Bearer ${WEATHER_API_KEY}` // **使用 Authorization: Bearer 头部**
              }
            });
            if (!response.ok) {
               // 尝试解析错误信息
               const errorData = await response.json();
               throw new Error(`HTTP error! status: ${response.status}, code: ${errorData.code}, msg: ${errorData.msg}`);
            }
            const data = await response.json();

            // 检查 API 返回的状态码
            if (data.code === '200') {
                setWeather(data.now); // 实时天气数据通常在 'now'字段
                // 获取位置信息 (可能在 data.location 字段，取决于你使用的接口和参数)
                setLocationInfo(data.location ? data.location[0] : null); // 假设位置信息在 data.location 数组的第一个元素

                setWeatherError(null); // 清除之前的错误
            } else {
                // API 返回错误码
                setWeather(null); // 清空天气数据
                setWeatherError(`天气数据获取失败: ${data.code} - ${data.msg || '未知错误'}`);
            }

          } catch (error) {
            console.error("获取天气失败:", error);
            setWeather(null); // 清空天气数据
            setWeatherError(`获取天气失败，请稍后再试。错误信息: ${error.message}`);
          }
        },
        (error) => {
          // Geolocation API 获取位置失败或被拒绝
          console.error("获取位置失败:", error);
          setWeather(null); // 清空天气数据
          setWeatherError("无法获取您的位置信息，请授权或检查设置");
          setLocationInfo(null); // 清空位置信息
        }
      );
    } else {
      // 浏览器不支持 Geolocation API
      setWeather(null); // 清空天气数据
      setWeatherError("您的浏览器不支持获取位置信息");
      setLocationInfo(null); // 清空位置信息
    }

    // 注意：和风天气免费版可能有调用频率限制，不适合频繁更新。
    // 如果需要更频繁更新或通过城市名获取，请参考和风天气开发文档。

  }, []); // 空依赖项数组表示只在组件挂载时运行

  // ... (主题切换函数保持不变) ...
  // 处理主题切换的函数：循环切换主题
  const handleThemeToggle = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // 获取当前主题对应的图标和文本
  const currentThemeInfo = themeIcons[theme];

  // --- 搜索区相关的状态和函数 ---
  const [searchQuery, setSearchQuery] = useState(''); // 搜索输入框的状态
  const [selectedEngine, setSelectedEngine] = useState(defaultSearchEngines[0]); // 当前选中的搜索引擎

  // 处理搜索输入的函数
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // 处理搜索引擎选择变化的函数
  const handleEngineChange = (event) => {
    const selectedEngineName = event.target.value;
    const engine = defaultSearchEngines.find(engine => engine.name === selectedEngineName);
    if (engine) {
      setSelectedEngine(engine);
    }
  };

  // 执行搜索的函数
  const handleSearch = (event) => {
    event.preventDefault(); // 阻止表单默认提交行为
    if (searchQuery.trim()) {
      const searchUrl = `${selectedEngine.url}${encodeURIComponent(searchQuery)}`;
      window.open(searchUrl, '_blank'); // 在新标签页打开搜索结果
    }
  };
  // --- 搜索区相关的状态和函数结束 ---


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
          href="YOUR_GITHUB_REPO_URL" // *** 请将 YOUR_GITHUB_REPO_URL 替换为你的 GitHub 仓库地址 ***
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-lg hover:text-blue-600 dark:hover:text-blue-400" // 添加样式使其成为圆形按钮
          title="访问我的 GitHub 仓库"
        >
          🐙 {/* 使用 Octocat 图标 */}
        </a>
      </div>

      {/* 页面主要内容，垂直居中 */}
      {/* 添加时间与天气显示区域 */}
      <div className="mt-12 text-center"> {/* mt-12 为顶部留出空间，text-center 使内容居中 */}
        {/* 时间显示 */}
        <div className="text-xl font-mono text-gray-800 dark:text-gray-200">
          {currentTime}
        </div>

        {/* 天气显示 */}
        <div className="mt-2 text-lg text-gray-700 dark:text-gray-300">
          {weatherError ? (
            <p>{weatherError}</p>
          ) : weather ? (
            <p>
              {/* 显示城市名（如果获取到）和天气信息 */}
              {locationInfo?.name ? `${locationInfo.name}: ` : '您的位置: '}
              {weather.temp}°C, {weather.text} {/* 假设实时天气温度在 temp 字段，描述在 text 字段 */}
            </p>
          ) : (
            <p>正在获取天气...</p>
          )}
        </div>
      </div>

      {/* --- 搜索区 --- */}
      <div className="mt-12 w-full max-w-md"> {/* mt-12 在时间天气下方留出空间，max-w-md 限制最大宽度 */}
        <form onSubmit={handleSearch} className="flex items-center rounded-full shadow-md overflow-hidden bg-white dark:bg-gray-800">
          {/* 搜索引擎选择 */}
          <select
            value={selectedEngine.name}
            onChange={handleEngineChange}
            className="px-4 py-3 bg-transparent text-gray-800 dark:text-gray-200 border-none focus:outline-none"
          >
            {defaultSearchEngines.map(engine => (
              <option key={engine.name} value={engine.name}>
                {engine.name}
              </option>
            ))}
          </select>

          {/* 搜索输入框 */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="输入搜索内容..."
            className="flex-grow px-4 py-3 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 border-none focus:outline-none"
          />

          {/* 搜索按钮 */}
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white dark:bg-blue-700 dark:text-gray-100 hover:bg-blue-600 dark:hover:bg-blue-800 focus:outline-none"
          >
            搜索
          </button>
        </form>
      </div>
      {/* --- 搜索区结束 --- */}


      <div className="flex flex-col items-center mt-8"> {/* 添加 mt-8 在搜索区下方留出空间 */}
         {/* 后续其他组件和内容将放在这里 */}
         {/* 例如：分区和卡片 */}
      </div>

    </div>
  );
}

export default App;
