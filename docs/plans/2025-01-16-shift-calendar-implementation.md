# 个人排班日历订阅系统 - 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建一个纯前端排班日历应用，支持编辑四种排班状态（早班D/中班S/晚班N/休息R），数据本地存储，可导出ICS文件供iPhone订阅。

**Architecture:** 单页面应用(SPA)，使用原生JavaScript + CSS Grid布局，数据存储在localStorage，导出符合RFC 5545标准的ICS文件。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, localStorage, ICS (RFC 5545)

---

### Task 1: 创建项目基础结构

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/calendar.js`
- Create: `js/storage.js`
- Create: `js/ics.js`

**Step 1: 创建 HTML 主页面**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>个人排班日历</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>个人排班日历</h1>
      <button id="exportBtn" class="btn-export">导出 ICS</button>
    </header>

    <nav class="nav">
      <button id="prevMonth" class="btn-nav">&lt; 上月</button>
      <div class="month-selector">
        <select id="yearSelect"></select>
        <select id="monthSelect"></select>
      </div>
      <button id="nextMonth" class="btn-nav">下月 &gt;</button>
    </nav>

    <div class="today-nav">
      <button id="todayBtn" class="btn-today">返回今天</button>
    </div>

    <div class="calendar">
      <div class="calendar-header">
        <div class="day-name">周日</div>
        <div class="day-name">周一</div>
        <div class="day-name">周二</div>
        <div class="day-name">周三</div>
        <div class="day-name">周四</div>
        <div class="day-name">周五</div>
        <div class="day-name">周六</div>
      </div>
      <div id="calendarGrid" class="calendar-grid"></div>
    </div>

    <div class="stats" id="stats"></div>

    <div class="hint">
      点击日期切换排班状态：D→S→N→R→无
    </div>
  </div>

  <script src="js/storage.js"></script>
  <script src="js/ics.js"></script>
  <script src="js/calendar.js"></script>
</body>
</html>
```

**Step 2: 验证文件创建**

Run: `ls -la index.html css/ js/`
Expected: 显示目录结构已创建

**Step 3: 提交初始结构**

```bash
git add index.html css/ js/
git commit -m "feat: create project structure"
```

---

### Task 2: 实现 localStorage 存储模块

**Files:**
- Modify: `js/storage.js`

**Step 1: 实现 storage 模块**

```javascript
// js/storage.js

const Storage = {
  KEY: 'shiftData',

  // 获取所有排班数据
  getAll() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : {};
  },

  // 保存所有排班数据
  saveAll(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  // 获取指定日期的排班
  getShift(dateStr) {
    const data = this.getAll();
    return data[dateStr] || null;
  },

  // 设置指定日期的排班
  setShift(dateStr, shift) {
    const data = this.getAll();
    if (shift === null) {
      delete data[dateStr];
    } else {
      data[dateStr] = shift;
    }
    this.saveAll(data);
  },

  // 获取指定月份的所有排班
  getMonthShifts(year, month) {
    const data = this.getAll();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const result = {};

    Object.keys(data).forEach(dateStr => {
      if (dateStr.startsWith(prefix)) {
        result[dateStr] = data[dateStr];
      }
    });

    return result;
  },

  // 清除所有数据
  clear() {
    localStorage.removeItem(this.KEY);
  }
};
```

**Step 2: 提交 storage 模块**

```bash
git add js/storage.js
git commit -m "feat: implement localStorage storage module"
```

---

### Task 3: 实现基础日历渲染

**Files:**
- Modify: `js/calendar.js`

**Step 1: 实现日历配置和初始化**

```javascript
// js/calendar.js

const SHIFT_TYPES = {
  D: { label: '早班', color: '#3B82F6', time: '08:00-16:00' },
  S: { label: '中班', color: '#F59E0B', time: '16:00-24:00' },
  N: { label: '晚班', color: '#8B5CF6', time: '00:00-08:00' },
  R: { label: '休息', color: '#9CA3AF', time: '' }
};

const SHIFT_ORDER = ['D', 'S', 'N', 'R', null];

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initSelectors();
  renderCalendar();
  bindEvents();
});
```

**Step 2: 实现年月选择器初始化**

```javascript
// 在 js/calendar.js 中添加

function initSelectors() {
  const yearSelect = document.getElementById('yearSelect');
  const monthSelect = document.getElementById('monthSelect');

  // 年份：前后10年
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y + '年';
    yearSelect.appendChild(option);
  }

  // 月份
  const months = ['1月', '2月', '3月', '4月', '5月', '6月',
                  '7月', '8月', '9月', '10月', '11月', '12月'];
  months.forEach((m, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = m;
    monthSelect.appendChild(option);
  });

  // 设置当前值
  yearSelect.value = currentYear;
  monthSelect.value = currentMonth;
}
```

**Step 3: 提交基础配置**

```bash
git add js/calendar.js
git commit -m "feat: add calendar config and selectors"
```

---

### Task 4: 实现日历网格渲染

**Files:**
- Modify: `js/calendar.js`

**Step 1: 实现日历渲染函数**

```javascript
// 在 js/calendar.js 中添加

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  // 获取当月第一天和最后一天
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  // 填充空白格子
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    grid.appendChild(emptyCell);
  }

  // 填充日期
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const shift = Storage.getShift(dateStr);

    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.dataset.date = dateStr;

    // 标记今天
    if (today.getFullYear() === currentYear &&
        today.getMonth() === currentMonth &&
        today.getDate() === day) {
      cell.classList.add('today');
    }

    // 日期数字
    const dayNum = document.createElement('div');
    dayNum.className = 'day-number';
    dayNum.textContent = day;
    cell.appendChild(dayNum);

    // 班次标识
    if (shift) {
      const shiftBadge = document.createElement('div');
      shiftBadge.className = 'shift-badge';
      shiftBadge.textContent = shift;
      shiftBadge.style.backgroundColor = SHIFT_TYPES[shift].color;
      cell.appendChild(shiftBadge);
    }

    grid.appendChild(cell);
  }

  updateSelectors();
  updateStats();
}
```

**Step 2: 实现选择器同步**

```javascript
// 在 js/calendar.js 中添加

function updateSelectors() {
  document.getElementById('yearSelect').value = currentYear;
  document.getElementById('monthSelect').value = currentMonth;
}
```

**Step 3: 提交日历渲染**

```bash
git add js/calendar.js
git commit -m "feat: implement calendar grid rendering"
```

---

### Task 5: 实现排班切换功能

**Files:**
- Modify: `js/calendar.js`

**Step 1: 实现点击切换排班**

```javascript
// 在 js/calendar.js 中添加

function bindEvents() {
  // 导航按钮
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  document.getElementById('todayBtn').addEventListener('click', () => {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    renderCalendar();
  });

  // 年月选择器
  document.getElementById('yearSelect').addEventListener('change', (e) => {
    currentYear = parseInt(e.target.value);
    renderCalendar();
  });

  document.getElementById('monthSelect').addEventListener('change', (e) => {
    currentMonth = parseInt(e.target.value);
    renderCalendar();
  });

  // 日历格子点击
  document.getElementById('calendarGrid').addEventListener('click', (e) => {
    const cell = e.target.closest('.calendar-day');
    if (!cell || cell.classList.contains('empty')) return;

    const dateStr = cell.dataset.date;
    const currentShift = Storage.getShift(dateStr);
    const currentIndex = SHIFT_ORDER.indexOf(currentShift);
    const nextIndex = (currentIndex + 1) % SHIFT_ORDER.length;
    const nextShift = SHIFT_ORDER[nextIndex];

    Storage.setShift(dateStr, nextShift);
    renderCalendar();
  });
}
```

**Step 2: 提交排班切换功能**

```bash
git add js/calendar.js
git commit -m "feat: implement shift toggle on click"
```

---

### Task 6: 实现统计功能

**Files:**
- Modify: `js/calendar.js`

**Step 1: 实现统计函数**

```javascript
// 在 js/calendar.js 中添加

function updateStats() {
  const shifts = Storage.getMonthShifts(currentYear, currentMonth);
  const stats = { D: 0, S: 0, N: 0, R: 0 };

  Object.values(shifts).forEach(shift => {
    if (stats.hasOwnProperty(shift)) {
      stats[shift]++;
    }
  });

  const statsHtml = `
    早班: ${stats.D}天 |
    中班: ${stats.S}天 |
    晚班: ${stats.N}天 |
    休息: ${stats.R}天
  `;

  document.getElementById('stats').innerHTML = statsHtml;
}
```

**Step 2: 提交统计功能**

```bash
git add js/calendar.js
git commit -m "feat: implement monthly shift statistics"
```

---

### Task 7: 实现 ICS 文件生成

**Files:**
- Modify: `js/ics.js`

**Step 1: 实现 ICS 生成模块**

```javascript
// js/ics.js

const ICS = {
  generate(year, month) {
    const shifts = Storage.getMonthShifts(year, month);
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ShiftCalendar//CN'];

    Object.entries(shifts).forEach(([dateStr, shift]) => {
      const event = this.createEvent(dateStr, shift);
      lines.push(...event);
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  },

  createEvent(dateStr, shift) {
    const shiftInfo = SHIFT_TYPES[shift];
    const uid = `${dateStr}-${shift}@shiftcalendar`;
    const [year, month, day] = dateStr.split('-');

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART;VALUE=DATE:${year}${month}${day}`,
      `DTEND;VALUE=DATE:${this.getNextDay(dateStr)}`,
      `SUMMARY:${shiftInfo.label}`,
      shiftInfo.time ? `DESCRIPTION:${shiftInfo.time}` : '',
      'END:VEVENT'
    ].filter(line => line !== '');
  },

  getNextDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  },

  download(year, month) {
    const content = this.generate(year, month);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-calendar-${year}-${String(month + 1).padStart(2, '0')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
```

**Step 2: 绑定导出按钮**

```javascript
// 在 js/calendar.js 的 bindEvents() 函数中添加

document.getElementById('exportBtn').addEventListener('click', () => {
  ICS.download(currentYear, currentMonth);
});
```

**Step 3: 提交 ICS 生成功能**

```bash
git add js/ics.js js/calendar.js
git commit -m "feat: implement ICS file generation and export"
```

---

### Task 8: 实现样式

**Files:**
- Modify: `css/style.css`

**Step 1: 创建基础样式**

```css
/* css/style.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 28px;
  color: #333;
}

.btn-export {
  padding: 10px 20px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-export:hover {
  background: #2563EB;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.month-selector {
  display: flex;
  gap: 10px;
  flex: 1;
  justify-content: center;
}

.month-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-nav {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-nav:hover {
  background: #e0e0e0;
}

.today-nav {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.btn-today {
  padding: 6px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.btn-today:hover {
  background: #e0e0e0;
}

.calendar {
  margin-bottom: 20px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #f0f0f0;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.day-name {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  background: #fafafa;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #f0f0f0;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.calendar-day {
  background: white;
  min-height: 80px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.calendar-day:hover {
  background: #f9f9f9;
}

.calendar-day.empty {
  background: #fafafa;
  cursor: default;
}

.calendar-day.today {
  border: 2px solid #3B82F6;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.shift-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.stats {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.hint {
  text-align: center;
  font-size: 13px;
  color: #999;
}
```

**Step 2: 提交样式**

```bash
git add css/style.css
git commit -m "feat: add modern calendar styles"
```

---

### Task 9: 创建使用说明文档

**Files:**
- Create: `README.md`

**Step 1: 编写 README**

```markdown
# 个人排班日历订阅系统

一个简单的排班日历管理工具，支持导出 ICS 文件供 iPhone 订阅。

## 功能特性

- 📅 日历视图，支持任意年份月份查看
- 🔄 四种排班状态：早班(D)、中班(S)、晚班(N)、休息(R)
- 💾 数据本地存储，刷新不丢失
- 📤 导出 ICS 文件，支持 iPhone 日历订阅
- 🎨 简洁现代的界面设计

## 排班说明

- **D (早班)**：08:00-16:00
- **S (中班)**：16:00-24:00
- **N (晚班)**：00:00-08:00
- **R (休息)**：休息日

## 使用方法

### 1. 编辑排班

- 点击日期即可循环切换排班状态：D → S → N → R → 无
- 使用顶部导航切换月份
- 使用下拉框快速选择年份和月份
- 点击"返回今天"快速回到当前月份

### 2. 导出 ICS 文件

- 编辑完当月排班后，点击右上角"导出 ICS"按钮
- 下载 `shift-calendar-YYYY-MM.ics` 文件

### 3. 上传到 GitHub

```bash
# 创建仓库
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/your-username/shift-calendar.git
git branch -M main
git push -u origin main
```

### 4. iPhone 订阅

1. 复制 GitHub raw 文件链接：
   ```
   https://raw.githubusercontent.com/your-username/shift-calendar/main/shift-calendar-2025-01.ics
   ```

2. 在 iPhone 上：
   - 打开"设置" → "日历" → "账户" → "添加账户" → "其他"
   - 选择"添加已订阅的日历"
   - 粘贴链接并保存

3. 排班日历会自动同步到你的 iPhone 日历

## 本地运行

直接用浏览器打开 `index.html` 即可使用。

## 技术栈

- HTML5 + CSS3 + Vanilla JavaScript
- localStorage 数据存储
- CSS Grid 布局
- ICS (RFC 5545) 日历格式

## 许可证

MIT
```

**Step 2: 提交文档**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

### Task 10: 测试和验证

**Files:**
- Test: Manual testing in browser

**Step 1: 在浏览器中打开并测试**

Run: `open index.html` (macOS) 或双击 `index.html`

**测试清单：**
- ✅ 日历正确显示当前月份
- ✅ 点击日期可以切换排班状态
- ✅ 排班状态颜色正确显示
- ✅ 月份导航工作正常
- ✅ 年月选择器工作正常
- ✅ 返回今天按钮工作正常
- ✅ 统计信息正确显示
- ✅ 导出 ICS 文件成功
- ✅ 刷新页面后数据不丢失

**Step 2: 提交完成版本**

```bash
git add .
git commit -m "feat: complete shift calendar implementation"
```

---

## 开发完成检查清单

- [x] 项目结构创建
- [x] localStorage 存储模块
- [x] 日历渲染逻辑
- [x] 排班切换功能
- [x] 统计功能
- [x] ICS 文件生成和导出
- [x] 现代化界面样式
- [x] 完整的使用文档

## 后续优化建议

- 添加批量编辑功能
- 支持复制上月排班
- 添加数据导入/导出功能
- 支持多个月份批量导出
- 添加排班模板功能
