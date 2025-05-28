import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';
const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const SettingPage = Loadable(lazy(() => import('views/profile/Setting')));
// ==============================|| MAIN ROUTES ||============================== //
const ParametresRoute = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: '/dashboard/default',
      element: <DashboardDefault />
    },
    { path: '/parametres', element: <SettingPage /> }
  ]
};

export default ParametresRoute;
