import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';


const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const DetailsBonEntreePage = Loadable(lazy(() => import('views/bonEntre/DetailsBonEntree')));
// ==============================|| MAIN ROUTES ||============================== //

const BonEntreeDetailsRoute = {
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
    { path: '/produit-entree-details/:id', element: <DetailsBonEntreePage /> }
  ]
};


export default BonEntreeDetailsRoute;
