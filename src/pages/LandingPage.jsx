import { useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import LoggedInHomePage from './LoggedInHomePage';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

   useEffect(() => {
    if (import.meta.env.PROD && !isAuthenticated) {
      window.location.replace(
        "https://realsoftapps.com/RealDataPortal_Demo/home/landing"
      );
    }
  }, [isAuthenticated]);
  
   return <LoggedInHomePage />;

}
