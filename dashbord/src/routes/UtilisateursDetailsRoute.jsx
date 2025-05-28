import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';
import ListeUtilisateur from 'views/utilisateur/ListeUtilisateur';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const DetailsUserPage = Loadable(lazy(() => import('views/utilisateur/DetailsUser')));
// ==============================|| MAIN ROUTES ||============================== //

const UtilisateursDetailsRoute = {
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
    { path: '/utilisateur/:id', element: <DetailsUserPage /> }
  ]
};

export default UtilisateursDetailsRoute;
