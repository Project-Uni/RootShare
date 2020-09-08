const fs = require('fs');

const LOGS_DIRECTORY = '../logs';

const buffer = [];
const MAX_BUFFER_LEN = 5;

export function log(title: string, message: string) {
  if (process.env.NODE_ENV === 'dev')
    return console.log(`[${title.toUpperCase()}] ${message}`);
  writeLogToFile(`[${title.toUpperCase()}] ${message}`);
}

export async function initializeDirectory() {
  console.log(`[INFO] Initializing log directory`);
  try {
    await fs.promises.access(LOGS_DIRECTORY);
  } catch (DNEError) {
    fs.mkdirSync(LOGS_DIRECTORY);
  }
}

function writeLogToFile(message: string) {
  const currentDate = new Date();
  const month = pad(currentDate.getMonth());
  const day = pad(currentDate.getDate());
  const year = pad(currentDate.getFullYear());

  const hours = pad(currentDate.getHours());
  const minutes = pad(currentDate.getMinutes());
  const seconds = pad(currentDate.getSeconds());

  const fileName = `logs_${month}-${day}-${year}.txt`;
  const timestamp = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;

  const timeStampedMessage = `[${timestamp}] ${message}\n`;
  buffer.push(timeStampedMessage);

  if (buffer.length === MAX_BUFFER_LEN) {
    fs.appendFile(`${LOGS_DIRECTORY}/${fileName}`, buffer.join(''), () => {});
    buffer.splice(0, buffer.length);
  }
}

function pad(n) {
  return n < 10 ? '0' + n : n;
}
