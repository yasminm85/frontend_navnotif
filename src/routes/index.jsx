import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import DisplayRoutes from './DisplayRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [MainRoutes, DisplayRoutes, AuthenticationRoutes]
);

export default router;