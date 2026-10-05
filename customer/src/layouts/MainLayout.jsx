import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[88px]">
        {/* pt-[88px] accounts for the fixed navbar height */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
