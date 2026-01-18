// js/shiftManagement.js

(function() {
  // 预设颜色
  const PRESET_COLORS = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#46945f'
  ];

  // 当前编辑的班次 ID
  let editingShiftId = null;

  // 初始化
  document.addEventListener('DOMContentLoaded', () => {
    initModals();
    initColorOptions();
    initForm();
    bindEvents();
  });

  // 初始化模态框
  function initModals() {
    const managementModal = document.getElementById('shiftManagementModal');
    const formModal = document.getElementById('shiftFormModal');

    // 点击背景关闭
    managementModal.addEventListener('click', (e) => {
      if (e.target === managementModal) {
        closeManagementModal();
      }
    });

    formModal.addEventListener('click', (e) => {
      if (e.target === formModal) {
        closeFormModal();
      }
    });
  }

  // 初始化颜色选项
  function initColorOptions() {
    const colorOptions = document.getElementById('colorOptions');
    const shiftColor = document.getElementById('shiftColor');

    PRESET_COLORS.forEach((color, index) => {
      const option = document.createElement('div');
      option.className = `color-option color-preset-${index + 1}`;
      option.dataset.color = color;
      option.addEventListener('click', () => {
        selectColor(color);
      });
      colorOptions.appendChild(option);
    });

    // 颜色选择器变化时更新选项
    shiftColor.addEventListener('input', (e) => {
      selectColor(e.target.value);
    });
  }

  // 选择颜色
  function selectColor(color) {
    const shiftColor = document.getElementById('shiftColor');
    const options = document.querySelectorAll('.color-option');

    shiftColor.value = color;
    options.forEach(option => {
      if (option.dataset.color === color) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  // 初始化表单
  function initForm() {
    const shiftForm = document.getElementById('shiftForm');
    const startTime = document.getElementById('shiftStartTime');
    const endTime = document.getElementById('shiftEndTime');
    const hotkeyInput = document.getElementById('shiftHotkey');

    // 时间变化时自动设置跨天选项
    const checkNextDay = () => {
      if (startTime.value && endTime.value) {
        const isNextDay = endTime.value < startTime.value;
        document.getElementById('shiftIsNextDay').checked = isNextDay;
      }
    };

    startTime.addEventListener('change', checkNextDay);
    endTime.addEventListener('change', checkNextDay);

    // 快捷键输入处理
    hotkeyInput.addEventListener('input', (e) => {
      let value = e.target.value.toUpperCase();

      // 只允许字母和数字
      value = value.replace(/[^A-Z0-9]/g, '');
      e.target.value = value;

      // 检查冲突
      checkHotkeyConflict(value);
    });

    // 表单提交
    shiftForm.addEventListener('submit', handleFormSubmit);
  }

  // 检查快捷键冲突
  function checkHotkeyConflict(hotkey) {
    const warning = document.getElementById('hotkeyConflict');
    const submitBtn = document.querySelector('.btn-submit');

    if (!hotkey) {
      warning.style.display = 'none';
      submitBtn.disabled = false;
      return;
    }

    const conflict = ShiftManager.isHotkeyConflict(hotkey, editingShiftId);
    if (conflict) {
      const conflictShift = ShiftManager.getByHotkey(hotkey);
      warning.textContent = `该快捷键已被 "${conflictShift.label}" 使用`;
      warning.style.display = 'flex';
      submitBtn.disabled = true;
    } else {
      warning.style.display = 'none';
      submitBtn.disabled = false;
    }
  }

  // 绑定事件
  function bindEvents() {
    // 班次管理按钮
    document.getElementById('manageShiftsBtn').addEventListener('click', () => {
      openManagementModal();
    });

    // 关闭按钮
    document.getElementById('closeModalBtn').addEventListener('click', closeManagementModal);
    document.getElementById('closeFormModalBtn').addEventListener('click', closeFormModal);

    // 添加班次按钮
    document.getElementById('addShiftBtn').addEventListener('click', () => {
      openAddForm();
    });

    // 取消按钮
    document.getElementById('cancelBtn').addEventListener('click', closeFormModal);
  }

  // 打开班次管理弹窗
  function openManagementModal() {
    renderShiftsList();
    document.getElementById('shiftManagementModal').classList.add('active');
  }

  // 关闭班次管理弹窗
  function closeManagementModal() {
    document.getElementById('shiftManagementModal').classList.remove('active');
  }

  // 渲染班次列表
  function renderShiftsList() {
    const shiftsList = document.getElementById('shiftsList');
    const shifts = ShiftManager.getAll();

    if (shifts.length === 0) {
      shiftsList.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 40px;">暂无班次，点击下方按钮添加</p>';
      return;
    }

    shiftsList.innerHTML = shifts.map(shift => `
      <div class="shift-card">
        <div class="shift-card-color" style="background: ${shift.color}"></div>
        <div class="shift-card-info">
          <div class="shift-card-label">${escapeHtml(shift.label)}</div>
          ${shift.description ? `<div class="shift-card-description">${escapeHtml(shift.description)}</div>` : ''}
          <div class="shift-card-time">
            ${formatTimeRange(shift)}
            ${shift.hotkey ? `<span class="shift-card-hotkey">快捷键: ${shift.hotkey.toUpperCase()}</span>` : ''}
          </div>
        </div>
        <div class="shift-card-actions">
          <button class="btn-icon" onclick="ShiftManagement.edit('${shift.id}')" title="编辑">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-icon delete" onclick="ShiftManagement.delete('${shift.id}')" title="删除">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  // 格式化时间范围
  function formatTimeRange(shift) {
    const start = shift.startTime;
    const end = shift.endTime;
    if (shift.isNextDay) {
      return `${start} - ${end} (次日)`;
    }
    return `${start} - ${end}`;
  }

  // 转义 HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 打开添加表单
  function openAddForm() {
    editingShiftId = null;
    document.getElementById('shiftFormTitle').textContent = '添加班次';
    document.getElementById('shiftForm').reset();
    document.getElementById('shiftId').value = '';
    selectColor(PRESET_COLORS[3]); // 默认蓝色
    document.getElementById('shiftStartTime').value = '08:00';
    document.getElementById('shiftEndTime').value = '17:00';
    document.getElementById('hotkeyConflict').style.display = 'none';
    document.querySelector('.btn-submit').disabled = false;

    document.getElementById('shiftFormModal').classList.add('active');
  }

  // 打开编辑表单
  function openEditForm(shiftId) {
    const shift = ShiftManager.getById(shiftId);
    if (!shift) return;

    editingShiftId = shiftId;
    document.getElementById('shiftFormTitle').textContent = '编辑班次';
    document.getElementById('shiftId').value = shift.id;
    document.getElementById('shiftLabel').value = shift.label;
    document.getElementById('shiftDescription').value = shift.description || '';
    document.getElementById('shiftStartTime').value = shift.startTime;
    document.getElementById('shiftEndTime').value = shift.endTime;
    document.getElementById('shiftIsNextDay').checked = shift.isNextDay;
    document.getElementById('shiftHotkey').value = shift.hotkey || '';
    selectColor(shift.color);

    checkHotkeyConflict(shift.hotkey);

    document.getElementById('shiftFormModal').classList.add('active');
  }

  // 关闭表单弹窗
  function closeFormModal() {
    document.getElementById('shiftFormModal').classList.remove('active');
    editingShiftId = null;
  }

  // 处理表单提交
  function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
      label: document.getElementById('shiftLabel').value.trim(),
      description: document.getElementById('shiftDescription').value.trim(),
      startTime: document.getElementById('shiftStartTime').value,
      endTime: document.getElementById('shiftEndTime').value,
      isNextDay: document.getElementById('shiftIsNextDay').checked,
      color: document.getElementById('shiftColor').value,
      hotkey: document.getElementById('shiftHotkey').value.toLowerCase() || null
    };

    if (editingShiftId) {
      // 更新
      ShiftManager.update(editingShiftId, formData);
      showToast('班次已更新');
    } else {
      // 添加
      ShiftManager.add(formData);
      showToast('班次已添加');
    }

    closeFormModal();
    renderShiftsList();

    // 刷新日历以显示更改
    if (typeof renderCalendar === 'function') {
      renderCalendar();
    }
  }

  // 删除班次
  function deleteShift(shiftId) {
    const shift = ShiftManager.getById(shiftId);
    if (!shift) return;

    if (confirm(`确定要删除班次 "${shift.label}" 吗？使用该班次的排班记录也会被清除。`)) {
      ShiftManager.delete(shiftId);
      showToast('班次已删除');
      renderShiftsList();

      // 刷新日历
      if (typeof renderCalendar === 'function') {
        renderCalendar();
      }
    }
  }

  // 显示提示消息
  function showToast(message) {
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

  // 导出到全局
  window.ShiftManagement = {
    edit: openEditForm,
    delete: deleteShift
  };
})();
