import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Camera, Upload, ChevronRight, ChevronLeft, Globe, Building2, CreditCard, Download } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { downloadLibraryCard } from '@/lib/downloadCard';
import { fmtDate } from '@/lib/formatDate';
import { MembershipPlan } from '@/types/library';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = ['Personal Info', 'Library & Plan', 'Photo', 'Payment', 'Card'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
}
function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}
function today() { return new Date().toISOString().split('T')[0]; }

// ── Main component ────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [issuedCard, setIssuedCard] = useState<any | null>(null);
  const [libraryBranches, setLibraryBranches] = useState<any[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    const load = () => {
      setDataLoading(true);
      setDataError(false);
      Promise.all([
        api.libraries.list(),
        api.memberships.list(),
      ]).then(([libs, plans]) => {
        setLibraryBranches(libs);
        setMembershipPlans(plans);
        setDataLoading(false);
      }).catch(() => {
        setDataError(true);
        setDataLoading(false);
      });
    };
    load();
  }, []);

  // Step 1 — personal info
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', dob: '', address: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 2 — library & plan
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Step 3 — photo
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Step 4 — payment
  const [paymentDone, setPaymentDone] = useState(false);

  const setField = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  // ── Available plans for selected libraries ──────────────────────────────────
  // API returns plan.libraries as [{id, name}] array
  const availablePlans = membershipPlans.filter(p => {
    const libIds: string[] = (p.libraries ?? []).map((l: any) => l.id ?? l);
    if (libIds.length === 0) return true; // global plan
    if (selectedLibraryIds.length === 0) return true; // show all when nothing selected
    return selectedLibraryIds.some(lid => libIds.includes(lid));
  });

  const totalAmount = selectedPlan
    ? (billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice) * Math.max(selectedLibraryIds.length, 1)
    : 0;

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.mobile.trim() || form.mobile.replace(/\D/g, '').length < 10) e.mobile = 'Valid 10-digit mobile required';
    if (!form.dob) e.dob = 'Date of birth is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    if (selectedLibraryIds.length === 0) { toast.error('Select at least one library'); return false; }
    if (!selectedPlan) { toast.error('Select a membership plan'); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!photoUrl) { toast.error('Please upload or capture a photo'); return false; }
    return true;
  };

  // ── Camera ──────────────────────────────────────────────────────────────────

  const startCamera = async () => {
    setCameraError('');

    // Check if running in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      setCameraError('insecure');
      return;
    }

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('unsupported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('notfound');
      } else if (err.name === 'NotReadableError') {
        setCameraError('inuse');
      } else {
        setCameraError('unknown');
      }
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setCameraError('');
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // Square crop from center
    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
    setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Razorpay payment ───────────────────────────────────────────────────────
  const handlePayment = async () => {
    try {
      // Register user first so we have auth tokens for subsequent calls
      let uploadedPhotoUrl = photoUrl;
      if (photoUrl.startsWith('data:')) {
        try {
          const blob = await (await fetch(photoUrl)).blob();
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          const uploaded = await api.upload.photo(file);
          uploadedPhotoUrl = uploaded.url;
        } catch {
          // Keep base64 if upload fails — card will still show the photo
        }
      }

      // Register the user account
      const regData = await api.auth.register({
        name: form.name, email: form.email, password: form.password,
        mobile: form.mobile, dateOfBirth: form.dob, address: form.address,
      });
      api.setTokens(regData.accessToken, regData.refreshToken);

      // Now create payment order
      const orderData = await api.payments.createOrder({ amount: totalAmount, planId: selectedPlan!.id, billingCycle });

      if (orderData.demo) {
        toast.info('Demo mode: simulating payment...');
        await api.payments.verify({ razorpayOrderId: orderData.order.id, razorpayPaymentId: 'pay_demo', razorpaySignature: 'demo', paymentId: orderData.paymentId });
        setPaymentDone(true);
        await completeRegistration(uploadedPhotoUrl);
        return;
      }

      // Real Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Municipal Library System',
        description: `${selectedPlan?.name} Membership`,
        order_id: orderData.order.id,
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        theme: { color: '#6366f1' },
        handler: async (response: any) => {
          await api.payments.verify({ ...response, paymentId: orderData.paymentId });
          setPaymentDone(true);
          await completeRegistration(uploadedPhotoUrl);
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) { toast.error(e.message ?? 'Payment/Registration failed'); }
  };

  // ── Complete registration (issue library card after payment) ───────────────
  const completeRegistration = async (uploadedPhotoUrl: string) => {
    try {
      const qrPayload = JSON.stringify({
        name: form.name, email: form.email, mobile: form.mobile,
        libraries: selectedLibraryIds.map(id => libraryBranches.find((b: any) => b.id === id)?.name),
        plan: selectedPlan?.name, billing: billingCycle,
      });
      const card = await api.memberships.issueCard({
        planId: selectedPlan!.id, libraryIds: selectedLibraryIds,
        billingCycle, amountPaid: totalAmount,
        photoUrl: uploadedPhotoUrl, address: form.address, dateOfBirth: form.dob, qrPayload,
      });

      setIssuedCard(card);
      setStep(4);
      toast.success('Registration complete! Your library card is ready.');
    } catch (e: any) { toast.error(e.message ?? 'Card issuance failed'); }
  };

  // ── Download card as image ──────────────────────────────────────────────────
  const downloadCard = () => {
    downloadLibraryCard(`library-card-${issuedCard?.cardNumber ?? issuedCard?.cardId ?? 'card'}.png`)
      .catch(() => toast.error('Download failed. Try right-clicking the card and saving as image.'));
  };

  const next = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    if (step === 2 && !validateStep3()) return;
    setStep(s => s + 1);
  };
  const back = () => setStep(s => s - 1);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-info blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src="/lms/logo1.png" alt="Library Logo" className="h-12 w-auto object-contain rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Citizen Registration</h1>
          <p className="text-primary-foreground/60 mt-1 text-sm">Municipal Library System</p>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-1 mb-5">
            {STEPS.slice(0, 4).map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-success text-white' : i === step ? 'bg-accent text-white' : 'bg-white/20 text-white/50'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < 3 && <div className={`w-6 h-0.5 ${i < step ? 'bg-success' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
        )}

        <Card className="shadow-2xl border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-center">{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* ── STEP 0: Personal Info ── */}
            {step === 0 && (
              <div className="space-y-3">
                {[
                  { id: 'name', label: 'Full Name *', type: 'text', placeholder: 'As per ID proof' },
                  { id: 'email', label: 'Email Address *', type: 'email', placeholder: 'your@email.com' },
                  { id: 'mobile', label: 'Mobile Number *', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                  { id: 'dob', label: 'Date of Birth *', type: 'date', placeholder: '' },
                  { id: 'address', label: 'Residential Address *', type: 'text', placeholder: 'Full address' },
                ].map(f => (
                  <div key={f.id} className="space-y-1">
                    <Label htmlFor={f.id}>{f.label}</Label>
                    <Input id={f.id} type={f.type} placeholder={f.placeholder}
                      value={(form as any)[f.id]} onChange={e => setField(f.id, e.target.value)}
                      className={errors[f.id] ? 'border-destructive' : ''} />
                    {errors[f.id] && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={11} />{errors[f.id]}</p>}
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="password">Password * (min 8)</Label>
                    <Input id="password" type="password" placeholder="••••••••"
                      value={form.password} onChange={e => setField('password', e.target.value)}
                      className={errors.password ? 'border-destructive' : ''} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••"
                      value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)}
                      className={errors.confirmPassword ? 'border-destructive' : ''} />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Library & Plan ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Libraries * (can choose multiple)</Label>
                  {dataLoading ? (
                    <div className="border rounded-md p-4 text-center text-sm text-muted-foreground animate-pulse">
                      Loading libraries...
                    </div>
                  ) : dataError ? (
                    <div className="border border-destructive/30 bg-destructive/5 rounded-md p-4 text-sm space-y-3">
                      <p className="text-destructive font-semibold">Cannot connect to server</p>
                      <p className="text-muted-foreground text-xs">The browser is blocking the connection. Fix it in 2 steps:</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setDataLoading(true);
                            setDataError(false);
                            Promise.all([api.libraries.list(), api.memberships.list()])
                              .then(([libs, plans]) => { setLibraryBranches(libs); setMembershipPlans(plans); setDataLoading(false); })
                              .catch(() => { setDataError(true); setDataLoading(false); });
                          }}
                          className="w-full py-2 px-3 rounded-md bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90"
                        >
                          Retry — click here to reload libraries
                        </button>
                        <p className="text-xs text-muted-foreground text-center">Make sure the server is running: <code>npx tsx src/index.ts</code> in the server folder</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto border rounded-md p-2">
                      {libraryBranches.map(lib => (
                        <label key={lib.id} className="flex items-start gap-2 cursor-pointer hover:bg-secondary/50 rounded p-1.5">
                          <input type="checkbox" className="mt-0.5 rounded"
                            checked={selectedLibraryIds.includes(lib.id)}
                            onChange={() => setSelectedLibraryIds(ids =>
                              ids.includes(lib.id) ? ids.filter(i => i !== lib.id) : [...ids, lib.id]
                            )} />
                          <div>
                            <p className="text-sm font-medium">{lib.name}</p>
                            <p className="text-xs text-muted-foreground">{lib.address}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {availablePlans.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Membership Plan *</Label>
                    <div className="flex gap-2 mb-2">
                      {(['monthly', 'yearly'] as const).map(c => (
                        <Button key={c} size="sm" variant={billingCycle === c ? 'default' : 'outline'}
                          onClick={() => setBillingCycle(c)} className={billingCycle === c ? 'bg-accent text-accent-foreground' : ''}>
                          {c === 'yearly' ? 'Yearly (save more)' : 'Monthly'}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {availablePlans.map(plan => (
                        <div key={plan.id}
                          onClick={() => setSelectedPlan(plan)}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedPlan?.id === plan.id ? 'border-accent bg-accent/5' : 'hover:border-muted-foreground/40'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{plan.name}</p>
                              <p className="text-xs text-muted-foreground">{plan.description}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Max {plan.maxBooks} books</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-accent">₹{billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}</p>
                              <p className="text-xs text-muted-foreground">/{billingCycle === 'yearly' ? 'year' : 'month'}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {(plan.libraries ?? []).length === 0
                              ? <Badge variant="secondary" className="text-xs"><Globe size={9} className="mr-1" />All Libraries</Badge>
                              : (plan.libraries ?? []).map((lib: any) => (
                                  <Badge key={lib.id} variant="outline" className="text-xs">
                                    <Building2 size={9} className="mr-1" />{lib.name}
                                  </Badge>
                                ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPlan && selectedLibraryIds.length > 0 && (
                  <div className="bg-accent/10 rounded-lg p-3 text-sm">
                    <p className="font-semibold">Total: ₹{totalAmount}</p>
                    <p className="text-xs text-muted-foreground">{selectedPlan.name} × {selectedLibraryIds.length} {selectedLibraryIds.length > 1 ? 'libraries' : 'library'} ({billingCycle})</p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Photo ── */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Upload a clear photo of your face. This will appear on your library card.</p>

                {photoUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={photoUrl} alt="Your photo" className="w-32 h-32 rounded-full object-cover border-4 border-accent" />
                    <Button size="sm" variant="outline" onClick={() => { setPhotoUrl(''); setCameraError(''); }}>Retake / Change</Button>
                  </div>
                ) : cameraActive ? (
                  <div className="space-y-3">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg border aspect-square object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                      <Button onClick={capturePhoto} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Camera size={16} className="mr-2" /> Capture Photo
                      </Button>
                      <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Error messages */}
                    {cameraError === 'insecure' && (
                      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm space-y-2">
                        <p className="font-medium text-warning flex items-center gap-1"><AlertCircle size={14} /> Camera not available</p>
                        <p className="text-xs text-muted-foreground">Use "Take Photo" button below — it opens your camera directly and works on all devices.</p>
                      </div>
                    )}
                    {cameraError === 'denied' && (
                      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm">
                        <p className="font-medium text-destructive flex items-center gap-1"><AlertCircle size={14} /> Camera permission denied</p>
                        <p className="text-xs text-muted-foreground mt-1">Go to your browser settings → Site permissions → Camera → Allow for this site. Or use "Take Photo" below.</p>
                      </div>
                    )}
                    {cameraError === 'notfound' && (
                      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm">
                        <p className="font-medium text-destructive flex items-center gap-1"><AlertCircle size={14} /> No camera found</p>
                        <p className="text-xs text-muted-foreground mt-1">No camera detected on this device. Please upload a photo instead.</p>
                      </div>
                    )}
                    {cameraError === 'inuse' && (
                      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm">
                        <p className="font-medium text-warning flex items-center gap-1"><AlertCircle size={14} /> Camera in use</p>
                        <p className="text-xs text-muted-foreground mt-1">Another app is using the camera. Close it and try again.</p>
                      </div>
                    )}

                    {/* Native capture — works on mobile even without HTTPS */}
                    <Button onClick={() => captureInputRef.current?.click()} className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Camera size={18} className="mr-2" /> Take Photo (Mobile Camera)
                    </Button>
                    <input
                      ref={captureInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {/* getUserMedia — works on HTTPS */}
                    <Button onClick={startCamera} variant="outline" className="w-full h-12">
                      <Camera size={18} className="mr-2" /> Open Live Camera (HTTPS only)
                    </Button>

                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-12">
                      <Upload size={18} className="mr-2" /> Upload from Gallery
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

                    <p className="text-xs text-center text-muted-foreground">
                      💡 On mobile? Use "Take Photo" — it opens your camera directly without needing HTTPS.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Payment ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                  <p className="font-semibold text-base">Order Summary</p>
                  <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{selectedPlan?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Billing</span><span className="capitalize">{billingCycle}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Libraries</span><span>{selectedLibraryIds.length}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-accent">₹{totalAmount}</span></div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  <p className="font-medium mb-1">Secure Payment via Razorpay</p>
                  <p>You'll be redirected to Razorpay's secure checkout. Supports UPI, cards, net banking and wallets.</p>
                </div>

                {paymentDone ? (
                  <div className="flex items-center gap-2 text-success font-medium">
                    <CheckCircle size={18} /> Payment successful!
                  </div>
                ) : (
                  <Button onClick={handlePayment} className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                    <CreditCard size={18} className="mr-2" /> Pay ₹{totalAmount} via Razorpay
                  </Button>
                )}
              </div>
            )}

            {/* ── STEP 4: Library Card ── */}
            {step === 4 && issuedCard && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-success font-medium justify-center">
                  <CheckCircle size={20} /> Registration Complete!
                </div>

                {/* The actual library card */}
                <div id="library-card-print" className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground shadow-xl max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] opacity-60 uppercase tracking-wide">Municipal Library System</p>
                      <p className="font-bold text-base leading-tight">Library Card</p>
                    </div>
                    <img src="/lms/logo1.png" alt="Logo" className="h-7 w-7 object-contain rounded-md opacity-90 shrink-0" />
                  </div>

                  <div className="flex gap-3 mb-3">
                    <img src={issuedCard.photoUrl} alt="Photo" className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shrink-0" />
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-sm leading-tight truncate">{issuedCard.memberName}</p>
                      <p className="text-[11px] opacity-60 truncate">{issuedCard.email}</p>
                      <p className="text-[11px] opacity-60">{issuedCard.mobile}</p>
                      <Badge className="mt-1 bg-white/20 text-white border-0 text-[10px] w-fit">{issuedCard.planName}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-3">
                    <div className="bg-white/10 rounded-lg p-2">
                      <p className="opacity-50">Card ID</p>
                      <p className="font-mono font-bold text-xs">{issuedCard.cardNumber}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <p className="opacity-50">Valid Until</p>
                      <p className="font-bold">{fmtDate(issuedCard.expiryDate)}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 col-span-2">
                      <p className="opacity-50 mb-0.5">Libraries</p>
                      <p className="font-medium leading-tight">
                        {(issuedCard.libraries ?? []).map((lib: any) => lib.name).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white p-1.5 rounded-xl">
                      <QRCode value={issuedCard.qrPayload} size={90} level="M" />
                    </div>
                  </div>
                  <p className="text-center text-[10px] opacity-40 mt-1.5">Scan at library entry / book issuance</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={downloadCard} variant="outline" className="flex-1">
                    <Download size={16} className="mr-2" /> Download Card
                  </Button>
                  <Button onClick={() => navigate('/login')} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                    Go to Login
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Your card has been saved. You can also access it anytime from your dashboard after logging in.
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            {step < 4 && (
              <div className="flex gap-2 pt-2">
                {step > 0 && (
                  <Button variant="outline" onClick={back} className="flex-1">
                    <ChevronLeft size={16} className="mr-1" /> Back
                  </Button>
                )}
                {step < 3 && (
                  <Button onClick={next} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                    Next <ChevronRight size={16} className="ml-1" />
                  </Button>
                )}
              </div>
            )}

            {step === 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Already have an account?{' '}
                <span className="text-accent cursor-pointer hover:underline" onClick={() => navigate('/login')}>Sign In</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
