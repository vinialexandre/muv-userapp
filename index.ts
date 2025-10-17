import { registerRootComponent } from 'expo';

import App from './App';
if (typeof document !== 'undefined') {
  import('antd-mobile').then(({ unstableSetRender }) => {
    import('react-dom/client').then(({ createRoot }) => {
      unstableSetRender((node: any, container: any) => {
        container._reactRoot ||= createRoot(container);
        const root = container._reactRoot;
        root.render(node);
        return async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
          root.unmount();
        };
      });
    });
  });
}


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
