import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const LoginPage = Loadable(lazy(() => import('views/Login/Login')));

// ==============================|| MAIN ROUTES ||============================== //

const LoginRoute = {
 
  children: [
    
    { path: '/login', element: <LoginPage /> }
  ]
};

export default LoginRoute;