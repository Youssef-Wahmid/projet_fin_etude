import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';
const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const ProfilePage = Loadable(lazy(() => import('views/profile/Profile')));
// ==============================|| MAIN ROUTES ||============================== //

const ProfileRoute = {
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
    { path: '/prolfile', element: <ProfilePage /> }
  ]
};

export default ProfileRoute;
