import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import FloatingAIButton from './FloatingAIButton';
import UpperBar from './UpperBar';

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full flex-col items-stretch bg-white">
      <UpperBar />
      <TopBar />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      {/* <Footer /> */}
      <FloatingAIButton />
    </div>
  );
}
