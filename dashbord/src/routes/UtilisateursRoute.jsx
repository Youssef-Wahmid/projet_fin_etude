import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';
import ListeUtilisateur from 'views/utilisateur/ListeUtilisateur';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const UtilisateurPage = Loadable(lazy(() => import('views/utilisateur/ListeUtilisateur')));
// ==============================|| MAIN ROUTES ||============================== //

const UtilisateursRoute = {
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
    { path: '/utilisateurs', element: <UtilisateurPage /> }
  ]
};

export default UtilisateursRoute;
