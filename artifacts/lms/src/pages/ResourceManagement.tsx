import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, Search, Filter, BookOpen } from 'lucide-react';
import { books } from '@/data/mockData';
import { canAccessFeature } from '@/lib/rbac';

export default function ResourceManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Only admin and librarian can access
  if (!user || !canAccessFeature(user.role, 'resource-management')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Access Denied: Only admins and librarians can manage resources</p>
        </div>
      </DashboardLayout>
    );
  }

  // Filter resources based on search query and type
  const filteredResources = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.isbn.includes(searchQuery);
      
      if (filterType === 'all') return matchesSearch;
      return matchesSearch && book.issueTypes.includes(filterType);
    });
  }, [searchQuery, filterType]);

  const getStatusColor = (accessType: string) => {
    return accessType === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'physical': 'bg-blue-100 text-blue-800',
      'pdf': 'bg-purple-100 text-purple-800',
      'e-document': 'bg-indigo-100 text-indigo-800',
      'article': 'bg-pink-100 text-pink-800',
      'news-item': 'bg-orange-100 text-orange-800',
      'loose-issue': 'bg-cyan-100 text-cyan-800',
      'internet-resource': 'bg-teal-100 text-teal-800',
      'audiobook': 'bg-rose-100 text-rose-800',
      'movie': 'bg-amber-100 text-amber-800',
      'content-file': 'bg-lime-100 text-lime-800',
      'accessibility': 'bg-green-100 text-green-800',
      'mp4': 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Resource Management</h1>
            <p className="text-muted-foreground mt-1">Manage library resources and inventory</p>
          </div>
          <Button onClick={() => navigate('/resources/add')} className="bg-accent hover:bg-accent/90">
            <Plus size={16} className="mr-2" /> Add Resource
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search by title, author, or ISBN..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">All Types</option>
            <option value="physical">Physical</option>
            <option value="pdf">PDF</option>
            <option value="e-document">E-Document</option>
            <option value="article">Article</option>
            <option value="audiobook">Audiobook</option>
            <option value="internet-resource">Internet Resource</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredResources.length} of {books.length} resources
        </div>

        <div className="grid gap-4">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={18} className="text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{resource.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">by {resource.author}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(resource.accessType)}>
                          {resource.accessType}
                        </Badge>
                        {resource.issueTypes.slice(0, 3).map((type) => (
                          <Badge key={type} className={getTypeColor(type)}>
                            {type}
                          </Badge>
                        ))}
                        {resource.issueTypes.length > 3 && (
                          <Badge variant="outline">+{resource.issueTypes.length - 3} more</Badge>
                        )}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        ISBN: {resource.isbn} | Genre: {resource.genre} | Downloads: {resource.downloadCount}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" title="Edit resource">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" title="Delete resource">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">No resources found matching your search criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
