import { memo, useState } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItems from 'menu-items';

import { useGetMenuMaster } from 'api/menu';
import { useSelector } from 'react-redux';

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');

  // Ambil role user dari Redux
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role;

  // FILTER MENU — robust untuk berbagai struktur menu
  const filteredMenu = menuItems.items
    .map((group) => {
      // jika group tidak punya children => treat sebagai single item group
      if (!group.children) {
        const visible = !group.allowedRoles || group.allowedRoles.includes(userRole);
        return visible ? group : null;
      }

      // filter children berdasarkan allowedRoles (default: tampil jika allowedRoles tidak ada)
      const filteredChildren = group.children.filter(
        (child) => !child.allowedRoles || child.allowedRoles.includes(userRole)
      );

      // tampilkan group jika after filter children masih ada
      if (filteredChildren.length === 0) return null;

      return { ...group, children: filteredChildren };
    })
    .filter(Boolean);

  // original logic adapt ke filteredMenu
  const lastItem = null;
  let lastItemIndex = filteredMenu.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < filteredMenu.length) {
    lastItemId = filteredMenu[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = filteredMenu.slice(lastItem - 1, filteredMenu.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && { url: item.url })
    }));
  }

  const navItems = filteredMenu.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        // group yang punya url (single item group)
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              {index !== 0 && <Divider sx={{ py: 0.5 }} />}
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );

      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
