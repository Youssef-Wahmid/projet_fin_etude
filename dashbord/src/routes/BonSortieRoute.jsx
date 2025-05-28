import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';


const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const CreateBonSortiePage = Loadable(lazy(() => import('views/bonSortie/CreateBonSortie')));
// ==============================|| MAIN ROUTES ||============================== //

const BonSortieRoute = {
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
    { path: '/ventes/ajouter', element: <CreateBonSortiePage /> }
  ]
};


export default BonSortieRoute;
