import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const CreateBonEntreePage = Loadable(lazy(() => import('views/bonEntre/CreateBon')));
// ==============================|| MAIN ROUTES ||============================== //

const BonEntreeRoute = {
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
    { path: '/ajout-stock', element: <CreateBonEntreePage /> }
  ]
};


export default BonEntreeRoute;
