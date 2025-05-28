// assets
import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import Groups2Icon from '@mui/icons-material/Groups2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SecurityIcon from '@mui/icons-material/Security';
const icons = {
  NavigationOutlinedIcon: NavigationOutlinedIcon,
  HomeOutlinedIcon: HomeOutlinedIcon,
  AppsOutlinedIcon: AppsOutlinedIcon,
  //!=============
  ShoppingBagIcon: ShoppingBagIcon,
  PersonIcon: PersonIcon,
  CategoryOutlinedIcon: CategoryOutlinedIcon,
  Diversity1Icon: Diversity1Icon,
  AddShoppingCartOutlinedIcon: AddShoppingCartOutlinedIcon,
  AssignmentReturnedOutlinedIcon: AssignmentReturnedOutlinedIcon,
  Inventory2OutlinedIcon: Inventory2OutlinedIcon,
  ShoppingCartCheckoutIcon: ShoppingCartCheckoutIcon,
  Groups2Icon: Groups2Icon,
  PeopleAltIcon: PeopleAltIcon,
  SecurityIcon: SecurityIcon,
};


export default {
  items: [
    {
      id: 'navigation',
      title: 'Materially',
      caption: 'Dashboard',
      type: 'group',
      icon: icons['NavigationOutlinedIcon'],
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: icons['HomeOutlinedIcon'],
          url: '/dashboard/default'
        }
      ]
    },

  {
      id: 'person',
      title: 'Personnes',
      // caption: 'Gerer les personnes',
      type: 'group',
      icon: icons['NavigationOutlinedIcon'],
      children: [

       
        // ! Client management ========================
        {
          id: 'client',
          title: 'Clients',
          type: 'item',
          url: '/clients',
          icon: icons['Groups2Icon'],
        },
        // ! Client management ========================

        // !  Fournisseur ==============================
        {
          id: 'fournisseur',
          title: 'Fournisseurs',
          type: 'item',
          url: '/fournisseurs',
          icon: icons['Diversity1Icon'],
        },
        // ! Fournisseur ==============================


      ]
    },
    {
      id: 'g-produits',
      title: 'Gestion de Stock | Produits',
      caption: 'Stocks - Produits',
      type: 'group',
      icon: icons['NavigationOutlinedIcon'],
      children: [

        // ! Categorie management ========================
        {
          id: 'categorie',
          title: 'Categories',
          type: 'item',
          url: '/categories',
          icon: icons['CategoryOutlinedIcon'],
        },
        // ! Categorie management ========================
        // ! Produits management ========================
       
        {
          id: 'produit-liste',
          title: 'Produits',
          type: 'item',
          url: '/produits',
          icon: icons['AppsOutlinedIcon'],
        },
        // ! Produits management ========================

        // ! Les Entree ==================================
        {
          id: 'produit-entree-list',
          title: 'Achats',
          type: 'item',
          url: '/bons-entree-stock',
          icon: icons['AddShoppingCartOutlinedIcon'],
        },

        // ! Les Entree ==================================
        // ! Les Sortie ==================================
        
        {
          id: 'bon-sortie-stock',
          title: 'Ventes',
          type: 'item',
          url: '/bons-sortie-stock',
          icon: icons['ShoppingCartCheckoutIcon'],
        },

      ]
    },
    {
      id: 'Parametres',
      title: 'Paramètres',
      type: 'group',
      icon: icons[''],
      children: [
         // ! Utilisateur management ========================================================================
        ...(true ? [
          {
            id: 'Utilisateur',
            title: 'Utilisateurs',
            type: 'item',
            url: '/utilisateurs',
            icon: icons['PeopleAltIcon'],
          }
        ] : []),
        // ! Utilisateur management ========================
        {
          id: 'Modifier',
          title: 'Modifier le mot de passe',
          type: 'item',
          url: '/parametres',
          icon: icons['SecurityIcon'],
          
        },

      ]
    },
  ]
};








        // {
        //   id: 'auth',
        //   title: 'Authentication',
        //   type: 'collapse',
        //   icon: icons['SecurityOutlinedIcon'],
        //   children: [
        //     {
        //       id: 'login-1',
        //       title: 'Login',
        //       type: 'item',
        //       url: '/application/login',
        //       target: true
        //     },
        //     {
        //       id: 'register',
        //       title: 'Register',
        //       type: 'item',
        //       url: '/application/register',
        //       target: true
        //     }
        //   ]
        // }