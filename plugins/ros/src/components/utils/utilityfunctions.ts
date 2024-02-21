export function generateRandomId(): string {
  return [...Array(3)]
    .map(() => {
      const randomChar = Math.random().toString(36)[2];
      return Math.random() < 0.5 ? randomChar.toUpperCase() : randomChar;
    })
    .join('');
}

const formatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
});

export function formatNOK(amount: number): string {
  return formatter.format(amount);
}
