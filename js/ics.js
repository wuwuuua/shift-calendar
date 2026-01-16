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
      'END:VEVENT'
    ];
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
