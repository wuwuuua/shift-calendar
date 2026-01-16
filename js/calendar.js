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

function updateSelectors() {
  document.getElementById('yearSelect').value = currentYear;
  document.getElementById('monthSelect').value = currentMonth;
}

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

  // 导出按钮
  document.getElementById('exportBtn').addEventListener('click', () => {
    ICS.download(currentYear, currentMonth);
  });
}
