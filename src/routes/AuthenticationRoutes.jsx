import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

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
