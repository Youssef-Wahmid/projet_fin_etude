import { useRoutes } from 'react-router-dom';

// routes
import ProduitRoute from './ProduitRoute';
import ClientsstRoute from './ClientsRoute';
import CategorieRoute from './CategoriesRouute';
import FournisseurRoute from './FournisseurRoute';
import ListeProduitRoute from './ListeProduitRoute';
import BonEntreeRoute from './BonEntreeRoute';
import BonEntreeListRoute from './BonEntreeListRoute';
import BonEntreeDetailsRoute from './BonEntreeDetailsRoute';
import BonSortieRoute from './BonSortieRoute';
import BonSortieListRoute from './BonSortieListRoute';
import BonSortieDetailsRoute from './BonSortieDetailsRoute';
import DetailsProduitRoute from './DetailsProduitRoute';
import UtilisateursRoute from './UtilisateursRoute';
import UtilisateursDetailsRoute from './UtilisateursDetailsRoute';
import LoginRoute from './LoginRoute';
import { useAuthRedirect } from 'Hooks/useAuthRedirect ';
import ProfileRoute from './ProfileRoute';
import ParametresRoute from './ParametresRoute';


// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  useAuthRedirect();
  return useRoutes([ ProduitRoute, ClientsstRoute, CategorieRoute, FournisseurRoute,ListeProduitRoute,
    DetailsProduitRoute, BonEntreeRoute, BonEntreeListRoute,BonEntreeDetailsRoute,BonSortieRoute,BonSortieListRoute ,
    BonSortieDetailsRoute, UtilisateursRoute,UtilisateursDetailsRoute,LoginRoute,ProfileRoute,ParametresRoute
  ]);
}
