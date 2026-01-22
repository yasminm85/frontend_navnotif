import { memo, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { IconLogout } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { LogOut, reset } from '../../../features/authSlice';
import { useNavigate } from 'react-router-dom';


// third party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MenuCard from './MenuCard';
import MenuList from '../MenuList';
import LogoSection from '../LogoSection';
import MiniDrawerStyled from './MiniDrawerStyled';

import useConfig from 'hooks/useConfig';
import { drawerWidth } from 'store/constant';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| SIDEBAR DRAWER ||============================== //

function Sidebar() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const { miniDrawer, mode } = useConfig();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlelogout = () => {
    Swal.fire({
      title: 'Anda Yakin Logout?',
      text: "Anda Akan Keluar Dari Halaman!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(LogOut());
        dispatch(reset());
        navigate("/pages/login");
      }
    });
  };


  const logo = useMemo(
    () => (
      <Grid container alignItems="center" spacing={1}>
        <Grid sx={{ display: 'flex', p: 2 }}><LogoSection /></Grid>
        <Grid>
          <Typography gutterBottom variant={downMD ? 'h3' : 'h2'}>
            NavNotif
          </Typography>
        </Grid>
      </Grid>

    ),
    []
  );

  const drawer = useMemo(() => {
    const drawerContent = (
      <>
        <MenuCard />
      </>
    );

    let drawerSX = { paddingLeft: '0px', paddingRight: '0px', marginTop: '20px' };
    if (drawerOpen) drawerSX = { paddingLeft: '16px', paddingRight: '16px', marginTop: '0px' };

    return (
      <>
        {downMD ? (
          <Box sx={drawerSX}>
            <MenuList />
            {drawerOpen && drawerContent}
          </Box>
        ) : (
          <PerfectScrollbar style={{ height: 'calc(100vh - 88px)', ...drawerSX }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <MenuList />
              {drawerOpen && drawerContent}

              {/* === LOGOUT BUTTON DI PALING BAWAH === */}
              <Box sx={{ mt: 'auto', mb: 1 }}>
                <ListItemButton onClick={handlelogout}>
                  <ListItemIcon>
                    <IconLogout stroke={1.5} size="20px" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </Box>
            </Box>
          </PerfectScrollbar>

        )}
      </>
    );
  }, [downMD, drawerOpen, mode]);

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: { xs: 'auto', md: drawerWidth } }} aria-label="mailbox folders">
      {downMD || (miniDrawer && drawerOpen) ? (
        <Drawer
          variant={downMD ? 'temporary' : 'persistent'}
          anchor="left"
          open={drawerOpen}
          onClose={() => handlerDrawerOpen(!drawerOpen)}
          sx={{
            '& .MuiDrawer-paper': {
              mt: downMD ? 0 : 11,
              zIndex: 1099,
              width: drawerWidth,
              bgcolor: 'background.default',
              color: 'text.primary',
              borderRight: 'none'
            }
          }}
          ModalProps={{ keepMounted: true }}
          color="inherit"
        >
          {downMD && logo}
          {drawer}
        </Drawer>
      ) : (
        <MiniDrawerStyled variant="permanent" open={drawerOpen}>
          {logo}
          {drawer}
        </MiniDrawerStyled>
      )}
    </Box>
  );
}

export default memo(Sidebar);
