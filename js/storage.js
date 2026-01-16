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
