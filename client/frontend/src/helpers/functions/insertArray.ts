export const insertArray = <T>(array: T[], index: number, item: T) => {
  array.splice(index, 0, item);
};
