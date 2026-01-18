// js/ics.js

const ICS = {
  generate(year, month) {
    const shifts = Storage.getMonthShifts(year, month);
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ShiftCalendar//CN'];

    Object.entries(shifts).forEach(([dateStr, shiftId]) => {
      const shift = ShiftManager.getById(shiftId);
      if (shift) {
        const event = this.createEvent(dateStr, shift);
        lines.push(...event);
      }
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  },

  createEvent(dateStr, shift) {
    const uid = `${dateStr}-${shift.id}@shiftcalendar`;
    const [year, month, day] = dateStr.split('-').map(s => s.padStart(2, '0'));

    // 解析时间并生成DTSTART和DTEND
    const timeRange = this.parseTimeRange(shift, dateStr);

    const summary = shift.description
      ? `${shift.label} - ${shift.description}`
      : shift.label;

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${timeRange.start}`,
      `DTEND:${timeRange.end}`,
      `SUMMARY:${summary}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT35M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT'
    ];
  },

  parseTimeRange(shift, dateStr) {
    const [year, month, day] = dateStr.split('-').map(s => s.padStart(2, '0'));
    const startDate = `${year}${month}${day}`;

    // 格式化时间 (HH:MM -> HHMMSS)
    const formatTime = (time) => time.replace(':', '') + '00';

    const startTime = formatTime(shift.startTime);
    let endDate = startDate;
    let endTime = formatTime(shift.endTime);

    // 如果跨天，结束日期加一天
    if (shift.isNextDay) {
      endDate = this.getNextDay(dateStr);
    }

    return {
      start: `${startDate}T${startTime}`,
      end: `${endDate}T${endTime}`
    };
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
