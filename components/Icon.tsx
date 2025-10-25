import Svg, { Path } from 'react-native-svg';

export type IconName =
  | 'users' | 'folder' | 'monitor' | 'user'
  | 'chevronLeft' | 'chevronRight'
  | 'logOut' | 'settings'
  | 'edit' | 'trash' | 'plus'
  | 'search' | 'filter' | 'x' | 'calendar' | 'clock'
  | 'menu'
  | 'creditCard'
  | 'eye' | 'eyeOff';

const icons: Partial<Record<IconName, string>> = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  clock: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2',
  logOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 12h18M3 6h18M3 18h18',
  x: 'M18 6 6 18M6 6l12 12',
  plus: 'M12 5v14M5 12h14',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M3 3l18 18'
};

export function Icon({ name, size = 18, color = '#000', strokeWidth = 1.75 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const d = icons[name] || icons['x'] || '';
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={d as string} />
    </Svg>
  );
}