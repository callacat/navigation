import React, { useState, useEffect } from 'react';
import './App.css'; // 保留原有的 App.css 引入
// 引入 uuid 库用于生成唯一 ID
// 在 package.json 的 dependencies 中添加 "uuid": "^8.3.2" (或其他最新版本)
// import { v4 as uuidv4 } from 'uuid'; // 如果在本地开发，需要安装并引入 uuid

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

// *** 背景图片 API 配置 (使用 Bing 每日一图) - 暂时禁用 ***
// Bing 每日一图 API URL
// const BING_DAILY_IMAGE_API_URL = 'https://www.bing.com/HPImageArchive.aspx?format=json&idx=0&n=1&mkt=zh-CN';
// idx=0 表示获取当天的图片，n=1 表示获取一张图片，mkt=zh-CN 表示中国区

// --- 定义分区和卡片的数据结构 ---
// 示例数据结构，实际数据可以从 localStorage 加载
const defaultSections = [
  {
    id: 'section-1',
    name: '常用网站',
    cards: [
      { id: 'card-1-1', name: 'Google', url: 'https://www.google.com', icon: '' }, // icon 字段用于存储图标 URL 或首字母
      { id: 'card-1-2', name: 'GitHub', url: 'https://github.com', icon: '' },
      { id: 'card-1-3', name: '知乎', url: 'https://www.zhihu.com', icon: '' },
      { id: 'card-1-4', name: 'Bilibili', url: 'https://www.bilibili.com', icon: '' },
      { id: 'card-1-5', name: '百度翻译', url: 'https://fanyi.baidu.com/', icon: '' },
    ],
  },
  {
    id: 'section-2',
    name: '开发工具',
    cards: [
      { id: 'card-2-1', name: 'MDN', url: 'https://developer.mozilla.org/', icon: '' },
      { id: 'card-2-2', name: 'Stack Overflow', url: 'https://stackoverflow.com/', icon: '' },
      { id: 'card-2-3', name: 'Vite', url: 'https://vitejs.dev/', icon: '' },
      { id: 'card-2-4', name: 'React', url: 'https://react.dev/', icon: '' },
      { id: 'card-2-5', name: 'Tailwind CSS', url: 'https://tailwindcss.com/', icon: '' },
    ],
  },
  // 可以添加更多分区
];

// 函数：使用 Google Favicon 服务获取网站图标 URL
const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch (error) {
    console.error("Invalid URL for favicon:", url, error);
    return ''; // 返回空字符串表示获取失败
  }
};

// Helper function to generate a unique ID (simplified for GitHub.dev)
// In a real project, use a library like 'uuid'
const generateUniqueId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};


function App() {
  // ... (主题、时间和天气相关的状态和 useEffect 保持不变) ...
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

  // --- 背景图片相关的状态 - 暂时禁用 ---
  // const [backgroundImage, setBackgroundImage] = useState(null);
  // const [backgroundImageError, setBackgroundImageError] = useState(null);


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
          const locationCoord = `${longitude},${latitude}`;

          try {
            // 调用和风天气 API 获取天气信息
            // 使用 Headers 将 API Key 放在 Authorization: Bearer 头部
            const response = await fetch(`${WEATHER_BASE_URL}?location=${locationCoord}&lang=zh`, {
              headers: {
                'Authorization': `Bearer ${WEATHER_API_KEY}`
              }
            });
            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(`HTTP error! status: ${response.status}, code: ${errorData.code}, msg: ${errorData.msg}`);
            }
            const data = await response.json();

            if (data.code === '200') {
                setWeather(data.now);
                setLocationInfo(data.location ? data.location[0] : null);
                setWeatherError(null);
            } else {
                setWeather(null);
                setWeatherError(`天气数据获取失败: ${data.code} - ${data.msg || '未知错误'}`);
            }

          } catch (error) {
            console.error("获取天气失败:", error);
            setWeather(null);
            setWeatherError(`获取天气失败，请稍后再试。错误信息: ${error.message}`);
          }
        },
        (error) => {
          console.error("获取位置失败:", error);
          setWeather(null);
          setWeatherError("无法获取您的位置信息，请授权或检查设置");
          setLocationInfo(null);
        }
      );
    } else {
      setWeather(null);
      setWeatherError("您的浏览器不支持获取位置信息");
      setLocationInfo(null);
    }

  }, []); // 空依赖项数组表示只在组件挂载时运行

  // --- 使用 useEffect 获取背景图片 (使用 Bing 每日一图) - 暂时禁用 ---
  // useEffect(() => {
  //   const fetchBackgroundImage = async () => {
  //     try {
  //       // 调用 Bing 每日一图 API 获取图片信息
  //       const response = await fetch(BING_DAILY_IMAGE_API_URL);

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       // Bing API 返回的图片 URL 在 images 数组的第一个元素的 url 字段
  //       // 需要拼接 Bing 的域名
  //       if (data && data.images && data.images.length > 0 && data.images[0].url) {
  //         const imageUrl = `https://www.bing.com${data.images[0].url}`; // 拼接完整 URL
  //         setBackgroundImage(imageUrl);
  //         setBackgroundImageError(null); // 清除之前的错误
  //       } else {
  //         setBackgroundImage(null);
  //         setBackgroundImageError("未获取到背景图片 URL");
  //       }

  //     } catch (error) {
  //       console.error("获取背景图片失败:", error);
  //       setBackgroundImage(null);
  //       setBackgroundImageError(`获取背景图片失败，请稍后再试。错误信息: ${error.message}`);
  //     }
  //   };

  //   fetchBackgroundImage(); // 组件挂载时立即获取一次背景图片

  //   // Bing 每日一图每天只更新一次，通常不需要定时更换

  // }, []); // 空依赖项数组表示只在组件挂载时运行

  // ... (主题切换函数保持不变) ...
  const handleThemeToggle = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const currentThemeInfo = themeIcons[theme];

  // --- 搜索区相关的状态和函数 ---
  // 从 localStorage 加载或使用默认搜索引擎
  const [searchEngines, setSearchEngines] = useState(() => {
    const savedEngines = localStorage.getItem('searchEngines');
    try {
      return savedEngines ? JSON.parse(savedEngines) : defaultSearchEngines;
    } catch (error) {
      console.error("Failed to parse search engines from localStorage:", error);
      return defaultSearchEngines; // 解析失败时使用默认值
    }
  });

  const [searchQuery, setSearchQuery] = useState(''); // 搜索输入框的状态
  // 从 localStorage 加载或使用默认选中的搜索引擎
  const [selectedEngine, setSelectedEngine] = useState(() => {
    const savedSelectedEngineName = localStorage.getItem('selectedSearchEngine');
    if (savedSelectedEngineName) {
      const engine = searchEngines.find(engine => engine.name === savedSelectedEngineName);
      if (engine) {
        return engine;
      }
    }
    return searchEngines[0]; // 默认选中第一个
  });


  // 使用 useEffect 将 searchEngines 保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('searchEngines', JSON.stringify(searchEngines));
    } catch (error) {
      console.error("Failed to save search engines to localStorage:", error);
      // 可以添加用户提示，例如：alert("保存搜索引擎配置失败，localStorage 已满或不可用。");
    }
  }, [searchEngines]); // 当 searchEngines 变化时保存

  // 使用 useEffect 将 selectedEngine 保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('selectedSearchEngine', selectedEngine.name);
    } catch (error) {
      console.error("Failed to save selected search engine to localStorage:", error);
    }
  }, [selectedEngine]); // 当 selectedEngine 变化时保存


  // 处理搜索输入的函数
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // 处理搜索引擎选择变化的函数
  const handleEngineChange = (event) => {
    const selectedEngineName = event.target.value;
    const engine = searchEngines.find(engine => engine.name === selectedEngineName);
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

  // --- 分区和卡片相关的状态 ---
  // 从 localStorage 加载或使用默认分区和卡片
  const [sections, setSections] = useState(() => {
    const savedSections = localStorage.getItem('sections');
    try {
      // 在加载时尝试获取图标，但可能需要延迟或在单独的 effect 中处理
      const loadedSections = savedSections ? JSON.parse(savedSections) : defaultSections;
       // 在加载时也尝试获取图标，但可能需要更健壮的逻辑
       const sectionsWithFavicons = loadedSections.map(section => ({
           ...section,
           cards: section.cards.map(card => {
               // 如果加载的数据中已经有图标，则使用
               if (card.icon) {
                   return card;
               }
               // 否则尝试获取
               const faviconUrl = getFaviconUrl(card.url);
               return { ...card, icon: faviconUrl };
           })
       }));
       return sectionsWithFavicons;

    } catch (error) {
      console.error("Failed to parse sections from localStorage:", error);
      return defaultSections; // 解析失败时使用默认值
    }
  });


  // 使用 useEffect 将 sections 保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sections', JSON.stringify(sections));
    } catch (error) {
      console.error("Failed to save sections to localStorage:", error);
      // 可以添加用户提示
    }
  }, [sections]); // 当 sections 变化时保存


  // 使用 useEffect 在组件挂载后获取网站图标 (如果加载的数据中没有)
  // 这个 effect 现在主要用于处理初始加载 defaultSections 时获取图标，
  // 或者当 sections 状态因其他原因（非加载自 localStorage）变化时。
  // 注意：如果 sections 是从 localStorage 加载的，并且加载时已经尝试获取了图标，
  // 这个 effect 可能会因为 sections === defaultSections 条件不满足而跳过。
  // 如果需要确保每次更新 sections 后都检查并获取图标，需要调整逻辑。
  useEffect(() => {
      const fetchFaviconsForNewCards = async () => {
          const updatedSections = sections.map(section => ({
              ...section,
              cards: section.cards.map(card => {
                  // 如果卡片没有图标且有 URL，则尝试获取
                  if (!card.icon && card.url) {
                      const faviconUrl = getFaviconUrl(card.url);
                      return { ...card, icon: faviconUrl };
                  }
                  return card; // 否则返回原卡片
              })
          }));

          // 只有当有卡片的图标被更新时才设置状态，避免不必要的渲染
          // 简单的深比较，如果数据结构复杂或包含函数，需要更复杂的比较或使用 Immer 等库
          if (JSON.stringify(updatedSections) !== JSON.stringify(sections)) {
               // 使用 setTimeout 延迟设置状态，给浏览器一些时间渲染，可能有助于图标加载
               // 注意：这只是一个尝试，不保证解决所有图标加载问题
               setTimeout(() => {
                   setSections(updatedSections);
               }, 100); // 延迟 100 毫秒
          }
      };

      fetchFaviconsForNewCards();

  }, [sections]); // 依赖 sections，确保在 sections 变化时检查新卡片


  // 处理卡片点击的函数
  const handleCardClick = (url) => {
    window.open(url, '_blank'); // 在新标签页打开网址
  };

  // 定义图片加载失败的处理函数
  const handleImageError = (e) => {
    e.target.onerror = null; // 防止无限循环
    e.target.src = ''; // 清空 src，显示备用内容（首字母）
    // 可以选择在这里设置一个默认的本地图标或者让父元素显示首字母
    // 例如：e.target.parentElement.innerText = e.target.alt.charAt(0);
  };

  // --- 分区和卡片管理相关的状态和函数 ---
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [currentSectionToEdit, setCurrentSectionToEdit] = useState(null);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [currentCardToEdit, setCurrentCardToEdit] = useState(null);
  const [currentSectionForCard, setCurrentSectionForCard] = useState(null); // 用于添加/编辑卡片时知道是哪个分区

  // 函数：打开添加分区模态框
  const openAddSectionModal = () => {
      setShowAddSectionModal(true);
  };

  // 函数：关闭添加分区模态框
  const closeAddSectionModal = () => {
      setShowAddSectionModal(false);
  };

  // 函数：添加新分区
  const addSection = (sectionName) => {
      if (!sectionName.trim()) return;
      const newSection = {
          // id: uuidv4(), // 在实际项目中使用 uuid 库生成唯一 ID
          id: generateUniqueId(), // 简化的唯一 ID 生成
          name: sectionName.trim(),
          cards: [],
      };
      setSections([...sections, newSection]);
      closeAddSectionModal(); // 添加成功后关闭模态框
  };

  // 函数：打开编辑分区模态框
  const openEditSectionModal = (section) => {
      setCurrentSectionToEdit(section);
      setShowEditSectionModal(true);
  };

  // 函数：关闭编辑分区模态框
  const closeEditSectionModal = () => {
      setCurrentSectionToEdit(null);
      setShowEditSectionModal(false);
  };

  // 函数：编辑分区
  const editSection = (sectionId, newName) => {
      if (!newName.trim()) return;
      const updatedSections = sections.map(section =>
          section.id === sectionId ? { ...section, name: newName.trim() } : section
      );
      setSections(updatedSections);
      closeEditSectionModal(); // 编辑成功后关闭模态框
  };

  // 函数：删除分区
  const deleteSection = (sectionId) => {
      // 可以在这里添加确认提示
      if (window.confirm("确定要删除此分区吗？")) {
          const updatedSections = sections.filter(section => section.id !== sectionId);
          setSections(updatedSections);
      }
  };

  // 函数：打开添加卡片模态框
  const openAddCardModal = (sectionId) => {
      setCurrentSectionForCard(sectionId); // 记录是哪个分区
      setShowAddCardModal(true);
  };

  // 函数：关闭添加卡片模态框
  const closeAddCardModal = () => {
      setCurrentSectionForCard(null);
      setShowAddCardModal(false);
  };

  // 函数：添加新卡片
  const addCard = (sectionId, cardName, cardUrl, cardIcon = '') => {
      if (!cardName.trim() || !cardUrl.trim()) return;

      // 尝试获取 favicon URL，如果手动提供了 icon 则使用手动提供的
      const iconUrl = cardIcon.trim() || getFaviconUrl(cardUrl.trim());

      const newCard = {
          // id: uuidv4(), // 在实际项目中使用 uuid 库生成唯一 ID
          id: generateUniqueId(), // 简化的唯一 ID 生成
          name: cardName.trim(),
          url: cardUrl.trim(),
          icon: iconUrl,
      };

      const updatedSections = sections.map(section =>
          section.id === sectionId ? { ...section, cards: [...section.cards, newCard] } : section
      );
      setSections(updatedSections);
      closeAddCardModal(); // 添加成功后关闭模态框
  };

  // 函数：打开编辑卡片模态框
  const openEditCardModal = (sectionId, card) => {
      setCurrentSectionForCard(sectionId); // 记录是哪个分区
      setCurrentCardToEdit(card);
      setShowEditCardModal(true);
  };

  // 函数：关闭编辑卡片模态框
  const closeEditCardModal = () => {
      setCurrentSectionForCard(null);
      setCurrentCardToEdit(null);
      setShowEditCardModal(false);
  };

  // 函数：编辑卡片
  const editCard = (sectionId, cardId, newName, newUrl, newIcon = '') => {
      if (!newName.trim() || !newUrl.trim()) return;

       // 尝试获取 favicon URL，如果手动提供了 icon 则使用手动提供的
      const iconUrl = newIcon.trim() || getFaviconUrl(newUrl.trim());

      const updatedSections = sections.map(section => {
          if (section.id === sectionId) {
              const updatedCards = section.cards.map(card =>
                  card.id === cardId ? { ...card, name: newName.trim(), url: newUrl.trim(), icon: iconUrl } : card
              );
              return { ...section, cards: updatedCards };
          }
          return section;
      });
      setSections(updatedSections);
      closeEditCardModal(); // 编辑成功后关闭模态框
  };

  // 函数：删除卡片
  const deleteCard = (sectionId, cardId) => {
      // 可以在这里添加确认提示
       if (window.confirm("确定要删除此卡片吗？")) {
          const updatedSections = sections.map(section => {
              if (section.id === sectionId) {
                  const updatedCards = section.cards.filter(card => card.id !== cardId);
                  return { ...section, cards: updatedCards };
              }
              return section;
          });
          setSections(updatedSections);
       }
  };


  return (
    // 使用 flexbox 布局，将内容垂直居中，并将右上角元素靠右对齐
    // 移除背景图片样式和叠加层
    <div
      className="min-h-screen relative flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-900" // 保留 fallback 背景颜色
      // style={{ // 移除 style属性
      //   backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      //   backgroundRepeat: 'no-repeat',
      // }}
    >
      {/* 背景叠加层 - 移除或注释掉 */}
      {/* <div className="absolute inset-0 bg-black opacity-30 dark:bg-black dark:opacity-60 z-0"></div> */}


      {/* 右上角区域, 确保在前景 */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 z-20"> {/* 保持 z-index */}
        {/* 主题切换按钮 */}
        <button
          className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-lg"
          onClick={handleThemeToggle}
          title={`当前主题: ${currentThemeInfo.text}`}
        >
          {currentThemeInfo.icon}
        </button>

        {/* GitHub 链接, 请替换为你的 GitHub 仓库地址 */}
        <a
          href="YOUR_GITHUB_REPO_URL" // *** 请将 YOUR_GITHUB_REPO_URL 替换为你的 GitHub 仓库地址 ***
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-lg hover:text-blue-600 dark:hover:text-blue-400"
          title="访问我的 GitHub 仓库"
        >
          🐙
        </a>
      </div>

      {/* 页面主要内容 */}
      {/* 添加 fade-in 动画类 */}
      <div className="relative z-10 flex flex-col items-center w-full animate-fade-in"> {/* 保持 relative 和 z-10 */}
         {/* 临时测试文本 - 保留或移除 */}
         {/* <p className="text-white text-2xl z-30">测试文本，如果看到说明内容区域正常</p> */}


        {/* 添加时间与天气显示区域 */}
        <div className="mt-12 text-center text-gray-900 dark:text-gray-100"> {/* 调整文本颜色以适应背景 */}
          {/* 时间显示 */}
          <div className="text-xl font-mono">
            {currentTime}
          </div>

          {/* 天气显示 */}
          <div className="mt-2 text-lg">
            {weatherError ? (
              <p>{weatherError}</p>
            ) : weather ? (
              <p>
                {locationInfo?.name ? `${locationInfo.name}: ` : '您的位置: '}
                {weather.temp}°C, {weather.text}
              </p>
            ) : (
              <p>正在获取天气...</p>
            )}
          </div>
        </div>

        {/* --- 搜索区 --- */}
        <div className="mt-12 w-full max-w-md">
          {/* 调整搜索表单的 flex 行为，确保按钮可见 */}
          <form onSubmit={handleSearch} className="flex items-center rounded-full shadow-md overflow-hidden bg-white dark:bg-gray-800"> {/* 移除 flex-nowrap，让其在小屏幕上可换行 */}
            {/* 搜索引擎选择 */}
            <select
              value={selectedEngine.name}
              onChange={handleEngineChange}
              className="px-4 py-3 bg-transparent text-gray-800 dark:text-gray-200 border-none focus:outline-none flex-shrink-0" // 添加 flex-shrink-0
            >
              {searchEngines.map(engine => ( // 使用 searchEngines 状态
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
              className="flex-grow px-4 py-3 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 border-none focus:outline-none min-w-0" // 添加 min-w-0 允许输入框缩小
            />

            {/* 搜索按钮 */}
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white dark:bg-blue-700 dark:text-gray-100 hover:bg-blue-600 dark:hover:bg-blue-800 focus:outline-none flex-shrink-0" // 添加 flex-shrink-0
            >
              搜索
            </button>
          </form>
        </div>
        {/* --- 搜索区结束 --- */}


        {/* --- 分区和卡片区域 --- */}
        <div className="mt-8 w-full max-w-4xl"> {/* 调整最大宽度以适应多个分区 */}
          {sections.map(section => (
            <div key={section.id} className="mb-8 p-4 rounded-lg shadow-xl bg-white dark:bg-gray-800"> {/* 为分区容器添加样式，减小内边距 */}
              {/* 分区标题和管理按钮 */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{section.name}</h2> {/* 减小标题大小和底部间距 */}
                  {/* 分区管理按钮 */}
                  <div>
                      {/* 添加卡片按钮 - 调整大小 */}
                      <button
                          className="ml-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xl" // **调整文本大小**
                          onClick={() => openAddCardModal(section.id)} // 点击打开添加卡片模态框
                          title="添加卡片"
                      >
                          + {/* 示例图标，未来可以使用更专业的图标库 */}
                      </button>
                      {/* 编辑分区按钮 */}
                      <button
                          className="ml-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => openEditSectionModal(section)} // 点击打开编辑分区模态框
                          title="编辑分区"
                      >
                          ✏️ {/* 示例图标 */}
                      </button>
                       {/* 删除分区按钮 */}
                       {sections.length > 1 && ( // 至少保留一个分区
                           <button
                               className="ml-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500"
                               onClick={() => deleteSection(section.id)} // 点击删除分区
                               title="删除分区"
                           >
                               🗑️ {/* 示例图标 */}
                           </button>
                       )}
                  </div>
              </div>


              {/* 卡片容器 */}
              {/* 调整 grid 列数，在小屏幕上显示更多 */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"> {/* 调整 grid 列数和间距 */}
                {section.cards.map(card => (
                  <button
                    key={card.id}
                    className="flex flex-col items-center p-3 rounded-lg shadow-md bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-shadow duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 group relative" // 改进卡片背景样式，减小内边距，添加 group relative
                    onClick={() => handleCardClick(card.url)}
                  >
                    {/* 卡片图标或首字母 */}
                    <div className="w-8 h-8 mb-1 flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white rounded-full text-lg font-bold overflow-hidden"> {/* 减小图标尺寸和底部间距 */}
                      {/* 根据 card.icon 是否存在来显示图标或首字母 */}
                      {card.icon ? (
                        // 使用定义的 handleImageError 函数
                        <img src={card.icon} alt={card.name} className="w-full h-full object-cover rounded-full" onError={handleImageError} />
                      ) : (
                        card.name.charAt(0)
                      )}
                    </div>
                    {/* 卡片名称 */}
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-center truncate w-full">{card.name}</span> {/* 减小文本大小 */}

                    {/* 卡片管理按钮 (悬停显示) */}
                    <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* 编辑卡片按钮 */}
                        <button
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs"
                            onClick={(e) => { e.stopPropagation(); openEditCardModal(section.id, card); }} // 阻止事件冒泡，打开编辑卡片模态框
                            title="编辑卡片"
                        >
                            ✏️
                        </button>
                        {/* 删除卡片按钮 */}
                         <button
                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 text-xs"
                            onClick={(e) => { e.stopPropagation(); deleteCard(section.id, card.id); }} // 阻止事件冒泡，删除卡片
                            title="删除卡片"
                        >
                            🗑️
                        </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
           {/* 添加分区按钮 */}
           <div className="flex justify-center mt-8">
               <button
                   className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                   onClick={openAddSectionModal} // 点击打开添加分区模态框
               >
                   + 添加新分区
               </button>
           </div>
        </div>
        {/* --- 分区和卡片区域结束 --- */}

      </div> {/* 页面主要内容容器结束 */}

      {/* --- 模态框 (简化实现，实际应使用更完善的模态框组件) --- */}
      {/* 添加分区模态框 */}
      {showAddSectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">添加新分区</h3>
                  <input
                      type="text"
                      placeholder="分区名称"
                      className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                      id="newSectionNameInput" // 添加 ID 方便获取值
                  />
                  <div className="flex justify-end">
                      <button
                          className="mr-2 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700"
                          onClick={closeAddSectionModal}
                      >
                          取消
                      </button>
                      <button
                          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                          onClick={() => {
                              const input = document.getElementById('newSectionNameInput');
                              if (input) addSection(input.value);
                          }}
                      >
                          添加
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 编辑分区模态框 */}
      {showEditSectionModal && currentSectionToEdit && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                   <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">编辑分区</h3>
                   <input
                       type="text"
                       defaultValue={currentSectionToEdit.name} // 显示当前名称
                       placeholder="分区名称"
                       className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                       id="editSectionNameInput" // 添加 ID 方便获取值
                   />
                   <div className="flex justify-end">
                       <button
                           className="mr-2 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700"
                           onClick={closeEditSectionModal}
                       >
                           取消
                       </button>
                       <button
                           className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                           onClick={() => {
                               const input = document.getElementById('editSectionNameInput');
                               if (input) editSection(currentSectionToEdit.id, input.value);
                           }}
                       >
                           保存
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* 添加卡片模态框 */}
       {showAddCardModal && currentSectionForCard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">添加新卡片到 "{sections.find(s => s.id === currentSectionForCard)?.name || '该分区'}"</h3>
                    <input
                        type="text"
                        placeholder="网站名称"
                        className="w-full px-3 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                        id="newCardNameInput"
                    />
                    <input
                        type="text"
                        placeholder="网站 URL (例如: https://www.google.com)"
                        className="w-full px-3 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                        id="newCardUrlInput"
                    />
                    <input
                         type="text"
                         placeholder="图标 URL (可选，留空则自动获取)"
                         className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                         id="newCardIconInput"
                     />
                    <div className="flex justify-end">
                        <button
                            className="mr-2 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700"
                            onClick={closeAddCardModal}
                        >
                            取消
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                            onClick={() => {
                                const nameInput = document.getElementById('newCardNameInput');
                                const urlInput = document.getElementById('newCardUrlInput');
                                const iconInput = document.getElementById('newCardIconInput');
                                if (nameInput && urlInput) addCard(currentSectionForCard, nameInput.value, urlInput.value, iconInput?.value || '');
                            }}
                        >
                            添加
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 编辑卡片模态框 */}
        {showEditCardModal && currentCardToEdit && currentSectionForCard && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                     <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">编辑卡片 "{currentCardToEdit.name}"</h3>
                     <input
                         type="text"
                         defaultValue={currentCardToEdit.name}
                         placeholder="网站名称"
                         className="w-full px-3 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                         id="editCardNameInput"
                     />
                     <input
                         type="text"
                         defaultValue={currentCardToEdit.url}
                         placeholder="网站 URL (例如: https://www.google.com)"
                         className="w-full px-3 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                         id="editCardUrlInput"
                     />
                      <input
                          type="text"
                          defaultValue={currentCardToEdit.icon}
                          placeholder="图标 URL (可选，留空则自动获取)"
                          className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                          id="editCardIconInput"
                      />
                     <div className="flex justify-end">
                         <button
                             className="mr-2 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700"
                             onClick={closeEditCardModal}
                         >
                             取消
                         </button>
                         <button
                             className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                             onClick={() => {
                                 const nameInput = document.getElementById('editCardNameInput');
                                 const urlInput = document.getElementById('editCardUrlInput');
                                 const iconInput = document.getElementById('editCardIconInput');
                                 if (nameInput && urlInput) editCard(currentSectionForCard, currentCardToEdit.id, nameInput.value, urlInput.value, iconInput?.value || '');
                             }}
                         >
                             保存
                         </button>
                     </div>
                 </div>
             </div>
         )}

      {/* --- 模态框结束 --- */}

    </div> // 主容器结束
  );
}

export default App;
