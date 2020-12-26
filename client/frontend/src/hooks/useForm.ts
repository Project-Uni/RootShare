import { useState, ChangeEvent } from 'react';

export default function useForm<T>(initialValues: T) {
  const [formFields, setFormFields] = useState(initialValues);

  const handleChange = (key: keyof T) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormFields((prev: T) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (key: keyof T) => (date: Date) => {
    setFormFields((prev: T) => ({ ...prev, [key]: date }));
  };

  const updateFields = (fields: { key: keyof T; value: any }[]) => {
    const dup = Object.assign({}, formFields);
    fields.forEach((field) => {
      dup[field.key] = field.value;
    });
    setFormFields(dup);
  };

  const resetForm = () => {
    setFormFields(initialValues);
  };

  return { formFields, handleChange, handleDateChange, updateFields, resetForm };
}
