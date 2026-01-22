// src/layout/MainLayout/MiniDrawerStyled.jsx
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import { drawerWidth } from 'store/constant';

const MiniDrawerStyled = styled(Drawer)(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : 72,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard
    }),
    overflowX: 'hidden'
  }
}));

export default MiniDrawerStyled;
