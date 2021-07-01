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

export const appendToStateArray = (
  newItem: any,
  setItems: React.Dispatch<React.SetStateAction<any[]>>
) => {
  setItems((prevItems) => prevItems.concat(newItem));
};

export const updateFieldInStateArray = (
  compareVal: string,
  compareField: string,
  newVal: string,
  newField: string,
  setItems: React.Dispatch<React.SetStateAction<any[]>>
) => {
  setItems((prevItems) => {
    let newItems = prevItems.slice();
    for (let i = 0; i < newItems.length; i++)
      if (newItems[i][compareField] === compareVal) {
        newItems[i][newField] = newVal;
        return newItems;
      }
    return newItems;
  });
};
