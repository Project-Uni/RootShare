export const removeFromStateArray = (
  compareVal: string,
  fieldName: string,
  setItems: React.Dispatch<React.SetStateAction<any[]>>
) => {
  setItems((prevItems) => {
    let newItems = prevItems.slice();
    for (let i = 0; i < newItems.length; i++)
      if (newItems[i][fieldName] === compareVal) {
        newItems.splice(i, 1);
        return newItems;
      }
    return newItems;
  });
};
