import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

type InputProps = {
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'password';
  className?: string;
  maxLength?: number;
  inputMode?: string;
  style?: any;
};

export function Input({ value, onChange, disabled, placeholder, type = 'text', className, maxLength, inputMode, style }: InputProps) {
  const keyboardType = inputMode === 'numeric' ? 'numeric' : 'default';
  return (
    <TextInput
      value={value}
      onChangeText={(t) => onChange && onChange(t)}
      editable={!disabled}
      placeholder={placeholder}
      secureTextEntry={type === 'password'}
      className={className}
      maxLength={maxLength}
      keyboardType={keyboardType as any}
      style={[styles.base, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: '#111827', fontSize: 16 },
});

