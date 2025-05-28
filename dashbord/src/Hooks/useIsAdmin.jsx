import { AuthContext } from 'context/AuthContext';
import { useContext } from 'react';

function useIsAdmin() {
  const { currentUser } = useContext(AuthContext);
  return currentUser?.role === 'admin'; 
}
export default useIsAdmin;