let rootURL = document.baseURI
var root = document.querySelector(':root')
const body = document.querySelector('body');
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  root.classList.add('dark')
}

let currentP = 0.0; // 滚动进度
let currentLang = window.lang || 'cn'; // 语言，从 index.html 获取
let showModal = false; // 模态框显示状态
let showAllCornerNames = false; // 显示所有弯道名称
let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; // 深色模式
let showCorner = false; // 显示当前弯道
let showSection = false; // 显示当前路段
let currentCorner = null; // 当前弯道对象
let scrollDistance = 0; // 滚动距离
let cornerStart = 0; // 当前弯道开始位置
let cornerEnd = 0; // 当前弯道结束位置
let sectionStart = 0; // 当前路段开始位置
let sectionEnd = 0; // 当前路段结束位置

let towns = [];

// 加载 JSON 数据
async function loadAppData() {
  try {
    const response = await fetch('assets/data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // 填充数据
    towns = data.towns || [];

    console.log('数据加载成功，镇街数量:', towns.length);
    return true;
  } catch (error) {
    console.error('加载数据失败:', error);
    // 可以在这里设置默认数据或显示错误信息
    return false;
  }
}

// 初始化应用
async function initApp() {
  // 先加载数据
  const dataLoaded = await loadAppData();

  if (!dataLoaded) {
    // 数据加载失败的处理
    console.error('加载数据失败:', error);
    return;
  }

  // 初始化其他功能
  updatePageHeight();
  updateScrollDistance();
}

document.addEventListener('DOMContentLoaded', initApp);

var d = new Vue({
  el: '#app',
  data: {
    p: 0.5,
    w: 660,
    h: 530,
    mX: 0,
    mY: 0,
    showModal: false,
    showAllCornerNames: false,
    darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    showCorner: false,
    showSection: false,
    currentCorner: null,
    scrollDistance: 0,
    cornerStart: 0,
    cornerEnd: 0,
    sectionStart: 0,
    sectionEnd: 0,
    aboutContent: "网页设计 & 开发：<a href='https://jjying.com/' target='_blank'>JJ Ying</a><br/><br/><strong>参考信息:</strong><br/>· <a target='_blank' href='https://oversteer48.com/nurburgring-corner-names/'>Corner Names, Numbers and circuit map</a><br/>· <a target='_blank' href='https://nring.info/nurburgring-nordschleife-corners/'>NRing.info</a><br/>· <a target='_blank' href='https://www.youtube.com/watch?v=-lCR1_cDqTg'>Nürburgring Corner Names Explained</a><br/>· 键盘车神教教主视频：<a target='_blank' href='https://www.bilibili.com/video/BV1NntCe4ETM/'>纽北每一个弯的名字？</a><br/><br/><strong>页面源码:</strong><br/>· <a target='_blank' href='https://github.com/JJYing/Nurburgring-Map'>@GitHub</a>",
    modalContent: "",
    modalType: "text"
  },
  methods: {
    innerModal: function (e) {
      e.stopPropagation()
    },
    openModal: function (type, img = null) {
      this.modalType = type
      if (type == 'text') this.modalContent = this.aboutContent
      if (type == 'image') {
        this.modalContent = "<img src='" + 'https://s.anyway.red/nurburgring/' + img.src + '!/quality/80/progressive/true/ignore-error/true' + "'/>"
        if (img.url) this.modalContent += "<div class='source-in-modal'>@<a href='" + img.url + "' target='_blank'>" + img.author + "</a></div>"
      }
      this.showModal = true
    }

  }
})


document.addEventListener('scroll', function (e) {
  if (window.scrollY > 2) {
    document.body.classList.add("scrolled")
  }
  else {
    document.body.classList.remove("scrolled")
  }
});


function updatePageHeight() {
  if (window.innerHeight < window.innerWidth) {
    body.classList.remove("vertical")
    body.classList.add("horizontal")
  }
  else {
    body.classList.remove("horizontal")
    body.classList.add("vertical")
  }
}

window.addEventListener('scroll', updateScrollDistance)
window.addEventListener('resize', function () {
  updateScrollDistance()
  updatePageHeight()
})

updateScrollDistance()
updatePageHeight()

window.addEventListener("keyup", function (e) {
  if (e.key === "Escape") {
    d.showModal = false
  }
})

document.querySelector('.track-map > .inner').addEventListener('mousemove', function (event) {
  const innerRect = this.getBoundingClientRect();
  d.mX = (event.clientX - innerRect.left) / innerRect.width
  d.mY = (event.clientY - innerRect.top) / innerRect.height
});


// --- 定义切换语言的函数 ---
function toggleLang() {
  // 1. 切换语言状态
  if (currentLang === "en") {
    currentLang = "cn";
  } else {
    currentLang = "en";
  }

  console.log("Language toggled to:", currentLang); // 可选：调试用

  // 2. 更新 UI
  updateUIBasedOnLanguage(currentLang);
}

// --- 定义更新 UI 的函数 ---
function updateUIBasedOnLanguage(lang) {
  // a. 更新语言切换按钮的文本
  const langToggleTextElement = document.getElementById('langToggleText');
  if (langToggleTextElement) {
    langToggleTextElement.textContent = lang === 'cn' ? '中文' : 'Chinese';
  }

  // b. 更新语言切换按钮的 CSS 类 (on/off)
  const langToggleGroupElement = document.getElementById('langToggleGroup');
  if (langToggleGroupElement) {
    if (lang === 'cn') {
      langToggleGroupElement.classList.add('on');
      langToggleGroupElement.classList.remove('off');
    } else {
      langToggleGroupElement.classList.add('off');
      langToggleGroupElement.classList.remove('on');
    }
  }

  // c. 更新 #app 元素的类 (如果 main.css 依赖它来切换语言相关样式)
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.classList.remove('cn', 'en'); // 移除旧类
    appElement.classList.add(lang);          // 添加新类
  }

  // d. 更新其他依赖语言的内容 (如果有的话)
  // 例如，更新 Logo 标题 (假设 HTML 结构允许)
  const logoTitleElement = document.querySelector('.desc .logo .inner .title-font');
  if (logoTitleElement) {
    // 注意：这里直接替换整个 innerHTML，如果结构复杂可能需要更精细的操作
    logoTitleElement.innerHTML = lang === 'cn' ? '纽<span>博格林</span>北<span>环</span>赛道地图' : 'Nürburgring Map';
  }

  // e. 更新其他控制按钮的文本 (如果 HTML 中给它们加了 id)
  const darkModeTextElement = document.getElementById('darkModeToggleText');
  if (darkModeTextElement) {
    darkModeTextElement.textContent = lang === 'cn' ? '深色模式' : 'Dark Mode';
  }
  const aboutTextElement = document.getElementById('aboutLinkText');
  if (aboutTextElement) {
    aboutTextElement.textContent = lang === 'cn' ? '关于本站' : 'About';
  }

  // --- 在这里添加更多需要根据语言更新的 UI 元素 ---
}

// --- 为语言切换按钮添加点击事件监听器 ---
document.addEventListener("DOMContentLoaded", function () {
  const langToggleElement = document.getElementById('langToggleGroup');
  if (langToggleElement) {
    langToggleElement.addEventListener('click', toggleLang);
  } else {
    console.warn("Language toggle element with ID 'langToggleGroup' not found in main.js.");
  }

  // --- 页面加载时，根据初始 lang 值设置 UI 状态 ---
  // 这一步很重要，确保页面加载时按钮状态和文本是正确的
  updateUIBasedOnLanguage(currentLang);
});

// --- 可选：将 currentLang 暴露到全局作用域，以便其他脚本访问 ---
window.currentLang = currentLang; // 如果其他地方需要读取当前语言
window.toggleLang = toggleLang;   // 如果其他地方需要触发语言切换

// --- 假设 currentLang 变量已经在处理语言切换的代码中定义 ---
// let currentLang = ...; // (从上面的代码继承)

// --- 添加深色模式相关的状态 ---
// let isDarkMode = false; // 初始状态设为 false (浅色模式)

// --- 定义切换深色模式的函数 ---
function toggleDarkMode() {
  // 1. 切换深色模式状态
  isDarkMode = !isDarkMode;

  console.log("Dark mode toggled to:", isDarkMode); // 可选：调试用

  // 2. 更新 UI
  updateUIBasedOnDarkMode(isDarkMode);
  // 注意：语言切换可能也会影响这个按钮的文本，所以最好也调用一次语言更新
  updateUIBasedOnLanguage(currentLang); // 确保文本是根据当前语言显示的
}

// --- 定义更新 UI 中深色模式相关部分的函数 ---
function updateUIBasedOnDarkMode(darkModeEnabled) {
  // a. 更新深色模式按钮的 CSS 类 (on/off)
  const darkModeToggleGroupElement = document.getElementById('darkModeToggleGroup');
  if (darkModeToggleGroupElement) {
    if (darkModeEnabled) {
      darkModeToggleGroupElement.classList.add('on');
      darkModeToggleGroupElement.classList.remove('off');
    } else {
      darkModeToggleGroupElement.classList.add('off');
      darkModeToggleGroupElement.classList.remove('on');
    }
  }

  // b. 更新页面或应用的主体样式 (例如，切换 body 或 #app 的类)
  //    这通常需要 CSS 配合，例如 .dark-mode { background-color: #333; color: #fff; }
  const appElement = document.getElementById('app'); // 或者是 document.body
  if (appElement) {
    appElement.classList.toggle('dark-mode', darkModeEnabled); // 根据 darkModeEnabled 的布尔值添加或移除 'dark-mode' 类
  }
}

// --- 为深色模式切换按钮添加点击事件监听器 ---
document.addEventListener("DOMContentLoaded", function () {
  // ... (之前的 langToggleElement 事件监听器) ...

  const darkModeToggleElement = document.getElementById('darkModeToggleGroup');
  if (darkModeToggleElement) {
    darkModeToggleElement.addEventListener('click', toggleDarkMode);
  } else {
    console.warn("Dark mode toggle element with ID 'darkModeToggleGroup' not found in main.js.");
  }

  // --- 页面加载时，根据初始 isDarkMode 值设置 UI 状态 ---
  // 这一步很重要，确保页面加载时按钮状态是正确的
  updateUIBasedOnDarkMode(isDarkMode);
  // 同时也需要根据初始语言设置文本
  updateUIBasedOnLanguage(currentLang);
});

// --- 可选：将 isDarkMode 暴露到全局作用域 ---
window.isDarkMode = isDarkMode;
window.toggleDarkMode = toggleDarkMode;

function updateCornerDisplay() {
  const container = document.getElementById('currentCornerInfoContainer');
  const nameCnEl = document.getElementById('currentCornerNameCn');
  const nameEnEl = document.getElementById('currentCornerNameEn');
  const deSpan = document.getElementById('currentCornerDe');
  const deTextEl = document.getElementById('currentCornerDeText');
  const moreEl = document.getElementById('currentCornerMore');

  if (container && nameCnEl && nameEnEl && deSpan && deTextEl && moreEl) {
    if (showCorner && currentCorner) {
      // container.style.display = 'block'; // 显示容器

      // 清空内容
      nameCnEl.textContent = '';
      nameCnEl.className = 'primary skew-n title-font'; // 重置类名
      nameEnEl.textContent = '';
      nameEnEl.className = 'primary skew-n'; // 重置类名
      deTextEl.textContent = '';
      deSpan.style.display = 'none'; // 默认隐藏德语
      moreEl.innerHTML = ''; // 注意：使用 innerHTML 有 XSS 风险，仅用于显示可信的 HTML

      // 根据当前语言和弯道数据更新内容
      if (currentLang === 'cn' && currentCorner.ch) {
        nameCnEl.textContent = currentCorner.ch;
        // 处理动态类名 :class="currentCorner.ch == currentCorner.nk ? 'qt' : ''"
        if (currentCorner.ch === currentCorner.nk) {
          nameCnEl.classList.add('qt');
        }
        // nameCnEl.style.display = 'block'; // 显示中文名
      } else {
        // nameCnEl.style.display = 'none'; // 隐藏中文名
      }

      if (currentLang === 'en' && currentCorner.en) {
        nameEnEl.textContent = currentCorner.en;
        // nameEnEl.style.display = 'block'; // 显示英文名
      } else {
        // nameEnEl.style.display = 'none'; // 隐藏英文名
      }

      // 显示德语名称 (如果存在)
      if (currentCorner.de) {
        deTextEl.textContent = currentCorner.de;
        // deSpan.style.display = 'inline'; // 显示德语 span (或 block，取决于布局)
      }

      // 显示更多描述 (中文)
      if (currentLang === 'cn' && currentCorner.more) {
        moreEl.innerHTML = currentCorner.more; // 注意：使用 innerHTML 有 XSS 风险
      }

    } else {
      // container.style.display = 'none'; // 隐藏整个容器
    }
  }
}

// --- main.js 中的 updateScrollDistance 函数 ---
function updateScrollDistance() {
  // 重置状态
  showCorner = false;
  showSection = false;
  currentCorner = null;

  // 计算当前滚动进度
  const progress = window.scrollY / (body.scrollHeight - window.innerHeight);
  currentP = Math.min(1, Math.max(0, progress)); // 确保 p 在 [0, 1] 范围内

  // 设置 CSS 变量 (如果需要)
  body.style.setProperty('--p', currentP);

  // 查找当前 town
  for (const town of towns) {
    if (currentP > town.st && currentP < town.ed) {
      showCorner = true;
      cornerStart = town.st;
      cornerEnd = town.ed;
      currentCorner = town;
      break; // 找到第一个匹配的就退出循环
    }
  }

  // --- 关键：调用 updateCornerDisplay 来更新显示 ---
  updateCornerDisplay();

  // 如果还有其他需要根据滚动更新的 UI，也可以在这里调用对应的函数
  // 例如，更新 "The End" 消息的显示
  updateEndingDisplay(currentP); // 假设有这个函数
}

window.updateScrollDistance = updateScrollDistance;
window.updateCornerDisplay = updateCornerDisplay; // 确保这一行存在

function updateEndingDisplay(progress) {
    const container = document.getElementById('endingMessageContainer');
    const messageElement = document.getElementById('endingMessage'); // 通常不需要显式隐藏/显示这个，因为它在 container 内部
    const startOverBtn = document.getElementById('startOverBtn');
    const cnTextElement = document.getElementById('startOverBtnTextCn');
    const enTextElement = document.getElementById('startOverBtnTextEn');

    if (container && startOverBtn && cnTextElement && enTextElement) {
        // 检查滚动进度是否接近 1 (模拟 Vue 的 v-if="p > 0.999")
        if (progress > 0.9625) {
            container.style.display = ''; // 显示整个容器

            // 根据当前语言显示按钮文本 (模拟 Vue 的 v-if="lang == 'cn'" 和 v-if="lang == 'en'")
            if (currentLang === 'cn') {
                cnTextElement.style.display = '';
                enTextElement.style.display = 'none';
            } else { // 假设不是 'cn' 就是 'en'
                cnTextElement.style.display = 'none';
                enTextElement.style.display = '';
            }
        } else {
            // container.style.display = 'none'; // 隐藏整个容器
        }
    }
}

function setP(percentage) {
    currentP = percentage; // 更新内部状态变量 (如果需要)
    // 计算目标滚动位置
    const scrollTarget = (body.scrollHeight - window.innerHeight) * percentage;
    // 执行滚动
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' }); // 使用平滑滚动，或者 'auto' 立即滚动
    // 重要：滚动后，需要触发 updateScrollDistance 来同步状态和 UI
    updateScrollDistance(); // 这行很关键，确保滚动后 UI 更新
    document.body.classList.remove("scrolled");
}

window.setP = setP;

// --- 确保在 DOM 加载完成后为 "回到起点" 按钮添加点击事件监听器 ---
document.addEventListener("DOMContentLoaded", function() {
    // ... (之前的事件监听器绑定代码) ...

    const startOverBtn = document.getElementById('startOverBtn');
    if (startOverBtn) {
        // 假设 setP 函数已经定义并且暴露在 window 对象上
        startOverBtn.addEventListener('click', function() {
            window.setP(0.0); // 模拟 Vue 的 @click="setP(0.001)"
            document.body.classList.remove("scrolled");
        });
    } else {
        console.warn("Start over button with ID 'startOverBtn' not found.");
    }

    // ... (其他初始化代码) ...
});
