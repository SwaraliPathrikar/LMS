import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, FileText, Settings, TrendingUp, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { books, bookInventory, members, circulationTransactions, fines, libraryBranches } from '@/data/mockData';

export default function LibraryManagement() {
  const { user, selectedLibrary, setSelectedLibrary } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Role-based access check
  const canAccessManagement = user?.role === 'admin' || user?.role === 'librarian';
  const isAdmin = user?.role === 'admin';

  if (!canAccessManagement) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-warning mb-4">
                <AlertCircle size={24} />
                <p className="font-semibold">Access Denied</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You don't have permission to access library management. Only admins and librarians can access this section.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate metrics
  let filteredTransactions = circulationTransactions;
  let filteredMembers = members;
  let filteredFines = fines;
  
  if (isAdmin && selectedLibrary) {
    filteredTransactions = circulationTransactions.filter(t => t.libraryId === selectedLibrary);
    filteredMembers = members.filter(m => m.libraryId === selectedLibrary);
    filteredFines = fines.filter(f => f.libraryId === selectedLibrary);
  }
  
  const totalBooks = books.length;
  const totalMembers = filteredMembers.length;
  const activeMembers = filteredMembers.filter(m => m.status === 'active').length;
  const totalBorrowed = filteredTransactions.filter(ct => ct.status === 'issued' || ct.status === 'overdue').length;
  const totalFines = filteredFines.reduce((sum, f) => sum + (f.status === 'pending' ? f.amount : 0), 0);
  const overdueBooks = filteredTransactions.filter(ct => ct.status === 'overdue').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Library Management</h1>
          <p className="text-muted-foreground mt-1">Manage library operations, inventory, and members</p>
        </div>

        {/* Library Selection for Admin */}
        {isAdmin && (
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Select Library</label>
            <Select value={selectedLibrary || ''} onValueChange={setSelectedLibrary}>
              <SelectTrigger>
                <SelectValue placeholder="Select a library..." />
              </SelectTrigger>
              <SelectContent>
                {libraryBranches.map(lib => (
                  <SelectItem key={lib.id} value={lib.id}>
                    {lib.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Books</p>
                  <p className="text-3xl font-bold text-primary mt-2">{totalBooks}</p>
                </div>
                <BookOpen className="text-primary opacity-20" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-3xl font-bold text-success mt-2">{activeMembers}</p>
                </div>
                <Users className="text-success opacity-20" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Currently Borrowed</p>
                  <p className="text-3xl font-bold text-info mt-2">{totalBorrowed}</p>
                </div>
                <FileText className="text-info opacity-20" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Fines</p>
                  <p className="text-3xl font-bold text-warning mt-2">₹{totalFines}</p>
                </div>
                <AlertCircle className="text-warning opacity-20" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Books</p>
                  <p className="text-3xl font-bold text-accent mt-2">{overdueBooks}</p>
                </div>
                <TrendingUp className="text-accent opacity-20" size={40} />
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="stat-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-3xl font-bold text-purple-500 mt-2">{totalMembers}</p>
                  </div>
                  <Users className="text-purple-500 opacity-20" size={40} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map(ct => (
                    <div key={ct.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Transaction {ct.id}</p>
                        <p className="text-xs text-muted-foreground">Member: {ct.memberId}</p>
                      </div>
                      <Badge variant={ct.status === 'returned' ? 'default' : ct.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {ct.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Book Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookInventory.slice(0, 8).map(inv => {
                    const book = books.find(b => b.id === inv.bookId);
                    const availabilityPercent = (inv.availableCount / inv.totalCount) * 100;
                    return (
                      <div key={`${inv.bookId}-${inv.libraryId}`} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{book?.title.substring(0, 30)}</p>
                          <span className="text-xs text-muted-foreground">{inv.availableCount}/{inv.totalCount}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-success h-2 rounded-full transition-all"
                            style={{ width: `${availabilityPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Member Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredMembers.slice(0, 6).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.membershipId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{member.borrowedBooks} books</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Standard Fine Rate</p>
                      <p className="text-2xl font-bold mt-2">₹5/day</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Premium Fine Rate</p>
                      <p className="text-2xl font-bold mt-2">₹10/day</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Max Borrow Period</p>
                      <p className="text-2xl font-bold mt-2">30 days</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Max Renewals</p>
                      <p className="text-2xl font-bold mt-2">2 times</p>
                    </div>
                  </div>
                  <Button className="w-full">Edit Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
