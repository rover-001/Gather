import { NavLink } from 'react-router-dom';
import { Camera, Image, User } from 'lucide-react';

interface GuestLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
  fullScreen?: boolean;
}

// Preload route chunks when user touches or hovers over nav tabs
const preloadRoutes: Record<string, () => void> = {
  '/cam': () => import('../pages/guest/Camera'),
  '/album': () => import('../pages/guest/Gallery'),
  '/me': () => import('../pages/guest/Me'),
};

export function GuestLayout({ children, hideNav = false, fullScreen = false }: GuestLayoutProps) {
  const handlePrefetch = (path: string) => {
    preloadRoutes[path]?.();
  };
  return (
    <div className={`bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden ${
      fullScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden fixed inset-0' : 'min-h-screen'
    }`}>
      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col relative w-full max-w-md mx-auto ${
        fullScreen ? 'h-full max-h-full pb-16 overflow-hidden' : 'pb-16'
      }`}>
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800">
          <div className="max-w-md mx-auto h-16 flex items-center justify-around px-4">
            <NavLink
              to="/cam"
              onMouseEnter={() => handlePrefetch('/cam')}
              onTouchStart={() => handlePrefetch('/cam')}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center space-y-1 transition ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">Camera</span>
            </NavLink>

            <NavLink
              to="/album"
              onMouseEnter={() => handlePrefetch('/album')}
              onTouchStart={() => handlePrefetch('/album')}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center space-y-1 transition ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <Image className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">Gallery</span>
            </NavLink>

            <NavLink
              to="/me"
              onMouseEnter={() => handlePrefetch('/me')}
              onTouchStart={() => handlePrefetch('/me')}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center space-y-1 transition ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">Me</span>
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
}
