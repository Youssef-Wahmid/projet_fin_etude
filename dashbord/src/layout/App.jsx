import React, { useEffect, useState } from 'react';

// material-ui
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// third-party
import { useSelector } from 'react-redux';

// project import
import theme from 'themes';
import Routes from 'routes/index';
import NavigationScroll from './NavigationScroll';
import { BASE_URL, getHeaders } from 'config/config';
import axios from 'axios';
import { AuthContext } from 'context/AuthContext';

// ==============================|| APP ||============================== //

const App = () => {
  const customization = useSelector((state) => state.customization);
  //! ===
  const [AccessToken, setAccessToken] = useState(JSON.parse(localStorage.getItem("currentToken")));
  const [currentUser, setcurrentUser] = useState({});
  useEffect(() => {
      
          const fetchUser = async () => {
            try {
              const response = await axios.get(`${BASE_URL}/v1/profile`, getHeaders(AccessToken));
              console.log('User data:', response.data.user);
              setcurrentUser(response.data.user);
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          };
        if (AccessToken)   fetchUser();
        
    }, [AccessToken]);

  //! ===


  return (
    <>
      {
        <NavigationScroll>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme(customization)}>
              <CssBaseline />
                  <AuthContext.Provider value={{ AccessToken, setAccessToken, currentUser, setcurrentUser }}>
                    <Routes />
                  </AuthContext.Provider>
            </ThemeProvider>
          </StyledEngineProvider>
        </NavigationScroll>
      }
    </>
  );
};

export default App;
