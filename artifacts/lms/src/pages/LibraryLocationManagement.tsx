import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, MapPin, Phone, User, Building2, AlertCircle } from 'lucide-react';
import { libraryBranches, users } from '@/data/mockData';
import { canAccessFeature } from '@/lib/rbac';

interface LibraryLocation {
  id: string;
  name: string;
  departmentId: string;
  address: string;
  lat: number;
  lng: number;
  mapLink: string;
  phone: string;
  librarian: string;
  librarianId?: string;
}

export default function LibraryLocationManagement() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<LibraryLocation[]>(libraryBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LibraryLocation | null>(null);
  const [formData, setFormData] = useState<Partial<LibraryLocation>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Only admin can access
  if (!user || !canAccessFeature(user.role, 'access-control')) {
    return (
      <DashboardLayout>
        <div className="text-center