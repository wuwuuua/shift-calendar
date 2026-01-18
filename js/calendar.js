// js/calendar.js

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

// 记录当前按住的键
let pressedKey = null;

// 获取当前班次顺序（用于循环切换）
function getShiftOrder() {
  const shifts = ShiftManager.getAll();
  return shifts.map(s => s.id).concat([null]);
}

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
    const shiftId = Storage.getShift(dateStr);
    const shift = shiftId ? ShiftManager.getById(shiftId) : null;

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
      shiftBadge.textContent = shift.label;
      shiftBadge.style.backgroundColor = shift.color;
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
  const allShifts = ShiftManager.getAll();
  const stats = {};

  // 初始化统计
  allShifts.forEach(shift => {
    stats[shift.id] = { count: 0, label: shift.label };
  });

  // 统计各班次数量
  Object.values(shifts).forEach(shiftId => {
    if (stats[shiftId]) {
      stats[shiftId].count++;
    }
  });

  // 生成统计 HTML
  const statsHtml = Object.values(stats)
    .filter(s => s.count > 0)
    .map(s => `${s.label}: ${s.count}天`)
    .join(' | ');

  document.getElementById('stats').innerHTML = statsHtml || '本月暂无排班';
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

    // 如果按住了快捷键，直接设置为对应班次
    if (pressedKey) {
      const shift = ShiftManager.getByHotkey(pressedKey);
      if (shift) {
        Storage.setShift(dateStr, shift.id);
      }
    } else {
      // 否则按原逻辑循环切换
      const currentShiftId = Storage.getShift(dateStr);
      const shiftOrder = getShiftOrder();
      const currentIndex = shiftOrder.indexOf(currentShiftId);
      const nextIndex = (currentIndex + 1) % shiftOrder.length;
      const nextShiftId = shiftOrder[nextIndex];
      Storage.setShift(dateStr, nextShiftId);
    }

    renderCalendar();
  });

  // 键盘事件监听
  document.addEventListener('keydown', (e) => {
    // 忽略在表单输入中的按键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key.toUpperCase();
    const shift = ShiftManager.getByHotkey(key);
    if (shift) {
      pressedKey = key;
      e.preventDefault(); // 防止快捷键触发其他操作
    }
  });

  document.addEventListener('keyup', (e) => {
    const key = e.key.toUpperCase();
    if (key === pressedKey) {
      pressedKey = null;
    }
  });

  // 导出按钮
  document.getElementById('exportBtn').addEventListener('click', () => {
    ICS.download(currentYear, currentMonth);
  });

  // 清空数据按钮
  document.getElementById('clearBtn').addEventListener('click', () => {
    const hasData = Object.keys(Storage.getAll()).length > 0;
    if (!hasData) {
      alert('当前没有数据可以清空');
      return;
    }

    if (confirm('确定要清空所有排班数据吗？此操作不可恢复！')) {
      Storage.clear();
      renderCalendar();

      // 显示成功提示
      showToast('数据已清空');
    }
  });
}

// 显示提示消息
function showToast(message) {
  // 移除已存在的提示
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
