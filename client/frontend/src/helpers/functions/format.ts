import { weekDict, monthDict } from '../constants/date';

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

export function formatDatePretty(date: Date) {
  const monthName = monthDict[date.getMonth()];
  return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getConversationTime(date: Date) {
  const now = new Date();
  const messageYear = date.getFullYear();
  const messageMonth = date.getMonth();
  const messageDate = date.getDate();
  const currDate = now.getDate();
  if (messageYear !== now.getFullYear()) return messageYear.toString();
  else if (messageMonth !== now.getMonth()) return monthDict[messageMonth];
  else if (currDate - messageDate >= 7) return `${messageMonth + 1}/${messageDate}`;
  else if (currDate - messageDate > 1) return weekDict[date.getDay()];
  else if (messageDate !== currDate) return 'Yesterday';
  else return formatTime(date);
}

export function formatPhoneNumber(pn: string) {
  if (!pn) return '';
  if (pn.length < 10 || pn.length > 11) return pn;
  if (pn.length === 10)
    return `(${pn.substr(0, 3)}) ${pn.substr(3, 3)}-${pn.substr(6, 4)}`;
  return `+${pn.charAt(0)} (${pn.substr(1, 3)}) ${pn.substr(4, 3)}-${pn.substr(
    7,
    4
  )}`;
}
