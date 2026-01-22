// assets
import { IconDashboard } from '@tabler/icons-react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { ManageAccounts } from '@mui/icons-material';
import ViewStreamIcon from '@mui/icons-material/ViewStream';

// constant
const icons = { IconDashboard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.IconDashboard,
      allowedRoles: ['admin'],   
      breadcrumbs: false
    },
    {
      id: 'disposisi',
      title: 'Disposisi',
      type: 'item',
      url: '/disposisi',
      icon: AssignmentIcon,
      allowedRoles: ['admin'],  
      breadcrumbs: false
    },
    {
      id: 'user',
      title: 'User',
      type: 'item',
      url: '/user',
      icon: ManageAccounts,
      allowedRoles: ['admin'],  
      breadcrumbs: false
    },
    {
      id: 'kelola-display',
      title: 'Kelola Display',
      type: 'item',
      url: '/kelola-display',
      icon: ViewStreamIcon,
      allowedRoles: ['admin'],  
      breadcrumbs: false
    },

  ]
};

export default dashboard;
