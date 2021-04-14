import dayjs from 'dayjs';

export const formatTimestamp = (timestamp: string | Date, format: string) => {
  try {
    return dayjs(timestamp).format(format);
  } catch (err) {
    return 'NA';
  }
};
