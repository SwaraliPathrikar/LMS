import { useState, useEffect, useMemo } from 'react';
import * as api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Download, Lock, Unlock, FileText, Music, Video, BookOpen, Send, Play, Headphones, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DigitalResource } from '@/types/library';
import { toast } from 'sonner';
import MediaViewer, { MediaType } from '@/components/MediaViewer';

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

const openLabel: Record<string, string> = {
  pdf: 'Read',
  research_paper: 'Read',
  audiobook: 'Listen',
  video: 'Watch',
};

const openIcon: Record<string, React.ElementType> = {
  pdf: Eye,
  research_paper: Eye,
  audiobook: Headphones,
  video: Play,
};

export default function DigitalResources() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [allResources, setAllResources] = useState<DigitalResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<DigitalResource | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerResource, setViewerResource] = useState<DigitalResource | null>(null);
  const [requestFormData, setRequestFormData] = useState({ reason: '', purpose: '', mobile: '' });

  useEffect(() => {
    api.digital.list({ limit: '100' }).then(d => setAllResources(d.resources ?? d)).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let result = allResources;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        (r.keywords ?? []).some((k: string) => k.toLowerCase().includes(q))
      );
    }
    if (selectedType) result = result.filter(r => r.type === selectedType);
    return result;
  }, [query, selectedType, allResources]);

  const openViewer = (resource: DigitalResource) => {
    if (resource.accessType === 'restricted') {
      setSelectedResource(resource);
      setShowRequestForm(true);
      return;
    }
    if (resource.accessType === 'paid') {
      setSelectedResource(resource);
      setShowPaymentDialog(true);
      return;
    }
    setViewerResource(resource);
    setViewerOpen(true);
  };

  const handleDownload = (resource: DigitalResource) => {
    if (resource.accessType === 'paid') {
      setSelectedResource(resource);
      setShowPaymentDialog(true);
      return;
    }
    if (resource.accessType === 'restricted') {
      setSelectedResource(resource);
      setShowRequestForm(true);
      return;
    }
    const a = document.createElement('a');
    a.href = resource.fileUrl || '#';
    a.download = resource.title;
    a.target = '_blank';
    a.click();
    api.digital.logDownload(resource.id).catch(() => {});
    toast.success(`Downloading "${resource.title}"`);
  };

  const handlePayment = () => {
    toast.success(`Payment processed for ${selectedResource?.title}`);
    setShowPaymentDialog(false);
    if (selectedResource) { setViewerResource(selectedResource); setViewerOpen(true); }
  };

  const handleRequestResource = () => {
    if (!selectedResource || !requestFormData.reason || !requestFormData.purpose || !requestFormData.mobile) {
      toast.error('Please fill in all required fields'); return;
    }
    toast.success(`Request for "${selectedResource.title}" submitted!`);
    setShowRequestForm(false);
    setRequestFormData({ reason: '', purpose: '', mobile: '' });
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="page-header">Digital Resources</h1>
            <p className="text-muted-foreground mt-1">Read, listen, watch — or download to your device</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input placeholder="Search by title, author, or keywords…" className="pl-10 h-12" value={query} onChange={e => setQuery(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            {[null, 'pdf', 'audiobook', 'video', 'research_paper'].map(t => (
              <Button key={t ?? 'all'} size="sm"
                variant={selectedType === t ? 'default' : 'outline'}
                onClick={() => setSelectedType(t)}
                className={selectedType === t ? 'bg-accent text-accent-foreground' : ''}>
                {t ? t.replace('_', ' ') : 'All Types'}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(resource => {
              const Icon = typeIcons[resource.type];
              const OpenIcon = openIcon[resource.type] ?? Eye;
              const label = openLabel[resource.type] ?? 'Open';

              return (
                <Card key={resource.id} className="hover:shadow-lg transition-all overflow-hidden flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    {/* Card header */}
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Icon className="w-6 h-6 text-accent shrink-0" />
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          <Badge className={typeColors[resource.type]}>{resource.type.replace('_', ' ')}</Badge>
                          {resource.accessType === 'open' && (
                            <Badge className="bg-green-100 text-green-800"><Unlock size={10} className="mr-1" />Open</Badge>
                          )}
                          {resource.accessType === 'restricted' && (
                            <Badge className="bg-yellow-100 text-yellow-800"><Lock size={10} className="mr-1" />Restricted</Badge>
                          )}
                          {resource.accessType === 'paid' && (
                            <Badge className="bg-orange-100 text-orange-800">₹{resource.cost}</Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-2">{resource.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{resource.author}</p>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{resource.fileSize} MB</span>
                        <span>{resource.downloadCount.toLocaleString()} downloads</span>
                        <span>{resource.language}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => openViewer(resource)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground col-span-2"
                      >
                        <OpenIcon size={15} className="mr-1.5" /> {label} Now
                      </Button>
                      <Button variant="outline" onClick={() => { setSelectedResource(resource); setShowDetailDialog(true); }}>
                        Details
                      </Button>
                      <Button variant="outline" onClick={() => handleDownload(resource)}>
                        <Download size={14} className="mr-1" /> Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>

      {/* ── In-app Media Viewer ── */}
      {viewerResource && (
        <MediaViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          title={viewerResource.title}
          author={viewerResource.author}
          type={viewerResource.type as MediaType}
          url={viewerResource.fileUrl}
          canAccess={viewerResource.accessType === 'open'}
          onRequestAccess={() => { setViewerOpen(false); setSelectedResource(viewerResource); setShowRequestForm(true); }}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedResource?.title}</DialogTitle>
            <DialogDescription>by {selectedResource?.author}</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize">{selectedResource.type.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Language</span><span>{selectedResource.language}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">File Size</span><span>{selectedResource.fileSize} MB</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Downloads</span><span>{selectedResource.downloadCount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Uploaded</span><span>{selectedResource.uploadDate}</span></div>
              </div>
              <p className="text-sm text-muted-foreground">{selectedResource.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedResource.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowDetailDialog(false)}>Close</Button>
            <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => { setShowDetailDialog(false); openViewer(selectedResource!); }}>
              {openLabel[selectedResource?.type ?? 'pdf']} Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="w-[95vw] max-w-sm">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>Pay to unlock this resource</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="font-medium text-sm">{selectedResource.title}</p>
                <p className="text-2xl font-bold text-accent mt-1">₹{selectedResource.cost}</p>
              </div>
              <p className="text-xs text-muted-foreground">Demo payment — integrate Razorpay in production.</p>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePayment}>
              Pay ₹{selectedResource?.cost}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Form */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Access</DialogTitle>
            <DialogDescription>Submit a request to the librarian</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleRequestResource(); }}>
              <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                <p className="font-medium">{selectedResource.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">by {selectedResource.author}</p>
              </div>
              <div className="space-y-1">
                <Label>Reason *</Label>
                <Textarea placeholder="Why do you need this resource?" value={requestFormData.reason}
                  onChange={e => setRequestFormData(f => ({ ...f, reason: e.target.value }))} className="min-h-20" />
              </div>
              <div className="space-y-1">
                <Label>Purpose *</Label>
                <Input placeholder="e.g. Academic / Research / Personal" value={requestFormData.purpose}
                  onChange={e => setRequestFormData(f => ({ ...f, purpose: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Mobile Number *</Label>
                <Input placeholder="+91 XXXXX XXXXX" value={requestFormData.mobile}
                  onChange={e => setRequestFormData(f => ({ ...f, mobile: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRequestForm(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Send size={14} className="mr-1" /> Submit
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
