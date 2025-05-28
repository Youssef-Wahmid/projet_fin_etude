import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Button,
  Chip,
  ClickAwayListener,
  Fade,
  Grid,
  Paper,
  Popper,
  Avatar,
  List,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  ListItemSecondaryAction,
  Typography,
  ListItemButton,
  CircularProgress
} from '@mui/material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import QueryBuilderTwoToneIcon from '@mui/icons-material/QueryBuilderTwoTone';
import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';
import InventoryIcon from '@mui/icons-material/Inventory';

const NotificationSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/produits');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        const noStockProducts = data.data.filter(product => 
          product.stock.quantite_disponible === 0
        );
        setOutOfStockProducts(noStockProducts);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    const interval = setInterval(fetchProducts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Button
        sx={{
          minWidth: { sm: 50, xs: 35 },
          position: 'relative'
        }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="inherit"
      >
        <NotificationsNoneTwoToneIcon sx={{ fontSize: '1.5rem' }} />
        {outOfStockProducts.length > 0 && (
          <Chip
            size="small"
            label={outOfStockProducts.length}
            color="error"
            sx={{
              position: 'absolute',
              right: -8,
              top: -8,
              height: 20,
              minWidth: 20,
              fontSize: '0.75rem'
            }}
          />
        )}
      </Button>
      
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  sx={{
                    width: '100%',
                    maxWidth: 350,
                    minWidth: 250,
                    backgroundColor: theme.palette.background.paper,
                    pb: 0,
                    borderRadius: '10px'
                  }}
                >
                  <ListSubheader disableSticky>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item>
                        <Typography variant="h6">Stock Notifications</Typography>
                      </Grid>
                      <Grid item>
                        <Chip size="small" color="error" label={`${outOfStockProducts.length} out of stock`} />
                      </Grid>
                    </Grid>
                  </ListSubheader>
                  
                  <PerfectScrollbar style={{ height: '300px', overflowX: 'hidden' }}>
                    {loading ? (
                      <Grid container justifyContent="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </Grid>
                    ) : error ? (
                      <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
                    ) : outOfStockProducts.length === 0 ? (
                      <Typography sx={{ p: 2 }}>All products are in stock.</Typography>
                    ) : (
                      outOfStockProducts.map((product) => (
                        <ListItemButton key={product.id} alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'error.light' }}>
                              <InventoryIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="subtitle1">{product.nom}</Typography>}
                            secondary={
                              <>
                                <Typography variant="body2" color="textSecondary">
                                  Ref: {product.ref}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Category: {product.categorie}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Last updated: {formatDate(product.stock.date_maj)}
                                </Typography>
                              </>
                            }
                          />
                        </ListItemButton>
                      ))
                    )}
                  </PerfectScrollbar>
                </List>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default NotificationSection;