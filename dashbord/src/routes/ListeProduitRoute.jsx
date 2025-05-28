import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';


const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const ListeProduitPage = Loadable(lazy(() => import('views/produit/ListeProduit')));
// ==============================|| MAIN ROUTES ||============================== //

const ListeProduitRoute = {
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
    { path: '/produits', element: <ListeProduitPage /> }
  ]
};

export default ListeProduitRoute;
