import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { IndianRupee, CheckCircle, AlertCircle, Info, Plus, Pencil, Trash2, Globe, Building2, Save } from 'lucide-react';
import { fmtDate } from '@/lib/formatDate';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FeesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) { navigate('/login'); return null; }
  if (user.role === 'citizen') return <CitizenFeesPage />;
  return <AdminLibrarianFeesPage />;
}

// ── Citizen ───────────────────────────────────────────────────────────────────
function CitizenFeesPage() {
  const { user } = useAuth();
  const [myFines, setMyFines] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedFine, setSelectedFine] = useState<any | null>(null);

  useEffect(() => {
    api.fines.list({}).then(setMyFines).catch(console.error);
    api.memberships.list().then(setPlans).catch(console.error);
  }, []);

  const pending = myFines.filter(f => f.status === 'pending');
  const paid = myFines.filter(f => f.status === 'paid');
  const totalPending = pending.reduce((s: number, f: any) => s + f.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">My Fines & Payments</h1>
          <p className="text-muted-foreground mt-1">View your fines and available membership plans</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Pending Amount', value: `₹${totalPending}`, color: 'text-warning', icon: AlertCircle },
            { label: 'Pending Fines', value: pending.length, color: 'text-destructive', icon: AlertCircle },
            { label: 'Paid Fines', value: paid.length, color: 'text-success', icon: CheckCircle },
          ].map(s => (
            <Card key={s.label} className="stat-card">
              <CardContent className="p-3 md:p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl md:text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color}/30`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPending > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">You have ₹{totalPending} in pending fines</p>
                <p className="text-xs text-muted-foreground mt-1">Please pay to avoid suspension of borrowing privileges</p>
              </div>
            </CardContent>
          </Card>
        )}

        {myFines.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Rate/Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myFines.map((fine: any) => (
                    <TableRow key={fine.id}>
                      <TableCell className="font-medium text-sm">{fine.book?.title ?? '—'}</TableCell>
                      <TableCell className="font-semibold">₹{fine.amount}</TableCell>
                      <TableCell className="text-sm">{fine.daysOverdue ?? 0} days</TableCell>
                      <TableCell className="text-sm">₹{fine.dailyFineRate ?? 5}/day</TableCell>
                      <TableCell>
                        <Badge className={fine.status === 'paid' ? 'bg-success/15 text-success border-0' : fine.status === 'waived' ? 'bg-muted text-muted-foreground border-0' : 'bg-warning/15 text-warning border-0'}>
                          {fine.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fine.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => setSelectedFine(fine)}>
                            <Info size={14} className="mr-1" /> Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No fines on your account. Great job!</p>
            </CardContent>
          </Card>
        )}

        {plans.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Available Membership Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((plan: any) => (
                <Card key={plan.id}>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-secondary rounded-md p-2"><p className="text-xs text-muted-foreground">Monthly</p><p className="font-semibold">₹{plan.monthlyPrice}</p></div>
                      <div className="bg-secondary rounded-md p-2"><p className="text-xs text-muted-foreground">Yearly</p><p className="font-semibold">₹{plan.yearlyPrice}</p></div>
                      <div className="bg-secondary rounded-md p-2"><p className="text-xs text-muted-foreground">Max Books</p><p className="font-semibold">{plan.maxBooks}</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Dialog open={!!selectedFine} onOpenChange={() => setSelectedFine(null)}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader><DialogTitle>Fine Details</DialogTitle></DialogHeader>
            {selectedFine && (
              <div className="space-y-3">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Book:</span><span className="font-medium">{selectedFine.book?.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Due Date:</span><span className="font-medium">{fmtDate(selectedFine.dueDate)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Days Overdue:</span><span className="font-bold text-destructive">{selectedFine.daysOverdue} days</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rate/Day:</span><span className="font-medium">₹{selectedFine.dailyFineRate}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-medium">Total Fine:</span><span className="font-bold text-accent text-lg">₹{selectedFine.amount}</span></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// ── Admin / Librarian ─────────────────────────────────────────────────────────
function AdminLibrarianFeesPage() {
  const { user, selectedLibrary } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [localLib, setLocalLib] = useState<string | null>(selectedLibrary);
  const libraryToUse = isAdmin ? localLib : selectedLibrary;
  const [allLibraries, setAllLibraries] = useState<any[]>([]);
  const [libraryFines, setLibraryFines] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedFine, setSelectedFine] = useState<any | null>(null);
  const [planDialog, setPlanDialog] = useState<'add' | 'edit' | null>(null);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const emptyForm = { name: '', description: '', monthlyPrice: '', yearlyPrice: '', maxBooks: '', color: 'gray', libraryIds: [] as string[] };
  const [planForm, setPlanForm] = useState(emptyForm);
  const [stdRate, setStdRate] = useState('5');
  const [premRate, setPremRate] = useState('10');

  useEffect(() => {
    api.libraries.list().then(setAllLibraries).catch(console.error);
    api.memberships.list().then(setPlans).catch(console.error);
    api.settings.getSystem().then(s => { setStdRate(String(s.standardFineRate)); setPremRate(String(s.premiumFineRate)); }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!libraryToUse) { setLibraryFines([]); return; }
    api.fines.list({ libraryId: libraryToUse }).then(setLibraryFines).catch(console.error);
  }, [libraryToUse]);

  const pending = libraryFines.filter(f => f.status === 'pending');
  const paid = libraryFines.filter(f => f.status === 'paid');
  const waived = libraryFines.filter(f => f.status === 'waived');
  const totalPending = pending.reduce((s: number, f: any) => s + f.amount, 0);

  const visiblePlans = isAdmin ? plans : plans.filter((p: any) => {
    const ids = (p.libraries ?? []).map((l: any) => l.id ?? l);
    return ids.length === 0 || ids.includes(selectedLibrary || '');
  });

  const handleWaive = async (id: string) => {
    try { await api.fines.waive(id); setLibraryFines(prev => prev.map(f => f.id === id ? { ...f, status: 'waived' } : f)); toast.success('Fine waived'); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleSavePlan = async () => {
    if (!planForm.name || !planForm.monthlyPrice || !planForm.yearlyPrice || !planForm.maxBooks) { toast.error('Fill all required fields'); return; }
    const data = { name: planForm.name, description: planForm.description, monthlyPrice: Number(planForm.monthlyPrice), yearlyPrice: Number(planForm.yearlyPrice), maxBooks: Number(planForm.maxBooks), color: planForm.color, libraryIds: planForm.libraryIds };
    try {
      if (planDialog === 'add') { const p = await api.memberships.create(data); setPlans(prev => [...prev, p]); toast.success(`Plan "${data.name}" added`); }
      else if (editingPlan) { const p = await api.memberships.update(editingPlan.id, data); setPlans(prev => prev.map(x => x.id === p.id ? p : x)); toast.success(`Plan "${data.name}" updated`); }
      setPlanDialog(null);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeletePlan = async () => {
    if (!deletePlanId) return;
    try { await api.memberships.delete(deletePlanId); setPlans(prev => prev.filter(p => p.id !== deletePlanId)); toast.success('Plan deleted'); setDeletePlanId(null); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleSaveRates = async () => {
    try { await api.settings.updateSystem({ standardFineRate: parseFloat(stdRate), premiumFineRate: parseFloat(premRate) }); toast.success('Fine rates saved'); }
    catch (e: any) { toast.error(e.message); }
  };

  const openEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({ name: plan.name, description: plan.description, monthlyPrice: String(plan.monthlyPrice), yearlyPrice: String(plan.yearlyPrice), maxBooks: String(plan.maxBooks), color: plan.color, libraryIds: (plan.libraries ?? []).map((l: any) => l.id ?? l) });
    setPlanDialog('edit');
  };

  const toggleLibrary = (id: string) => setPlanForm(f => ({ ...f, libraryIds: f.libraryIds.includes(id) ? f.libraryIds.filter(x => x !== id) : [...f.libraryIds, id] }));

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="page-header">Fees Management</h1>
          <p className="text-muted-foreground mt-1">Manage fines and membership plans</p>
        </div>

        <Tabs defaultValue="fines" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="fines" className="flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm"><IndianRupee size={14} /> Fines Management</TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm"><CheckCircle size={14} /> Membership Plans</TabsTrigger>
          </TabsList>

          {/* FINES TAB */}
          <TabsContent value="fines" className="space-y-4 mt-4">
            {isAdmin && (
              <Card>
                <CardContent className="p-4">
                  <label className="text-sm font-medium">Select Library</label>
                  <select value={localLib || ''} onChange={e => setLocalLib(e.target.value || null)} className="w-full p-2 border rounded-lg mt-2 text-sm bg-background">
                    <option value="">-- Select a Library --</option>
                    {allLibraries.map(lib => <option key={lib.id} value={lib.id}>{lib.name}</option>)}
                  </select>
                </CardContent>
              </Card>
            )}
            {!libraryToUse ? (
              <Card><CardContent className="p-8 text-center"><AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">{isAdmin ? 'Select a library above' : 'Select a library from the sidebar'}</p></CardContent></Card>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[{ label: 'Total Pending', value: `₹${totalPending}`, color: 'text-warning' }, { label: 'Pending Count', value: pending.length, color: 'text-destructive' }, { label: 'Collected', value: paid.length, color: 'text-success' }, { label: 'Waived', value: waived.length, color: 'text-info' }].map(s => (
                    <Card key={s.label} className="stat-card"><CardContent className="p-3 md:p-4 text-center"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl md:text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></CardContent></Card>
                  ))}
                </div>
                {libraryFines.length > 0 ? (
                  <Card>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Book</TableHead><TableHead>Amount</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {libraryFines.map((fine: any) => (
                            <TableRow key={fine.id}>
                              <TableCell className="font-medium text-sm">{fine.user?.name ?? '—'}</TableCell>
                              <TableCell className="text-sm">{fine.book?.title ?? '—'}</TableCell>
                              <TableCell className="font-semibold">₹{fine.amount}</TableCell>
                              <TableCell className="text-sm">{fine.daysOverdue ?? 0}d</TableCell>
                              <TableCell><Badge className={fine.status === 'paid' ? 'bg-success/15 text-success border-0' : fine.status === 'waived' ? 'bg-muted text-muted-foreground border-0' : 'bg-warning/15 text-warning border-0'}>{fine.status}</Badge></TableCell>
                              <TableCell>
                                {fine.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline" onClick={() => setSelectedFine(fine)}><Info size={14} className="mr-1" /> Details</Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleWaive(fine.id)}>Waive</Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                ) : (
                  <Card><CardContent className="p-8 text-center"><CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-3" /><p className="text-muted-foreground">No fines for this library</p></CardContent></Card>
                )}
              </>
            )}
          </TabsContent>

          {/* PLANS TAB */}
          <TabsContent value="plans" className="space-y-4 mt-4">
            {isAdmin && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">System-Wide Default Fine Rates</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">These apply to all libraries unless overridden.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Standard Fine Rate (₹/day)</Label><Input type="number" min="0" value={stdRate} onChange={e => setStdRate(e.target.value)} className="mt-1 h-9 text-sm" /></div>
                    <div><Label>Premium Fine Rate (₹/day)</Label><Input type="number" min="0" value={premRate} onChange={e => setPremRate(e.target.value)} className="mt-1 h-9 text-sm" /></div>
                  </div>
                  <Button size="sm" onClick={handleSaveRates} className="bg-accent hover:bg-accent/90 text-accent-foreground"><Save size={14} className="mr-1" /> Save Rates</Button>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{isAdmin ? 'Define plans and assign to libraries.' : 'Plans available for your library.'}</p>
              {isAdmin && <Button size="sm" onClick={() => { setPlanForm(emptyForm); setEditingPlan(null); setPlanDialog('add'); }} className="bg-accent hover:bg-accent/90 text-accent-foreground"><Plus size={14} className="mr-1" /> Add Plan</Button>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visiblePlans.map((plan: any) => (
                <Card key={plan.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0"><p className="font-semibold text-base">{plan.name}</p><p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p></div>
                      {isAdmin && (
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditPlan(plan)}><Pencil size={13} /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeletePlanId(plan.id)}><Trash2 size={13} /></Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-secondary rounded-md p-2"><p className="text-xs text-muted-foreground">Monthly</p><p className="font-semibold">₹{plan.monthlyPrice}</p></div>
                      <div className="bg-secondary rounded-md p-2"><p className="text-xs text-muted-foreground">Yearly</p><p className="font-semibold">₹{plan.yearlyPrice}</p></div>
                      <div className="bg-secondary rounded-md p-2"><p className="text-xs text-muted-foreground">Max Books</p><p className="font-semibold">{plan.maxBooks}</p></div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(plan.libraries ?? []).length === 0
                        ? <Badge variant="secondary" className="text-xs flex items-center gap-1"><Globe size={10} /> All Libraries</Badge>
                        : (plan.libraries ?? []).map((lib: any) => <Badge key={lib.id} variant="outline" className="text-xs flex items-center gap-1"><Building2 size={10} /> {lib.name}</Badge>)
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {visiblePlans.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">{isAdmin ? 'No plans yet.' : 'No plans for your library.'}</CardContent></Card>}
          </TabsContent>
        </Tabs>

        {/* Fine Details Dialog */}
        <Dialog open={!!selectedFine} onOpenChange={() => setSelectedFine(null)}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader><DialogTitle>Fine Details</DialogTitle></DialogHeader>
            {selectedFine && (
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Member:</span><span className="font-medium">{selectedFine.user?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Book:</span><span className="font-medium">{selectedFine.book?.title}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Due Date:</span><span className="font-medium">{fmtDate(selectedFine.dueDate)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Days Overdue:</span><span className="font-bold text-destructive">{selectedFine.daysOverdue} days</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rate/Day:</span><span className="font-medium">₹{selectedFine.dailyFineRate}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="font-medium">Total:</span><span className="font-bold text-accent text-lg">₹{selectedFine.amount}</span></div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add/Edit Plan Dialog */}
        <Dialog open={!!planDialog} onOpenChange={() => setPlanDialog(null)}>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{planDialog === 'add' ? 'Add Plan' : 'Edit Plan'}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-1">
              <div className="space-y-1"><Label>Plan Name *</Label><Input value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Description</Label><Input value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Monthly (₹) *</Label><Input type="number" min="0" value={planForm.monthlyPrice} onChange={e => setPlanForm(f => ({ ...f, monthlyPrice: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Yearly (₹) *</Label><Input type="number" min="0" value={planForm.yearlyPrice} onChange={e => setPlanForm(f => ({ ...f, yearlyPrice: e.target.value }))} /></div>
              </div>
              <div className="space-y-1"><Label>Max Books *</Label><Input type="number" min="1" value={planForm.maxBooks} onChange={e => setPlanForm(f => ({ ...f, maxBooks: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Applicable Libraries</Label>
                <p className="text-xs text-muted-foreground">Leave all unchecked = all libraries</p>
                <div className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                  {allLibraries.map(lib => (
                    <label key={lib.id} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 rounded p-1">
                      <input type="checkbox" checked={planForm.libraryIds.includes(lib.id)} onChange={() => toggleLibrary(lib.id)} />
                      <span className="text-sm">{lib.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setPlanDialog(null)}>Cancel</Button>
              <Button onClick={handleSavePlan} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">{planDialog === 'add' ? 'Add Plan' : 'Save Changes'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Plan Confirm */}
        <Dialog open={!!deletePlanId} onOpenChange={() => setDeletePlanId(null)}>
          <DialogContent className="w-[95vw] max-w-sm">
            <DialogHeader><DialogTitle>Delete Plan?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This cannot be undone.</p>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDeletePlanId(null)}>Cancel</Button>
              <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDeletePlan}><Trash2 size={14} className="mr-1" /> Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
