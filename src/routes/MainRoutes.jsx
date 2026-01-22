import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ProtectedRoute from './ProtectedRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// dashboard EVP
const DashboardEVP = Loadable(lazy(() => import('views/dashboard-evp')));

// Disposisi routing
const Disposisi = Loadable(lazy(() => import('views/disposisi')));

// dashboard pegawai routing
const DashboardPegawai = Loadable(lazy(() => import('views/dashboard-pegawai/Default')));

//daftar notifikasi routing
const DaftarNotifikasi = Loadable(lazy(() => import('views/daftar-notifikasi')));

// halaman kelola user
const DaftarUser = Loadable(lazy(() => import('views/users')));

// halaman kelola display 
const KelolaDisplay = Loadable(lazy(() => import('views/kelola-display')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
        <MainLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/',
      element: 
        <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: '/disposisi',
      element: (
            <ProtectedRoute allowedRoles={['admin']} > 
            <Disposisi />
            </ProtectedRoute>
      )
    },
    {
      path: '/user',
      element: (
            <ProtectedRoute allowedRoles={['admin']} > 
            <DaftarUser />
            </ProtectedRoute>
      )
    },
    {
      path: '/kelola-display',
      element: (
            <ProtectedRoute allowedRoles={['admin']} > 
            <KelolaDisplay />
            </ProtectedRoute>
      )
    },
    {
      path: '/dashboard-pegawai',
      element: (
            <ProtectedRoute allowedRoles={['pegawai']} > 
            <DashboardPegawai />
            </ProtectedRoute>
      )
    },
    {
      path: '/daftar-notifikasi',
      element: (
            <ProtectedRoute allowedRoles={['pegawai']} > 
            <DaftarNotifikasi />
            </ProtectedRoute>
      )
    },
    {
      path: '/dashboard-evp',
      element: (
            <ProtectedRoute allowedRoles={['EVP']} > 
            <DashboardEVP />
            </ProtectedRoute>
      )
    },
  ]
};

export default MainRoutes;
