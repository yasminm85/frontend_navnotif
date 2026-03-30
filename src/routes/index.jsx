import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import DisplayRoutes from './DisplayRoutes';


const router = createBrowserRouter(
  [MainRoutes, DisplayRoutes, AuthenticationRoutes]
);

export default router;