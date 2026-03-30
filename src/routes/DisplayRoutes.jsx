import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';

// halaman daftar display 
const DaftarDisplay = Loadable(lazy(() => import('views/daftar-display')));


const DisplayRoutes = {
  path: '/',
  children: [
    
    {
      path: '/daftar-display',
      element: (
            <DaftarDisplay />
      )
    },
  ]
};

export default DisplayRoutes;
