import React from 'react';
import { Pressable, ActivityIndicator, View, Text, StyleSheet } from 'react-native';

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  className?: string;
  children?: React.ReactNode;
  style?: any;
};

export function Button({ onClick, disabled, loading, block, className, children, style }: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    onClick && onClick();
  };

  const content = typeof children === 'string' ? (
    <Text>{children}</Text>
  ) : (
    children
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={className}
      style={[block ? styles.block : null, style]}
    >
      <View style={[styles.rowCenter]}>
        {loading ? <ActivityIndicator color="#fff" /> : content}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  block: { width: '100%' },
  text: { fontSize: 16 },
});

