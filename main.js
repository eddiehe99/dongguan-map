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

// 添加一个变量来记录当前高亮的元素 ID，以便移除旧的高亮
let currentHighlightedPathId = null;

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

  updateSvgHighlight();

  // 如果还有其他需要根据滚动更新的 UI，也可以在这里调用对应的函数
  // 例如，更新 "The End" 消息的显示
  updateEndingDisplay(currentP); // 假设有这个函数

  // --- 新增：更新 SVG 高亮显示 ---

}

// --- 新增函数：更新 SVG 高亮 ---
function updateSvgHighlight() {
  // 获取当前所有 corner-group 元素 (即包含 path 的 <g>)
  const allCornerGroups = document.querySelectorAll('g.corner'); // 选择所有拥有 corner 类的 <g>

  // 遍历所有 corner-group 元素
  allCornerGroups.forEach(gElement => {
    // 获取该 g 对应的 GeoJSON feature 的 id (通过 g 的 id 推断)
    // 这里假设 g 的 id 格式是 `corner-group-${featureId}`
    const gId = gElement.id;
    const pathId = gId.replace('corner-group-', ''); // 从 g 的 id 中提取 path 的 id

    // 检查当前的 g 元素是否对应于 main.js 中找到的 currentCorner
    if (showCorner && currentCorner && pathId === currentCorner.id) {
      // 获取 g 内的 path 元素
      const pathElement = gElement.querySelector('path.path'); // 选择 g 内拥有 path 类的 path
      const progressPathElement = gElement.querySelector('path.town-progress'); // 选择 g 内拥有 progress 类的 path
      if (pathElement) {
        // 1. 设置 path 的 CSS 变量 --st 和 --ed (来自 main.js 的计算结果)
        pathElement.style.setProperty('--st', window.cornerStart);
        pathElement.style.setProperty('--ed', window.cornerEnd);
        // 注意：--full 应该在加载 GeoJSON 时设置在 SVG 或 <g> 上，或者 pathGenerator 生成的每个 path 都知道自己的长度
        // 如果每个 path 的长度不同且需要精确控制，这会变得复杂。通常 --full 是整个赛道的总长度。
        // 你可能需要为每个 path 计算其相对于总长度的比例，或者重新考虑 --full 的定义。
        // 简单起见，如果所有 path 都基于同一个坐标系统，可以设置一个全局的 --full。
        // 例如：svgElement.style.setProperty('--full', totalTrackLength);

        // 2. 控制 g 元素的显示/隐藏 (class)
        gElement.classList.remove('hidden'); // 移除 hidden 类
        gElement.classList.add('show');       // 添加 show 类
      }


      if (progressPathElement) {
        // --- 应用 Progress 效果 ---
        // 1. 设置进度相关的样式属性 (模拟 .progress 类)
        // 注意：你需要知道这个 progressPathElement 的 *自身* 长度，或者一个相对于其长度的比例
        // 假设我们想让这个区域的进度条根据 currentP 从 0% 变化到 100%
        // 那么 stroke-dasharray 应该是 path 的长度，stroke-dashoffset 应该是 (1 - currentP) * 长度
        // 但更简单的方式是，如果 currentP 在 [st, ed] 范围内，我们将其映射到 [0, 1] 作为这个区域的局部进度
        // 局部进度 = (currentP - cornerStart) / (cornerEnd - cornerStart)
        // 但 currentP 可能超出 [cornerStart, cornerEnd] 范围，所以需要 clamping
        const localP = Math.max(0, Math.min(1, (currentP - cornerStart) / (cornerEnd - cornerStart)));

        // 获取路径的总长度
        const pathLength = progressPathElement.getTotalLength();

        // 设置 stroke-dasharray 为 [可见长度, 隐藏长度]，其中可见长度是 localP * pathLength
        // 或者设置为 [pathLength, pathLength]，然后用 offset 控制
        // 推荐使用 [pathLength, pathLength] 方式，更稳定
        progressPathElement.style.setProperty('stroke-dasharray', `${pathLength} ${pathLength}`);
        // 设置 stroke-dashoffset，当 localP 为 1 时 offset 为 0 (完全显示)，当 localP 为 0 时 offset 为 -pathLength (完全隐藏)
        progressPathElement.style.setProperty('stroke-dashoffset', `${pathLength * (1 - localP)}`);
        // 设置其他进度条样式
        progressPathElement.style.setProperty('stroke', 'var(--bg1)'); // 使用进度条颜色
        progressPathElement.style.setProperty('stroke-width', '1px');
        progressPathElement.style.setProperty('stroke-linecap', 'round');
        progressPathElement.style.setProperty('transition', 'stroke-dashoffset 0.2s ease-out'); // 添加过渡效果
      }

    } else {
      // 如果该 g 的 id 不匹配当前 corner，或者没有当前 corner，则隐藏它
      gElement.classList.remove('show');
      gElement.classList.add('hidden');
    }
  });

  updateCornerNamesDiv(); 
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
document.addEventListener("DOMContentLoaded", function () {
  // ... (之前的事件监听器绑定代码) ...

  const startOverBtn = document.getElementById('startOverBtn');
  if (startOverBtn) {
    // 假设 setP 函数已经定义并且暴露在 window 对象上
    startOverBtn.addEventListener('click', function () {
      window.setP(0.0); // 模拟 Vue 的 @click="setP(0.001)"
      document.body.classList.remove("scrolled");
    });
  } else {
    console.warn("Start over button with ID 'startOverBtn' not found.");
  }

  // ... (其他初始化代码) ...
});

function updateCornerNamesDiv() {
    const container = document.getElementById('town-names-container');
    if (!container) return;

    // 确保容器有正确的定位
    if (container.style.position !== 'absolute') {
        container.style.position = 'absolute';
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none'; // 允许点击穿透到 SVG
    }

    // 使用 Set 来跟踪已处理的元素，避免重复创建
    const processedIds = new Set();

    // 遍历 towns 数组
    towns.forEach(town => {
        const townId = town.id;
        processedIds.add(townId);

        // 查找或创建对应的 corner-name div 元素
        let element = container.querySelector(`.corner-name[data-id="${townId}"]`);
        if (!element) {
            // 如果元素不存在，则创建它
            element = document.createElement('div');
            element.className = 'corner-name';
            element.setAttribute('data-id', townId);

            // 创建内部结构
            const innerDiv1 = document.createElement('div');
            const innerDiv2 = document.createElement('div');
            innerDiv2.textContent = town.ch;
            innerDiv1.appendChild(innerDiv2);
            element.appendChild(innerDiv1);

            // 添加点击事件
            element.style.pointerEvents = 'auto';
            element.addEventListener('click', (event) => {
                event.stopPropagation();
                if (typeof window.setP === 'function') {
                    window.setP((town.st + town.ed) / 2);
                }
            });

            container.appendChild(element);
        }

        // 更新文本内容
        const currentLang = window.currentLang || 'cn';
        const textElement = element.querySelector('div div');
        if (textElement) {
            textElement.textContent = currentLang === 'cn' ? town.ch : (town.en || town.ch);
        }

        // --- 修改此处的逻辑 ---
        // 计算是否应该显示 (基于滚动、进度和全局设置)
        // const shouldShow = (town.st < currentP) || window.showAllCornerNames; // 原来的逻辑
        const isScrolled = window.scrollY > 2; // 检查是否滚动超过 2px
        const isPassed = town.st < currentP;    // 检查是否已超过该区域的起始点
        const shouldShowBasedOnScroll = isScrolled; // 根据滚动状态决定是否显示
        const shouldShowBasedOnProgressOrAll = isPassed || window.showAllCornerNames; // 原来的基于进度或全部显示的逻辑

        // 你可以选择以下几种方式之一：
        // 1. 只根据滚动状态 (最符合你的要求)
        let shouldShow = shouldShowBasedOnScroll;

        // 2. 或者，滚动后显示已过的 + 全部显示 (结合滚动和进度)
        // let shouldShow = (isScrolled && isPassed) || window.showAllCornerNames;

        // 3. 或者，滚动后显示全部，未滚动时按原逻辑 (优先考虑滚动)
        // let shouldShow = isScrolled || shouldShowBasedOnProgressOrAll;

        // 根据你的具体需求选择一种 shouldShow 逻辑
        // 这里选择第 1 种：只根据滚动状态
        shouldShow = shouldShowBasedOnScroll;

        // --- end 修改 ---
        const isHighlighted = currentP > town.st && currentP <= town.ed;

        element.classList.toggle('show', shouldShow);
        element.classList.toggle('hidden', !shouldShow);
        element.classList.toggle('highlighted', isHighlighted);

        // --- 修复坐标计算 ---
        const centroid = window.featureCentroids?.get(townId);
        if (centroid) {
            const [svgX, svgY] = centroid;
            
            const svgElement = document.getElementById('svg-track');
            const containerElement = document.querySelector('.track-map > .inner');
            
            if (svgElement && containerElement) {
                // 获取 SVG 的 viewBox
                const viewBox = svgElement.viewBox.baseVal;

                // 获取容器的 clientWidth/Height (内容区域尺寸，不包括 padding 和 border)
                const containerWidth = containerElement.clientWidth;
                const containerHeight = containerElement.clientHeight;

                // 计算 SVG 坐标相对于 viewBox 的比例
                const xRatio = (svgX - viewBox.x) / viewBox.width;
                const yRatio = (svgY - viewBox.y) / viewBox.height;

                // 计算在容器内容区域内的像素位置
                const pixelX = xRatio * containerWidth;
                const pixelY = yRatio * containerHeight;

                // 设置位置 - 使用 transform 定位
                // translate 可以精确控制，且不依赖于容器的定位属性
                // 需要减去元素自身的一半宽高以实现中心对齐
                // element.style.transform = `translate(${pixelX}px, ${pixelY}px)`;
                // 为了居中，可以使用 CSS 的 transform-origin 或者 JS 计算偏移
                // 更好的方式是在 CSS 中设置 transform-origin: center center;
                element.style.transform = `translate(${pixelX}px, ${pixelY}px)`;

                // 移除可能的 left/top 干扰
                element.style.left = '0';
                element.style.top = '0';
            }
        }
    });

    // 清理不再需要的元素（如果需要）
    const allElements = container.querySelectorAll('.corner-name');
    allElements.forEach(el => {
        const id = el.getAttribute('data-id');
        if (!processedIds.has(id)) {
            el.remove();
        }
    });
}

window.updateCornerNamesDiv = updateCornerNamesDiv;