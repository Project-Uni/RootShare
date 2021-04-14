export function invalidInputsMessage(fields: string[]) {
  return `[ERROR] Invalid Inputs\n
  [REQUIRED FIELDS] ${fields.join(', ')}
  `;
}
