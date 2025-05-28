import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const ClientePage = Loadable(lazy(() => import('views/clients/ListeClient')));

// ==============================|| MAIN ROUTES ||============================== //

const ClientsstRoute = {
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
    { path: '/clients', element: <ClientePage /> }
  ]
};

export default ClientsstRoute;
