import { useState, ChangeEvent } from 'react';

export default function useForm<T>(initialValues: T) {
  const [formFields, setFormFields] = useState(initialValues);

  const handleChange = (key: keyof T) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormFields((prev: T) => ({ ...prev, [key]: value }));
  };

  return { formFields, handleChange };
}
