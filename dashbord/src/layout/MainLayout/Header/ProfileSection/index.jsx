import React, { useContext } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Fade, Button, ClickAwayListener, Paper, Popper, List, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';

// assets
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MeetingRoomTwoToneIcon from '@mui/icons-material/MeetingRoomTwoTone';
import { useNavigate } from 'react-router';
import { AuthContext } from 'context/AuthContext';
import { BASE_URL, getHeaders } from 'config/config';
import axios from 'axios';

// ==============================|| PROFILE SECTION ||============================== //

const ProfileSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };


 const {  AccessToken, setAccessToken, setcurrentUser } = useContext(AuthContext);

  const handleLogout = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/logout`,null, getHeaders(AccessToken))
    localStorage.removeItem("currentToken");
    setAccessToken('');
    setcurrentUser(null);
    console.log('Logout response:', response.data);
    navigate('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Button
        sx={{ minWidth: { sm: 50, xs: 35 } }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        aria-label="Profile"
        onClick={handleToggle}
        color="inherit"
      >
        <AccountCircleTwoToneIcon sx={{ fontSize: '1.5rem' }} />
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
          },
          {
            name: 'preventOverflow',
            options: {
              altAxis: true
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
                  
                  <ListItemButton selected={selectedIndex === 1} onClick={(event) =>{ handleListItemClick(event, 1); navigate('/prolfile'); }}>
                    <ListItemIcon>
                      <PersonTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                  </ListItemButton>


                  <ListItemButton selected={selectedIndex === 2} onClick={(event) =>{ handleListItemClick(event, 2); handleLogout(); }}>
                    <ListItemIcon>
                      <MeetingRoomTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </List>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default ProfileSection;
