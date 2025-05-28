import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';
import DetailsProduit from 'views/produit/DetailsProduit';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const DetailsProduitPage = Loadable(lazy(() => import('views/produit/DetailsProduit')));
// ==============================|| MAIN ROUTES ||============================== //

const DetailsProduitRoute = {
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
    { path: '/details-produit/:id', element: <DetailsProduitPage /> }
  ]
};

export default DetailsProduitRoute;
