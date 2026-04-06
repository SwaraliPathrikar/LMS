import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) { navigate('/login'); return null; }
  if (user.role === 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Settings</h1>
          <Card><CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Access Denied</p>
          </CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }
  if (user.role === 'admin') return <AdminSettings />;
  return <LibrarianSettings />;
}

function AdminSettings() {
  const [maxBorrowDays, setMaxBorrowDays] = useState('30');
  const [maxRenewals, setMaxRenewals] = useState('2');
  const [maxBooks, setMaxBooks] = useState('5');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.settings.getSystem().then(s => {
      setMaxBorrowDays(String(s.maxBorrowPeriodDays));
      setMaxRenewals(String(s.maxRenewals));
      setMaxBooks(String(s.maxBooksPerMember));
      setLoaded(true);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    try {
      await api.settings.updateSystem({ maxBorrowPeriodDays: parseInt(maxBorrowDays), maxRenewals: parseInt(maxRenewals), maxBooksPerMember: parseInt(maxBooks) });
      toast.success('Settings saved!');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">System Settings</h1>
          <p className="text-muted-foreground mt-1">Borrowing behaviour defaults — applied across all libraries</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Borrowing Rules</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Max Borrow Period (days)</label>
                <Input type="number" min="1" value={maxBorrowDays} onChange={e => setMaxBorrowDays(e.target.value)} className="mt-1" disabled={!loaded} />
              </div>
              <div>
                <label className="text-sm font-medium">Max Renewals</label>
                <Input type="number" min="0" value={maxRenewals} onChange={e => setMaxRenewals(e.target.value)} className="mt-1" disabled={!loaded} />
              </div>
              <div>
                <label className="text-sm font-medium">Max Books Per Member</label>
                <Input type="number" min="1" value={maxBooks} onChange={e => setMaxBooks(e.target.value)} className="mt-1" disabled={!loaded} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Button onClick={handleSave} disabled={!loaded} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Save size={16} className="mr-2" /> Save Settings
        </Button>
        <Card className="border-muted bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Fine rates and membership plan pricing are managed in <strong>Fees Management</strong>.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function LibrarianSettings() {
  const { user, selectedLibrary } = useAuth();
  const [operatingHours, setOperatingHours] = useState('');
  const [closedDays, setClosedDays] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [libName, setLibName] = useState('');

  useEffect(() => {
    if (!selectedLibrary) return;
    api.libraries.get(selectedLibrary).then(lib => {
      setLibName(lib.name);
      const s = lib.settings;
      if (s) {
        setOperatingHours(s.operatingHours ?? '');
        setClosedDays((s.closedDays ?? []).join(', '));
        setMaxCapacity(String(s.maxCapacity ?? ''));
      }
    }).catch(console.error);
  }, [selectedLibrary]);

  const handleSave = async () => {
    if (!selectedLibrary) { toast.error('Please select a library'); return; }
    try {
      await api.libraries.updateSettings(selectedLibrary, {
        operatingHours,
        closedDays: closedDays.split(',').map(d => d.trim()).filter(Boolean),
        maxCapacity: parseInt(maxCapacity) || 0,
      });
      toast.success('Library settings saved!');
    } catch (e: any) { toast.error(e.message); }
  };

  if (!selectedLibrary) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Library Settings</h1>
          <Card><CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Please select a library from the sidebar</p>
          </CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Library Settings</h1>
          <p className="text-muted-foreground mt-1">Operational configuration for {libName}</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Operating Hours</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Operating Hours</label>
              <Input value={operatingHours} onChange={e => setOperatingHours(e.target.value)} placeholder="e.g. 9:00 AM – 6:00 PM" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Closed Days</label>
              <Input value={closedDays} onChange={e => setClosedDays(e.target.value)} placeholder="e.g. Sunday, Monday" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Capacity</CardTitle></CardHeader>
          <CardContent>
            <label className="text-sm font-medium">Maximum Library Capacity</label>
            <Input type="number" min="1" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} className="mt-1" />
          </CardContent>
        </Card>
        <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Save size={16} className="mr-2" /> Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
