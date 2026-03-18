import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Bell, LogOut, Home, Search, Users, Calendar, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface MobileDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export default function MobileDashboardLayout({ 
  children, 
  title = 'Library Management',
  showHeader = true 
}: MobileDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const quickLinks = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Search', path: '/books/search' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: FileText, label: 'Requests', path: '/borrow-requests' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background md:flex-row">
      {/* Mobile Header */}
      {showHeader && (
        <div className="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/notifications')} className="p-2 hover:bg-primary/80 rounded-lg">
              <Bell size={20} />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-primary/80 rounded-lg">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-sidebar border-b border-sidebar-border z-30 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-2">
            {quickLinks.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavigation(link.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </button>
              );
            })}
            <div className="border-t border-sidebar-border pt-2 mt-2">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border">
        <div className="flex justify-around items-center">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className="flex-1 flex flex-col items-center justify-center py-3 hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 min-h-screen bg-sidebar flex-col border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-primary-foreground">{title}</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-muted capitalize">{user?.role}</p>
          </div>
          <button onClick={logout} className="p-2 hover:bg-sidebar-accent rounded-lg">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </div>
  );
}
