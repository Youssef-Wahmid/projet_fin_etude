import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const CreateProductPage = Loadable(lazy(() => import('views/produit/CreateProduct')));
// ==============================|| MAIN ROUTES ||============================== //

const ProduitRoute = {
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
    { path: '/produits-create', element: <CreateProductPage /> }
  ]
};

export default ProduitRoute;
