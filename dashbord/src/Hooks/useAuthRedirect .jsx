import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

export const useAuthRedirect = () => {
  const { AccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!AccessToken) {
      navigate('/login');
    }
  }, [AccessToken, navigate]);
};