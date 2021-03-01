import React, { useState } from 'react';

type Props = {
  value?: string;
  onChange: (e: React.ChangeEvent<{ value: unknown }>) => void;
  children: React.ReactElement;
};

const addParensLen = '9999'.length;
const addDashLen = '(999) 9999'.length;

export const PhoneMask = (props: Props) => {
  const { value, onChange, children } = props;

  const [childValue, setChildValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<{ value: string }>) => {
    const { value } = e.target;
    const { length } = value;

    if (length === addParensLen && isDigit(value.charAt(length - 1)))
      setChildValue((prev) => `(${prev}) ${value.charAt(length - 1)}`);
    else if (length === addDashLen && isDigit(value.charAt(length - 1)))
      setChildValue((prev) => `${prev}-${value.charAt(length - 1)}`);
    else setChildValue(value);

    onChange({
      target: { value: e.target.value.replace(/\D/g, '') },
    } as React.ChangeEvent<{ value: unknown }>);
  };

  const childClone = React.cloneElement(children, {
    value: childValue,
    onChange: handleChange,
  });

  return childClone;
};

const isDigit = (str: string) => /^\d+$/.test(str);
