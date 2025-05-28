
import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const ListeBonEntreePage = Loadable(lazy(() => import('views/bonEntre/ListeBonEntree')));
// ==============================|| MAIN ROUTES ||============================== //

const BonEntreeListRoute = {
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
    { path: '/bons-entree-stock', element: <ListeBonEntreePage /> }
  ]
};


export default BonEntreeListRoute;
