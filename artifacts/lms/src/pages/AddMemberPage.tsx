import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from '@/components/ui/use-toast';

export default function AddMemberPage() {
  const { user, selectedLibrary } = useAuth();
  const [libraries, setLibraries] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    membershipType: 'standard' as const,
    libraryId: selectedLibrary || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    api.libraries.list().then(setLibraries).catch(console.error);
  }, []);

  if (!user || user.role === 'citizen') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="page-header">Add Member</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">Only administrators and librarians can add members.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    else {
      const mobileDigits = formData.mobile.replace(/\D/g, '');
      if (mobileDigits.length < 10) newErrors.mobile = 'Mobile number must have at least 10 digits';
    }
    if (!formData.libraryId) newErrors.libraryId = 'Library is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.users.create({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: 'citizen',
        libraryId: formData.libraryId,
        password: 'Welcome@123', // default password
      });
      setNewMemberName(formData.name);
      setSubmitted(true);
      toast({ title: 'Success', description: `Member ${formData.name} added successfully!` });
      setTimeout(() => {
        setFormData({ name: '', email: '', mobile: '', membershipType: 'standard', libraryId: selectedLibrary || '' });
        setSubmitted(false);
      }, 2000);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message ?? 'Failed to add member', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBranch = libraries.find(b => b.id === formData.libraryId);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="page-header">Add New Member</h1>
          <p className="text-muted-foreground mt-1">Register a new member to the library system</p>
        </div>

        <Card className="sticky top-0 z-10 bg-background border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Member Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter member's full name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  placeholder="98765 43210 or +91 98765 43210"
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                  className={errors.mobile ? 'border-destructive' : ''}
                />
                {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Membership Type *</Label>
                <Select value={formData.membershipType} onValueChange={value => setFormData({ ...formData, membershipType: value as any })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="library">Library *</Label>
                <Select value={formData.libraryId} onValueChange={value => setFormData({ ...formData, libraryId: value })}>
                  <SelectTrigger id="library" className={errors.libraryId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a library" />
                  </SelectTrigger>
                  <SelectContent>
                    {libraries.map(lib => (
                      <SelectItem key={lib.id} value={lib.id}>{lib.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.libraryId && <p className="text-xs text-destructive">{errors.libraryId}</p>}
                {!formData.libraryId && <p className="text-xs text-muted-foreground">Please select a library to continue</p>}
              </div>

              {selectedBranch && (
                <Card className="bg-muted/50 border-0">
                  <CardContent className="p-4 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Library:</span> <span className="font-medium">{selectedBranch.name}</span></p>
                    <p><span className="text-muted-foreground">Membership Type:</span> <span className="font-medium capitalize">{formData.membershipType}</span></p>
                    <p><span className="text-muted-foreground">Valid Until:</span> <span className="font-medium">{new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}</span></p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Member'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormData({ name: '', email: '', mobile: '', membershipType: 'standard', libraryId: selectedLibrary || '' })}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {submitted && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              <div>
                <p className="font-medium text-success">Member added successfully!</p>
                <p className="text-sm text-success/80">{newMemberName} has been registered.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
