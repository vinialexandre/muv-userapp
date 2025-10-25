import React from 'react';
import { Platform, Modal, View, Pressable, StyleSheet } from 'react-native';

type PopupProps = {
  visible: boolean;
  onMaskClick?: () => void;
  position?: 'bottom' | 'top' | 'center';
  bodyStyle?: any;
  children?: React.ReactNode;
};

export function Popup({ visible, onMaskClick, position = 'bottom', bodyStyle, children }: PopupProps) {
  if (Platform.OS !== 'web') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType={position === 'bottom' ? 'slide' : 'fade'}
        onRequestClose={onMaskClick}
      >
        <Pressable style={styles.mask} onPress={onMaskClick} />
        <View style={[styles.container, position === 'bottom' ? styles.bottom : styles.center, bodyStyle]}>
          {children}
        </View>
      </Modal>
    );
  }

  if (!visible) return null;
  return (
    <div style={stylesWeb.root as any}>
      <button style={stylesWeb.mask as any} onClick={onMaskClick} aria-label="Fechar" />
      <div style={{ ...(stylesWeb.container as any), ...(position === 'bottom' ? stylesWeb.bottom : stylesWeb.center), ...(bodyStyle || {}) }}>
        {children}
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  mask: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' } as any,
  container: { position: 'absolute', left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90%' } as any,
  bottom: { bottom: 0 },
  center: { top: '15%', marginHorizontal: 16, borderRadius: 16 },
});

const stylesWeb = {
  root: { position: 'fixed', inset: 0, zIndex: 50 } as React.CSSProperties,
  mask: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', border: 'none', padding: 0, margin: 0 } as React.CSSProperties,
  container: { position: 'absolute', left: 0, right: 0, background: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'auto' } as React.CSSProperties,
  bottom: { bottom: 0 } as React.CSSProperties,
  center: { top: '15%', marginLeft: 16, marginRight: 16, borderRadius: 16 } as React.CSSProperties,
};

