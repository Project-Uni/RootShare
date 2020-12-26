import { useState, ChangeEvent, useRef } from 'react';

function createErrors<T, K>(values: T) {
  const errors: { [key: string]: any } = {};
  Object.keys(values).forEach((key) => {
    errors[key] = '';
  });
  return errors as K;
}

export default function useForm<T, K>(initialValues: T) {
  const [formFields, setFormFields] = useState(initialValues);

  const initialErrors = useRef(createErrors<T, K>(initialValues));
  const [formErrors, setFormErrors] = useState(initialErrors.current);

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

  const updateErrors = (fields: { key: keyof K; value: any }[]) => {
    const dup = Object.assign({}, formErrors);
    fields.forEach((field) => {
      dup[field.key] = field.value;
    });
    setFormErrors(dup);
  };

  const resetForm = () => {
    setFormFields(initialValues);
    setFormErrors(initialErrors.current);
  };

  return {
    formFields,
    formErrors,
    handleChange,
    handleDateChange,
    updateFields,
    updateErrors,
    resetForm,
  };
}
