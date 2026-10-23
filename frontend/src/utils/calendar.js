// Helpers for dates and "Add to calendar" links (all-day events, no account needed).

const pad = (n) => String(n).padStart(2, '0');

// Today's date as YYYY-MM-DD in the visitor's own time zone (used as the minimum plan date).
export function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const compact = (dateStr) => dateStr.replace(/-/g, '');

// All-day events end on the following day (the end date is exclusive).
function nextDay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const n = new Date(y, m - 1, d + 1);
  return `${n.getFullYear()}${pad(n.getMonth() + 1)}${pad(n.getDate())}`;
}

export function googleCalendarUrl({ title, date, details }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${compact(date)}/${nextDay(date)}`,
    details
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcs({ title, date, details }) {
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bokundara Trails//Day-Visit Planner//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@bokundara-trails`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(date)}`,
    `DTEND;VALUE=DATE:${nextDay(date)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(details)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadIcs(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}