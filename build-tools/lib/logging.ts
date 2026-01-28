const emojiMap = {
  info: '',
  warn: '⚠️ ',
  error: '❌ ',
};

export function log(
  message: string,
  level: 'info' | 'warn' | 'error' = 'info',
): void {
  console[level](`${emojiMap[level]}${message}`);
}
