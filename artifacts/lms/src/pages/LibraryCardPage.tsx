import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download } from 'lucide-react';
import { fmtDate } from '@/lib/formatDate';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { downloadLibraryCard } from '@/lib/downloadCard';

export default function LibraryCardPage() {
  const { user } = useAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.memberships.myCard().then(setCard).catch(() => setCard(null)).finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    downloadLibraryCard(`library-card-${card?.cardNumber}.png`)
      .catch(() => toast.error('Download failed. Try right-clicking the card and saving as image.'));
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-muted-foreground">Loading card...</div></DashboardLayout>;

  if (!card) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <h1 className="page-header">My Library Card</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No library card found.</p>
              <p className="text-sm text-muted-foreground mt-1">Complete registration to get your card.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 max-w-sm mx-auto">
        <h1 className="page-header text-center">My Library Card</h1>

        {/* Card */}
        <div
          id="library-card-print"
          className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground shadow-xl"
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] opacity-60 uppercase tracking-wide">Municipal Library System</p>
              <p className="font-bold text-base leading-tight">Library Card</p>
            </div>
            <img
              src="/lms/logo1.png"
              alt="Logo"
              className="h-7 w-7 object-contain rounded-md opacity-90 shrink-0"
            />
          </div>

          {/* Photo + name row */}
          <div className="flex gap-3 mb-3">
            <img
              src={card.photoUrl}
              alt="Photo"
              className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shrink-0"
            />
            <div className="min-w-0 flex flex-col justify-center">
              <p className="font-bold text-sm leading-tight truncate">{card.memberName}</p>
              <p className="text-[11px] opacity-60 truncate">{card.email}</p>
              <p className="text-[11px] opacity-60">{card.mobile}</p>
              <Badge className="mt-1 bg-white/20 text-white border-0 text-[10px] w-fit">{card.planName}</Badge>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-3">
            <div className="bg-white/10 rounded-lg p-2">
              <p className="opacity-50">Card ID</p>
              <p className="font-mono font-bold text-xs">{card.cardNumber}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="opacity-50">Valid Until</p>
              <p className="font-bold">{fmtDate(card.expiryDate)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 col-span-2">
              <p className="opacity-50 mb-0.5">Libraries</p>
              <p className="font-medium leading-tight">
                {(card.libraries ?? []).map((lib: any) => lib.name).join(', ')}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-1.5 rounded-xl">
              <QRCode value={card.qrPayload} size={90} level="M" />
            </div>
          </div>
          <p className="text-center text-[10px] opacity-40 mt-1.5">Scan at library entry / book issuance</p>
        </div>

        <Button onClick={handleDownload} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Download size={16} className="mr-2" /> Download Card
        </Button>
      </div>
    </DashboardLayout>
  );
}
