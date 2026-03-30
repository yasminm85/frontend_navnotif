import { RouterProvider } from 'react-router-dom';
import router from 'routes';
import { Provider } from 'react-redux';
import {store} from './app/store';
import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes';


export default function App() {
  return (
    <Provider store={store}>
    <ThemeCustomization>
      <NavigationScroll>
        <>
          <RouterProvider router={router} />
        </>
      </NavigationScroll>
    </ThemeCustomization>
    </Provider>
  );
}



