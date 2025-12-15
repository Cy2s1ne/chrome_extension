const engines = [
    {
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        icon: 'https://www.google.com/favicon.ico',
        logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
        placeholder: '在 Google 上搜索，或者输入一个网址'
    },
    {
        name: 'Baidu',
        url: 'https://www.baidu.com/s?wd=',
        icon: 'https://www.baidu.com/favicon.ico',
        logo: 'https://www.baidu.com/img/flexible/logo/pc/result.png',
        placeholder: '百度一下，你就知道'
    },
    {
        name: 'Bing',
        url: 'https://www.bing.com/search?q=',
        icon: 'https://www.bing.com/favicon.ico',
        logo: 'images/Bing-logo.png',
        placeholder: '微软必应搜索'
    },
    {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q=',
        icon: 'https://duckduckgo.com/favicon.ico',
        logo: 'https://duckduckgo.com/assets/logo_header.v108.svg',
        placeholder: 'DuckDuckGo Search'
    }
];

const defaultEngineIndex = 0;
let currentEngine = engines[defaultEngineIndex];

const searchInput = document.getElementById('search-input');
const searchLogo = document.getElementById('search-logo');
const switcherBtn = document.getElementById('switcher-btn');
const currentEngineIcon = document.getElementById('current-engine-icon');
const engineMenu = document.getElementById('engine-menu');

// 初始化
function init() {
    // 从 storage 获取上次选择的搜索引擎
    chrome.storage.sync.get(['selectedEngineIndex'], function(result) {
        const index = result.selectedEngineIndex !== undefined ? result.selectedEngineIndex : defaultEngineIndex;
        setEngine(index);
    });

    renderMenu();
    setupEventListeners();
}

function setEngine(index) {
    currentEngine = engines[index];
    
    // 更新 UI
    currentEngineIcon.src = currentEngine.icon;
    searchLogo.src = currentEngine.logo;
    searchInput.placeholder = currentEngine.placeholder;
    
    // 针对不同 logo 调整样式 (可选)
    if (currentEngine.name === 'Baidu') {
        searchLogo.style.height = 'auto';
        searchLogo.style.width = '260px'; // 增大百度 Logo
    } else if (currentEngine.name === 'Bing') {
        searchLogo.style.height = 'auto';
        searchLogo.style.width = '300px'; // 调整本地 Bing Logo 大小
    } else if (currentEngine.name === 'DuckDuckGo') {
        searchLogo.style.height = '80px'; // 增大 DuckDuckGo Logo
        searchLogo.style.width = 'auto';
    } else {
        // Google default
        // 如果是 Doodle，尺寸可能不同，这里先重置为默认，fetchDoodle 会再次调整
        searchLogo.style.height = '110px'; // 增大 Google Logo
        searchLogo.style.width = 'auto';
    }
    
    updateLogoForTheme(); // 检查主题并更新 Logo

    // 保存选择
    chrome.storage.sync.set({selectedEngineIndex: index});
}

function updateLogoForTheme() {
    // 简单的 Logo 适配逻辑
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (currentEngine.name === 'Google') {
        if (isDarkMode) {
            searchLogo.src = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png';
        } else {
            searchLogo.src = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
        }
    } else {
        // 其他引擎如果需要特定深色 Logo 可以在这里处理
        searchLogo.src = currentEngine.logo;
    }
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateLogoForTheme);

function renderMenu() {
    engineMenu.innerHTML = '';
    engines.forEach((engine, index) => {
        const option = document.createElement('div');
        option.className = 'engine-option';
        option.innerHTML = `
            <img src="${engine.icon}" alt="${engine.name}">
            <span>${engine.name}</span>
        `;
        option.addEventListener('click', () => {
            setEngine(index);
            engineMenu.classList.remove('show');
        });
        engineMenu.appendChild(option);
    });
}

function setupEventListeners() {
    // 切换菜单显示/隐藏
    switcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        engineMenu.classList.toggle('show');
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', () => {
        engineMenu.classList.remove('show');
    });

    // 搜索功能
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                // 检查是否是 URL
                if (isValidURL(query)) {
                    let url = query;
                    if (!/^https?:\/\//i.test(url)) {
                        url = 'http://' + url;
                    }
                    window.location.href = url;
                } else {
                    window.location.href = currentEngine.url + encodeURIComponent(query);
                }
            }
        }
    });
}

function isValidURL(string) {
    // 简单的 URL 验证
    const res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null);
}

init();
