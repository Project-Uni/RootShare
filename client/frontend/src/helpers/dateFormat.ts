export const monthDict = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const weekDict = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function formatTime(date: Date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  let minutesString = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutesString + ' ' + ampm;

  return strTime;
}

export function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function getConversationTime(date: Date) {
  const now = new Date();
  const messageYear = date.getFullYear();
  const messageMonth = date.getMonth();
  const messageDate = date.getDate();
  const currDate = now.getDate();
  if (messageYear !== now.getFullYear()) return messageYear.toString();
  else if (messageMonth !== now.getMonth()) return monthDict[messageMonth];
  else if (currDate - messageDate >= 7) return `${messageMonth}/${messageDate}`;
  else if (currDate - messageDate > 1) return weekDict[date.getDay()];
  else if (messageDate !== currDate) return 'Yesterday';
  else return formatTime(date);
}
