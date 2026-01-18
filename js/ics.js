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

    // 解析时间并生成DTSTART和DTEND
    const timeRange = this.parseTimeRange(shift, shiftInfo.time, dateStr);

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${timeRange.start}`,
      `DTEND:${timeRange.end}`,
      `SUMMARY:${shiftInfo.label}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT35M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT'
    ];
  },

  parseTimeRange(shift, timeStr, dateStr) {
    const [year, month, day] = dateStr.split('-');
    let startDate, endDate, startTime, endTime;

    switch(shift) {
      case 'D':
        startDate = `${year}${month}${day}`;
        startTime = '083000';
        endDate = `${year}${month}${day}`;
        endTime = '203000';
        break;
      case 'S':
        startDate = `${year}${month}${day}`;
        startTime = '083000';
        endDate = `${year}${month}${day}`;
        endTime = '173000';
        break;
      case 'N':
        startDate = `${year}${month}${day}`;
        startTime = '203000';
        endDate = this.getNextDay(dateStr);
        endTime = '083000';
        break;
      case 'W':
        startDate = `${year}${month}${day}`;
        startTime = '083000';
        endDate = `${year}${month}${day}`;
        endTime = '173000';
        break;
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
