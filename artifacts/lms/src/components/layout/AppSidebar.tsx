import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import {
  Search, BookOpen, Send, Users, ShieldCheck, User, Settings,
  ChevronDown, ChevronRight, PlusCircle, List, CheckSquare,
  ClipboardCheck, History, UserPlus, Users2, FileText,
  Package, RotateCcw, Clock, Home, Bookmark, BarChart3,
  IndianRupee, Bell, LogOut, Library, LayoutDashboard, Calendar, Download, Eye, CreditCard
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AccessibilityControls } from '@/components/AccessibilityControls';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavItem[];
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Departments', icon: Library, path: '/departments', roles: ['admin', 'librarian'] },
  { label: 'Library Branches', icon: Home, path: '/libraries', roles: ['admin', 'librarian'] },
  { label: 'Search Books', icon: Search, path: '/books/search' },
  {
    label: 'Resources', icon: BookOpen, children: [
      { label: 'Add Resource', icon: PlusCircle, path: '/resources/add', roles: ['admin', 'librarian'] },
      { label: 'All Resources', icon: List, path: '/resources' },
      { label: 'Digital Resources', icon: Download, path: '/resources/digital' },
      { label: 'Resource Management', icon: Package, path: '/resources/management', roles: ['admin', 'librarian'] },
    ]
  },
  { label: 'Events', icon: Calendar, path: '/events' },
  { label: 'Borrow Request', icon: Send, path: '/borrow-requests', roles: ['citizen'] },
  {
    label: 'Circulation', icon: RotateCcw, roles: ['admin', 'librarian'], children: [
      { label: 'Issue/Return Books', icon: BookOpen, path: '/circulation/books', roles: ['admin', 'librarian'] },
      { label: 'Transaction History', icon: History, path: '/circulation', roles: ['admin', 'librarian'] },
    ]
  },
  {
    label: 'Library Readers', icon: Users, roles: ['admin', 'librarian'], children: [
      { label: 'Check-In User', icon: CheckSquare, path: '/readers/check-in', roles: ['admin', 'librarian'] },
      { label: 'Checked-In Readers', icon: ClipboardCheck, path: '/readers/checked-in' },
      { label: 'Readers History', icon: History, path: '/readers/history' },
    ]
  },
  {
    label: 'Members', icon: Users2, roles: ['admin', 'librarian'], children: [
      { label: 'Add Member', icon: UserPlus, path: '/members/add', roles: ['admin', 'librarian'] },
      { label: 'Members', icon: Users2, path: '/members' },
    ]
  },
  {
    label: 'Admin', icon: ShieldCheck, roles: ['admin'], children: [
      { label: 'Library Management', icon: Library, path: '/admin/libraries' },
      { label: 'Borrow Requests', icon: FileText, path: '/admin/requests-approve' },
      { label: 'Borrowed Resources', icon: Package, path: '/admin/borrowed' },
      { label: 'Renewal Requests', icon: RotateCcw, path: '/admin/renewals' },
      { label: 'History', icon: Clock, path: '/admin/history' },
    ]
  },
  {
    label: 'Librarian', icon: ShieldCheck, roles: ['librarian'], children: [
      { label: 'Borrow Requests', icon: FileText, path: '/admin/requests-approve' },
      { label: 'Borrowed Resources', icon: Package, path: '/admin/borrowed' },
      { label: 'Renewal Requests', icon: RotateCcw, path: '/admin/renewals' },
      { label: 'History', icon: Clock, path: '/admin/history' },
    ]
  },
  {
    label: 'User', icon: User, roles: ['citizen'], children: [
      { label: 'My Library Card', icon: CreditCard, path: '/my-card' },
      { label: 'My Requests', icon: FileText, path: '/user/requests' },
      { label: 'My Borrowed Resources', icon: Bookmark, path: '/user/borrowed' },
      { label: 'My History', icon: History, path: '/user/history' },
    ]
  },
  {
    label: 'Settings', icon: Settings, roles: ['admin', 'librarian'], children: [
      { label: 'System Settings', icon: Settings, path: '/settings' },
    ]
  },
  { label: 'Reports & Analytics', icon: BarChart3, path: '/reports', roles: ['admin', 'librarian'] },
  { label: 'Fees Management', icon: IndianRupee, path: '/fees', roles: ['admin', 'librarian'] },
];

interface AppSidebarProps {
  onClose?: () => void;
}

export default function AppSidebar({ onClose }: AppSidebarProps) {
  const { user, logout, selectedLibrary } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [allLibraries, setAllLibraries] = useState<any[]>([]);

  useEffect(() => { api.libraries.list().then(setAllLibraries).catch(console.error); }, []);

  const selectedLibraryName = selectedLibrary
    ? allLibraries.find(lib => lib.id === selectedLibrary)?.name
    : null;

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path?: string) => path && location.pathname === path;

  const filterByRole = (items: NavItem[]) =>
    items.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  const renderNavItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.label];
    const filteredChildren = hasChildren ? filterByRole(item.children!) : [];

    if (hasChildren && filteredChildren.length === 0) return null;

    return (
      <div key={item.label}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.label);
            } else if (item.path) {
              navigate(item.path);
              onClose?.();
            }
          }}
          className={`w-full sidebar-nav-item ${depth > 0 ? 'pl-10' : ''} ${
            isActive(item.path) ? 'sidebar-nav-item-active' : ''
          }`}
        >
          <Icon size={18} />
          <span className="flex-1 text-left">{item.label}</span>
          {hasChildren && (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="bg-sidebar-accent/50 rounded-lg mx-2 my-1">
            {filteredChildren.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full h-full bg-sidebar flex flex-col border-r border-sidebar-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex flex-col items-center gap-1 mb-1">
          <img
            src="/lms/logo1.png"
            alt="Library Logo"
            className="h-8 w-auto object-contain block rounded-lg max-w-full"
          />
          <h1 className="text-sm font-bold text-sidebar-primary-foreground leading-tight whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
            Library Management
          </h1>
        </div>
        {selectedLibrary && user?.role !== 'admin' && (
          <p className="text-xs text-white mt-1 truncate text-center">Branch: {selectedLibraryName || 'Loading...'}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {filterByRole(navItems).map(item => renderNavItem(item))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-sidebar-border flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
            {user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-white/70 capitalize">{user?.role}</p>
        </div>
        <button onClick={() => setShowAccessibility(true)} className="text-white hover:text-white/80" title="Accessibility Settings">
          <Eye size={18} />
        </button>
        <button onClick={() => navigate('/notifications')} className="text-white hover:text-white/80">
          <Bell size={18} />
        </button>
        <button onClick={logout} className="text-white hover:text-white/80">
          <LogOut size={18} />
        </button>
      </div>

      {/* Accessibility Controls Dialog */}
      <AccessibilityControls open={showAccessibility} onOpenChange={setShowAccessibility} />
    </aside>
  );
}
