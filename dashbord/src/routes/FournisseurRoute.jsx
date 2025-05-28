import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const FournisseurPage = Loadable(lazy(() => import('views/fournisseur/ListeFournisseur')));

// ==============================|| MAIN ROUTES ||============================== //

const FournisseurRoute = {
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
    { path: '/fournisseurs', element: <FournisseurPage /> }
  ]
};

export default FournisseurRoute;
