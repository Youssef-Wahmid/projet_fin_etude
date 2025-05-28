import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const CategoriePage = Loadable(lazy(() => import('views/categorie/ListeCategorie')));

// ==============================|| MAIN ROUTES ||============================== //

const CategorieRoute = {
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
    { path: '/categories', element: <CategoriePage /> }
  ]
};

export default CategorieRoute;
