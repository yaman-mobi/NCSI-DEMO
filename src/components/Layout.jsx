import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Footer from './Footer';
import FloatingAIButton from './FloatingAIButton';

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full flex-col items-stretch bg-white">
      <TopBar />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      <Footer />
      <FloatingAIButton />
    </div>
  );
}
