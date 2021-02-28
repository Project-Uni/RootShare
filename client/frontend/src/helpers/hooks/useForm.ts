import { useState, ChangeEvent, useRef } from 'react';

//Docs on Typing - https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html

function createErrors<T>(initialValues: T) {
  const errors: { [key in keyof T]: string } = Object.assign(
    {},
    ...Object.keys(initialValues).map((key) => ({ [key]: '' }))
  );
  return errors;
}

export default function useForm<T>(initialValues: T) {
  const [formFields, setFormFields] = useState(initialValues);

  const initialErrors = useRef(createErrors<T>(initialValues));
  const [formErrors, setFormErrors] = useState(initialErrors.current);

  //Changes a single value from a standard input
  const handleChange = (key: keyof T) => (e: ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value;
    setFormFields((prev: T) => ({ ...prev, [key]: value }));
  };

  //Changes a single value from a material ui date input
  const handleDateChange = (key: keyof T) => (date: Date) => {
    setFormFields((prev: T) => ({ ...prev, [key]: date }));
  };

  //Changes multiple values, used for modifying arrays and setting values after API call
  const updateFields = <K extends keyof T>(fields: { key: K; value: T[K] }[]) => {
    const dup = Object.assign({}, formFields);
    fields.forEach((field) => {
      dup[field.key] = field.value;
    });
    setFormFields(dup);
  };

  //Changes multiple errors
  const updateErrors = (fields: { key: keyof T; value: string }[]) => {
    const dup = Object.assign({}, formErrors);
    fields.forEach((field) => {
      dup[field.key] = field.value;
    });
    setFormErrors(dup);
  };

  //Changes a single error back to default state
  const resetError = (key: keyof T) => {
    setFormErrors((prev) => ({ ...prev, [key]: initialErrors.current[key] }));
  };

  //Resets the entire form
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
    resetError,
  };
}
