import { Platform } from 'react-native';

export type NavFn = (path: string) => void;

let setRoute: NavFn | null = null;

export const Router = {
  setNavigator(fn: NavFn) {
    setRoute = fn;
  },
  navigate(path: string) {
    if (Platform.OS === 'web') {
      (window as any).location.href = path;
    } else if (setRoute) {
      setRoute(path);
    }
  },
};

export default Router;

