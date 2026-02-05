// src/menu-items/other.js
import { IconDashboard } from '@tabler/icons-react';
import FeedbackIcon from '@mui/icons-material/Feedback';

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
  {
      id: 'dashboard-tindak-lanjut',
      title: 'Dashboard Tindak Lanjut',
      type: 'item',
      url: '/dashboard-tindak-lanjut',
      icon: FeedbackIcon,
      breadcrumbs: false,
      allowedRoles: ['EVP']
    },

  ]
};


export default other2;
