import TopBar from '../components/TopBar';
import Hero from '../components/Hero';
import ContextualBanner from '../components/ContextualBanner';
import FeaturedForYou from '../components/FeaturedForYou';
import RecommendedForYou from '../components/RecommendedForYou';
import WhatIsSmartPortal from '../components/WhatIsSmartPortal';
import AIAssistant from '../components/AIAssistant';
import IndicatorCards from '../components/IndicatorCards';
import CategoryCards from '../components/CategoryCards';
import NewsResourcesPublications from '../components/NewsResourcesPublications';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import LoggedInHomePage from './LoggedInHomePage';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <LoggedInHomePage />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-stretch bg-white">
      <TopBar />
      <main id="main-content" className="flex flex-1 flex-col items-stretch" role="main">
      <div className="relative">
        <Hero />
      </div>
      <ContextualBanner />
      <FeaturedForYou />
      <RecommendedForYou context="landing" />
      <WhatIsSmartPortal />
      <AIAssistant />
      <IndicatorCards />
      <CategoryCards />
      <NewsResourcesPublications />
      <Footer />
      </main>
    </div>
  );
}
