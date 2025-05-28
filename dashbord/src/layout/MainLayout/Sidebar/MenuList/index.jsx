// MenuList.jsx
import React from 'react';
import { Typography } from '@mui/material';
import NavGroup from './NavGroup';
import useMenuItems from 'hooks/useMenuItems'; // Update path as needed

const MenuList = () => {
  const { items } = useMenuItems();
  
  const navItems = items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <>{navItems}</>;
};

export default MenuList;