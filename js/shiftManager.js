// js/shiftManager.js

const ShiftManager = (function() {
  const STORAGE_KEY = 'shiftTypes';
  const SHIFT_DATA_KEY = 'shiftData';
  const VERSION = 1;

  // 生成简单的 UUID
  function generateUUID() {
    return 'shift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 获取所有班次配置
  function getShiftTypes() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    try {
      const parsed = JSON.parse(data);
      return parsed;
    } catch (e) {
      console.error('Failed to parse shift types:', e);
      return null;
    }
  }

  // 保存班次配置
  function saveShiftTypes(shiftTypesData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shiftTypesData));
  }

  // 从旧的 SHIFT_TYPES 迁移数据
  function migrateFromOldFormat() {
    // 检查是否已经迁移过
    if (getShiftTypes()) {
      return;
    }

    // 从旧的 SHIFT_TYPES 常量创建默认班次
    const defaultShifts = [
      {
        id: generateUUID(),
        label: 'D',
        description: '早班',
        startTime: '08:30',
        endTime: '20:30',
        color: '#3B82F6',
        hotkey: 'd',
        isNextDay: false
      },
      {
        id: generateUUID(),
        label: 'S',
        description: '中班',
        startTime: '08:30',
        endTime: '17:30',
        color: '#F59E0B',
        hotkey: 's',
        isNextDay: false
      },
      {
        id: generateUUID(),
        label: 'N',
        description: '夜班',
        startTime: '20:30',
        endTime: '08:30',
        color: '#8B5CF6',
        hotkey: 'n',
        isNextDay: true
      },
      {
        id: generateUUID(),
        label: 'W',
        description: '休息',
        startTime: '08:30',
        endTime: '17:30',
        color: '#46945f',
        hotkey: 'w',
        isNextDay: false
      }
    ];

    // 保存新的班次配置
    saveShiftTypes({
      shifts: defaultShifts,
      version: VERSION
    });

    // 迁移现有的排班记录
    const oldData = localStorage.getItem(SHIFT_DATA_KEY);
    if (oldData) {
      try {
        const parsedOld = JSON.parse(oldData);
        const shiftMap = {};
        defaultShifts.forEach(shift => {
          shiftMap[shift.label] = shift.id;
        });

        const newData = {};
        for (const [date, shiftLabel] of Object.entries(parsedOld)) {
          if (shiftMap[shiftLabel]) {
            newData[date] = shiftMap[shiftLabel];
          }
        }

        localStorage.setItem(SHIFT_DATA_KEY, JSON.stringify(newData));
      } catch (e) {
        console.error('Failed to migrate shift data:', e);
      }
    }
  }

  // 初始化：自动迁移
  migrateFromOldFormat();

  // 公共 API
  return {
    // 获取所有班次
    getAll() {
      const data = getShiftTypes();
      return data ? data.shifts : [];
    },

    // 根据 ID 获取班次
    getById(id) {
      const shifts = this.getAll();
      return shifts.find(s => s.id === id) || null;
    },

    // 根据快捷键获取班次
    getByHotkey(key) {
      const shifts = this.getAll();
      const lowerKey = key.toLowerCase();
      return shifts.find(s => s.hotkey && s.hotkey.toLowerCase() === lowerKey) || null;
    },

    // 添加班次
    add(shiftData) {
      const data = getShiftTypes();
      if (!data) return null;

      const newShift = {
        id: generateUUID(),
        ...shiftData
      };

      data.shifts.push(newShift);
      saveShiftTypes(data);
      return newShift.id;
    },

    // 更新班次
    update(id, shiftData) {
      const data = getShiftTypes();
      if (!data) return false;

      const index = data.shifts.findIndex(s => s.id === id);
      if (index === -1) return false;

      data.shifts[index] = {
        ...data.shifts[index],
        ...shiftData,
        id: id // 保持 ID 不变
      };

      saveShiftTypes(data);
      return true;
    },

    // 删除班次
    delete(id) {
      const data = getShiftTypes();
      if (!data) return false;

      const index = data.shifts.findIndex(s => s.id === id);
      if (index === -1) return false;

      data.shifts.splice(index, 1);
      saveShiftTypes(data);

      // 清除使用该班次的排班记录
      const shiftData = JSON.parse(localStorage.getItem(SHIFT_DATA_KEY) || '{}');
      let modified = false;
      for (const date in shiftData) {
        if (shiftData[date] === id) {
          delete shiftData[date];
          modified = true;
        }
      }
      if (modified) {
        localStorage.setItem(SHIFT_DATA_KEY, JSON.stringify(shiftData));
      }

      return true;
    },

    // 检查快捷键冲突
    isHotkeyConflict(hotkey, excludeId) {
      if (!hotkey) return false;

      const shifts = this.getAll();
      const lowerKey = hotkey.toLowerCase();

      return shifts.some(s =>
        s.hotkey &&
        s.hotkey.toLowerCase() === lowerKey &&
        s.id !== excludeId
      );
    },

    // 获取所有快捷键
    getAllHotkeys() {
      const shifts = this.getAll();
      const hotkeys = {};
      shifts.forEach(s => {
        if (s.hotkey) {
          hotkeys[s.hotkey.toLowerCase()] = s;
        }
      });
      return hotkeys;
    },

    // 重新执行迁移（用于测试）
    _migrateFromOldFormat: migrateFromOldFormat
  };
})();
