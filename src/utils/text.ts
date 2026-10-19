/**Quita espacios al inicio y al final, unifica los espacios dobles.*/
export const normalizeText = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;