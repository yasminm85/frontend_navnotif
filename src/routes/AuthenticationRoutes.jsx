import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const ResetPassword = Loadable(lazy(() => import('views/pages/authentication/reset-password')));



const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/pages/login',
      element: <LoginPage />
    },
    {
      path: '/reset-password',
      element: (
          <ResetPassword />
      )
    },
    
  ]
};

export default AuthenticationRoutes;
