import { useState, useMemo } from 'react';
import { notifications } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, AlertCircle, Calendar, Trash2, Archive } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const notificationIcons: Record<string, React.ElementType> = {
  due_reminder: Calendar,
  approval: CheckCircle,
  event: Bell,
  membership_expiry: AlertCircle,
  fine_alert: AlertCircle,
};

const notificationColors: Record<string, string> = {
  due_reminder: 'bg-blue-100 text-blue-800',
  approval: 'bg-green-100 text-green-800',
  event: 'bg-purple-100 text-purple-800',
  membership_expiry: 'bg-orange-100 text-orange-800',
  fine_alert: 'bg-red-100 text-red-800',
};

export default function Notifications() {
  const { user } = useAuth();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const userNotifications = useMemo(() => {
    return notifications.filter(n => n.userId === user?.id && !deletedIds.has(n.id));
  }, [user?.id, deletedIds]);

  const unreadNotifications = useMemo(() => {
    return userNotifications.filter(n => !n.read);
  }, [userNotifications]);

  const displayNotifications = unreadOnly ? unreadNotifications : userNotifications;

  const handleDelete = (id: string) => {
    setDeletedIds(prev => new Set([...prev, id]));
  };

  const handleMarkAsRead = (id: string) => {
    // In a real app, this would update the notification
    // Mark notification as read
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated with library activities</p>
          </div>
          <Card className="stat-card px-6 py-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{unreadNotifications.length}</p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger onClick={() => setUnreadOnly(false)}>All Notifications ({userNotifications.length})</TabsTrigger>
            <TabsTrigger onClick={() => setUnreadOnly(true)}>Unread ({unreadNotifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {displayNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No notifications</p>
                </CardContent>
              </Card>
            ) : (
              displayNotifications.map(notification => {
                const Icon = notificationIcons[notification.type];
                return (
                  <Card key={notification.id} className={`hover:shadow-md transition-all ${!notification.read ? 'border-accent/50 bg-accent/5' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg flex-shrink-0 ${notificationColors[notification.type]}`}>
                          <Icon size={20} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{notification.createdAt}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notification.id)} className="h-8 w-8 p-0">
                              <CheckCircle size={16} />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(notification.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3 mt-4">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">All caught up!</p>
                </CardContent>
              </Card>
            ) : (
              unreadNotifications.map(notification => {
                const Icon = notificationIcons[notification.type];
                return (
                  <Card key={notification.id} className="border-accent/50 bg-accent/5 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${notificationColors[notification.type]}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notification.id)} className="h-8 w-8 p-0">
                            <CheckCircle size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(notification.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm font-medium">Due Date Reminders</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm font-medium">Approval Notifications</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm font-medium">Event Announcements</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm font-medium">Membership Expiry Alerts</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm font-medium">Fine Alerts</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
