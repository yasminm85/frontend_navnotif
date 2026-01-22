import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// halaman daftar display 
const DaftarDisplay = Loadable(lazy(() => import('views/daftar-display')));

// ==============================|| MAIN ROUTING ||============================== //

const DisplayRoutes = {
  path: '/',
  children: [
    
    {
      path: '/daftar-display',
      element: (
            // <ProtectedRoute allowedRoles={['admin']} > 
            <DaftarDisplay />
            // </ProtectedRoute>
      )
    },
  ]
};

export default DisplayRoutes;
