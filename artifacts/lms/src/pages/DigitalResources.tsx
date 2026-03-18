import { useState, useMemo } from 'react';
import { digitalResources, downloadLogs } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Download, Lock, Unlock, FileText, Music, Video, BookOpen, ChevronRight, Send } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DigitalResource } from '@/types/library';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  audiobook: Music,
  video: Video,
  research_paper: BookOpen,
};

const typeColors: Record<string, string> = {
  pdf: 'bg-red-100 text-red-800',
  audiobook: 'bg-blue-100 text-blue-800',
  video: 'bg-purple-100 text-purple-800',
  research_paper: 'bg-green-100 text-green-800',
};

export default function DigitalResources() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<DigitalResource | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    reason: '',
    purpose: '',
    mobile: '',
  });

  const filtered = useMemo(() => {
    let result = digitalResources;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.keywords.some(k => k.toLowerCase().includes(q)));
    }
    if (selectedType) {
      result = result.filter(r => r.type === selectedType);
    }
    return result;
  }, [query, selectedType]);

  const handleDownload = (resource: DigitalResource) => {
    if (resource.accessType === 'paid') {
      setSelectedResource(resource);
      setShowPaymentDialog(true);
    } else {
      // Simulate download
      alert(`Downloading: ${resource.title}`);
    }
  };

  const handlePayment = () => {
    alert(`Payment processed for ${selectedResource?.title}`);
    setShowPaymentDialog(false);
  };

  const handleRequestResource = () => {
    if (!selectedResource || !requestFormData.reason || !requestFormData.purpose || !requestFormData.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(
      <div className="flex items-start gap-2">
        <Send className="w-5 h-5 text-success mt-0.5" />
        <div>
          <p className="font-semibold">Request Submitted!</p>
          <p className="text-sm text-muted-foreground">Your request for "{selectedResource.title}" has been sent to the librarian</p>
        </div>
      </div>
    );
    setShowRequestForm(false);
    setRequestFormData({ reason: '', purpose: '', mobile: '' });
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Digital Resources</h1>
          <p className="text-muted-foreground mt-1">Access PDFs, audiobooks, videos, and research papers</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input placeholder="Search by title, author, or keywords..." className="pl-10 h-12" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={selectedType === null ? 'default' : 'outline'} onClick={() => setSelectedType(null)} className={selectedType === null ? 'bg-accent text-accent-foreground' : ''}>
            All Types
          </Button>
          {['pdf', 'audiobook', 'video', 'research_paper'].map(type => (
            <Button key={type} size="sm" variant={selectedType === type ? 'default' : 'outline'} onClick={() => setSelectedType(type)} className={selectedType === type ? 'bg-accent text-accent-foreground' : ''}>
              {type.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(resource => {
            const Icon = typeIcons[resource.type];
            const isRestricted = resource.accessType === 'restricted';
            const isPaid = resource.accessType === 'paid';

            return (
              <Card key={resource.id} className="hover:shadow-lg transition-all overflow-hidden flex flex-col">
                <CardContent className="p-0 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Icon className="w-6 h-6 text-accent flex-shrink-0" />
                      <div className="flex gap-2">
                        <Badge className={typeColors[resource.type]}>{resource.type.replace('_', ' ')}</Badge>
                        <Badge className="bg-accent/20 text-accent border-accent/30">
                          <Download size={12} className="mr-1" /> {resource.downloadCount.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{resource.author}</p>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>File Size:</span>
                        <span className="font-medium">{resource.fileSize} MB</span>
                      </div>
                      <div className="flex items-center justify-between bg-accent/10 rounded px-2 py-1.5">
                        <span>Downloads:</span>
                        <span className="font-bold text-accent">{resource.downloadCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Language:</span>
                        <span className="font-medium">{resource.language}</span>
                      </div>
                    </div>

                    {/* Access Type Badge */}
                    <div className="flex items-center gap-2 pt-2">
                      {isRestricted && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                          <Lock size={12} className="mr-1" /> Restricted
                        </Badge>
                      )}
                      {isPaid && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                          ₹{resource.cost}
                        </Badge>
                      )}
                      {resource.accessType === 'open' && (
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          <Unlock size={12} className="mr-1" /> Open Access
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t space-y-2">
                    <Button onClick={() => { setSelectedResource(resource); setShowDetailDialog(true); }} variant="outline" className="w-full">
                      View Details
                    </Button>
                    <Button onClick={() => handleDownload(resource)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Download size={16} className="mr-2" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </div>
      </DashboardLayout>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedResource?.title}</DialogTitle>
            <DialogDescription>Resource details and information</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <p className="text-sm"><strong>Author:</strong> {selectedResource.author}</p>
                <p className="text-sm"><strong>Type:</strong> {selectedResource.type.replace('_', ' ')}</p>
                <p className="text-sm"><strong>Language:</strong> {selectedResource.language}</p>
                <p className="text-sm"><strong>File Size:</strong> {selectedResource.fileSize} MB</p>
                <p className="text-sm"><strong>Downloads:</strong> {selectedResource.downloadCount}</p>
                <p className="text-sm"><strong>Uploaded:</strong> {selectedResource.uploadDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{selectedResource.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.keywords.map(kw => (
                    <Badge key={kw} variant="secondary">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            <Button onClick={() => { setShowDetailDialog(false); handleDownload(selectedResource!); }} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download size={16} className="mr-2" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>Proceed with payment</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm font-medium">{selectedResource.title}</p>
                <p className="text-2xl font-bold text-accent mt-2">₹{selectedResource.cost}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                This is a demo payment gateway. In production, integrate with actual payment providers like Razorpay or PayU.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Pay ₹{selectedResource?.cost}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Resource Form Dialog */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Resource</DialogTitle>
            <DialogDescription>Submit your resource request</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleRequestResource(); }}>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm font-medium">{selectedResource.title}</p>
                <p className="text-xs text-muted-foreground mt-1">by {selectedResource.author}</p>
                <p className="text-xs text-muted-foreground">Type: {selectedResource.type.replace('_', ' ')}</p>
              </div>

              <div className="space-y-2">
                <Label>Reason *</Label>
                <Textarea 
                  placeholder="Why do you need this resource?" 
                  value={requestFormData.reason}
                  onChange={e => setRequestFormData({ ...requestFormData, reason: e.target.value })}
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label>Purpose *</Label>
                <Input 
                  placeholder="e.g., Academic / Research / Personal" 
                  value={requestFormData.purpose}
                  onChange={e => setRequestFormData({ ...requestFormData, purpose: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input 
                  placeholder="+91 XXXXX XXXXX" 
                  value={requestFormData.mobile}
                  onChange={e => setRequestFormData({ ...requestFormData, mobile: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRequestForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Send size={16} className="mr-2" /> Submit Request
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
  }
