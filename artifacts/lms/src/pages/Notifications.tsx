import { useState, useMemo } from 'react';
import { notifications } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell, CheckCircle, AlertCircle, Calendar, Trash2,
  BookOpen, Users, RotateCcw, AlertTriangle, IndianRupee, UserPlus
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// ── Icon + color maps ────────────────────────────────────────────────────────

const citizenIcons: Record<string, React.ElementType> = {
  due_reminder: Calendar,
  approval: CheckCircle,
  event: Bell,
  membership_expiry: AlertCircle,
  fine_alert: AlertCircle,
};

const adminIcons: Record<string, React.ElementType> = {
  borrow_request: BookOpen,
  overdue_alert: AlertTriangle,
  renewal_request: RotateCcw,
  new_member: UserPlus,
  low_inventory: AlertCircle,
  fine_collected: IndianRupee,
};

const citizenColors: Record<string, string> = {
  due_reminder: 'bg-blue-100 text-blue-800',
  approval: 'bg-green-100 text-green-800',
  event: 'bg-purple-100 text-purple-800',
  membership_expiry: 'bg-orange-100 text-orange-800',
  fine_alert: 'bg-red-100 text-red-800',
};

const adminColors: Record<string, string> = {
  borrow_request: 'bg-blue-100 text-blue-800',
  overdue_alert: 'bg-red-100 text-red-800',
  renewal_request: 'bg-orange-100 text-orange-800',
  new_member: 'bg-green-100 text-green-800',
  low_inventory: 'bg-yellow-100 text-yellow-800',
  fine_collected: 'bg-emerald-100 text-emerald-800',
};

const adminNavMap: Record<string, string> = {
  borrow_request: '/admin/requests-borrow',
  overdue_alert: '/admin/borrowed',
  renewal_request: '/admin/renewals',
  new_member: '/members',
  low_inventory: '/resources/management',
  fine_collected: '/fees',
};

const librarianNavMap: Record<string, string> = {
  borrow_request: '/admin/requests-borrow',
  overdue_alert: '/admin/borrowed',
  renewal_request: '/admin/renewals',
  new_member: '/members',
};

// ── Admin / Librarian preferences ───────────────────────────────────────────

const adminPrefs = [
  'New Borrow Requests',
  'Overdue Book Alerts',
  'Renewal Requests',
  'New Member Registrations',
  'Low Inventory Warnings',
  'Fine Collection Updates',
];

const citizenPrefs = [
  'Due Date Reminders',
  'Approval Notifications',
  'Event Announcements',
  'Membership Expiry Alerts',
  'Fine Alerts',
];

// ── Main component ───────────────────────────────────────────────────────────

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [unreadOnly, setUnreadOnly] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isLibrarian = user?.role === 'librarian';
  const isStaff = isAdmin || isLibrarian;

  const iconMap = isStaff ? adminIcons : citizenIcons;
  const colorMap = isStaff ? adminColors : citizenColors;
  const navMap = isAdmin ? adminNavMap : isLibrarian ? librarianNavMap : {};
  const prefs = isStaff ? adminPrefs : citizenPrefs;

  const userNotifications = useMemo(() => {
    return notifications.filter(n => n.userId === user?.id && !deletedIds.has(n.id));
  }, [user?.id, deletedIds]);

  const unreadNotifications = useMemo(() => userNotifications.filter(n => !n.read), [userNotifications]);
  const displayNotifications = unreadOnly ? unreadNotifications : userNotifications;

  const handleDelete = (id: string) => setDeletedIds(prev => new Set([...prev, id]));

  const renderCard = (notification: typeof notifications[0]) => {
    const Icon = iconMap[notification.type] ?? Bell;
    const colorClass = colorMap[notification.type] ?? 'bg-gray-100 text-gray-800';
    const actionPath = navMap[notification.type];

    return (
      <Card key={notification.id} className={`hover:shadow-md transition-all ${!notification.read ? 'border-accent/50 bg-accent/5' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
                {!notification.read && <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-muted-foreground">{notification.createdAt}</p>
                {actionPath && (
                  <Button size="sm" variant="link" className="h-auto p-0 text-xs text-accent" onClick={() => navigate(actionPath)}>
                    View →
                  </Button>
                )}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(notification.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0">
              <Trash2 size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="page-header">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {isStaff ? 'Operational alerts and activity updates' : 'Stay updated with your library activities'}
            </p>
          </div>
          <Card className="shrink-0">
            <CardContent className="p-3 text-center min-w-[70px]">
              <p className="text-2xl font-bold text-accent leading-none">{unreadNotifications.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Unread</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" onClick={() => setUnreadOnly(false)}>
              All ({userNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" onClick={() => setUnreadOnly(true)}>
              Unread ({unreadNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {displayNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No notifications</p>
                </CardContent>
              </Card>
            ) : displayNotifications.map(renderCard)}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3 mt-4">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">All caught up!</p>
                </CardContent>
              </Card>
            ) : unreadNotifications.map(renderCard)}
          </TabsContent>
        </Tabs>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prefs.map(pref => (
              <div key={pref} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm font-medium">{pref}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            ))}
            <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
