import React from 'react';
import { Alert, Platform } from 'react-native';

function getToastLib(): any {
  try {
    // eslint-disable-next-line
    const mod = require('react-native-toast-message');
    return mod && mod.default ? mod.default : mod;
  } catch {
    return null;
  }
}

function extractText(node: any): string {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (typeof node === 'object' && node.props) return extractText(node.props.children);
  return '';
}

export const Toast = {
  show({ icon, content, position = 'bottom', duration = 2000 }: { icon?: 'success' | 'fail' | 'loading' | any; content: any; position?: 'top' | 'bottom' | 'center'; duration?: number; }) {
    const lib = getToastLib();
    const text = extractText(content) || '';
    if (lib && typeof lib.show === 'function') {
      const type = icon === 'success' ? 'success' : icon === 'fail' ? 'error' : 'info';
      lib.show({ type, text1: text, position, visibilityTime: duration });
      return;
    }
    const msg = text || (icon === 'success' ? 'Sucesso' : icon === 'fail' ? 'Erro' : '');
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (msg) alert(msg);
    } else {
      if (msg) Alert.alert('', msg);
    }
  },
};

export function ToastRoot() {
  const lib = getToastLib();
  if (!lib) return null;
  const Comp = (lib as any);
  const C = (Comp?.default ? Comp.default : Comp) as React.ComponentType<any>;
  return React.createElement(C);
}

export default Toast;

