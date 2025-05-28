
import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const ListeBonSortiePage = Loadable(lazy(() => import('views/bonSortie/ListeBonSortie')));
// ==============================|| MAIN ROUTES ||============================== //

const BonSortieListRoute = {
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
    { path: '/bons-sortie-stock', element: <ListeBonSortiePage /> }
  ]
};


export default BonSortieListRoute;
