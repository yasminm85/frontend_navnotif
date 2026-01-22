// src/menu-items/other.js
import { IconDashboard } from '@tabler/icons-react';

const other2 = {
  id: 'other2-group',
  type: 'group',
  title: 'Dashboard EVP',
  children: [
  {
    id: 'dashboard-evp',
    title: 'Dashboard',
    type: 'item',
    url: '/dashboard-evp',
    icon: IconDashboard,
    breadcrumbs: false,
    allowedRoles: ['EVP']
  },

  ]
};


export default other2;
