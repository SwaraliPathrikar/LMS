import { useState, useMemo } from 'react';
import { events, eventRegistrations, members, libraryBranches } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Search, ChevronRight, Plus, Edit, Trash2, Eye, BarChart3, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Event } from '@/types/library';

const categoryIcons: Record<string, string> = {
  reading: '',
  book_fair: '',
  storytelling: '',
  author_talk: '',
  workshop: '',
};

const categoryColors: Record<string, string> = {
  reading: 'bg-blue-100 text-blue-800',
  book_fair: 'bg-purple-100 text-purple-800',
  storytelling: 'bg-pink-100 text-pink-800',
  author_talk: 'bg-orange-100 text-orange-800',
  workshop: 'bg-green-100 text-green-800',
};

export default function Events() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  // Form state for creating/editing events
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'reading' as const,
    startDate: '',
    endDate: '',
    location: '',
    capacity: 100,
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return events;
    const q = query.toLowerCase();
    return events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
  }, [query]);

  const getRegistrationStatus = (eventId: string) => {
    return eventRegistrations.some(er => er.eventId === eventId && er.memberId === user?.id);
  };

  const getEventParticipants = (eventId: string) => {
    return eventRegistrations.filter(er => er.eventId === eventId);
  };

  const handleRegister = () => {
    setIsRegistered(true);
    setTimeout(() => {
      setShowRegisterDialog(false);
      setIsRegistered(false);
    }, 1500);
  };

  const handleCreateEvent = () => {
    alert(`Event "${formData.title}" created successfully!`);
    setFormData({ title: '', description: '', category: 'reading', startDate: '', endDate: '', location: '', capacity: 100 });
    setShowCreateDialog(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    alert(`Event deleted successfully!`);
    setShowManageDialog(false);
  };

  const isAdmin = user?.role === 'admin';
  const isLibrarian = user?.role === 'librarian';
  const isCitizen = user?.role === 'citizen';

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="hidden md:block">
          <h1 className="page-header">Events & Community Programs</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin || isLibrarian ? 'Create, manage, and monitor library events' : 'Discover and register for library events'}
          </p>
        </div>

        {/* Role-Based Tabs */}
        {(isAdmin || isLibrarian) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Events</TabsTrigger>
              <TabsTrigger value="manage">Manage Events</TabsTrigger>
            </TabsList>

            {/* Browse Tab - For All Users */}
            <TabsContent value="browse" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input placeholder="Search events..." className="pl-10 h-12" value={query} onChange={e => setQuery(e.target.value)} />
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {filtered.map(event => {
                  const capacityPercent = (event.registeredCount / event.capacity) * 100;
                  const participants = getEventParticipants(event.id);

                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-all overflow-hidden">
                      <CardContent className="p-0">
                        {/* Event Header */}
                        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 md:p-4 border-b">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{categoryIcons[event.category]}</span>
                              <Badge className={categoryColors[event.category]}>{event.category.replace('_', ' ')}</Badge>
                            </div>
                            {event.status === 'upcoming' && <Badge variant="outline" className="bg-green-50">Upcoming</Badge>}
                          </div>
                          <h3 className="font-semibold text-sm md:text-base text-foreground">{event.title}</h3>
                        </div>

                        {/* Event Details */}
                        <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                          <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar size={14} className="text-accent" />
                              <span>{event.startDate} to {event.endDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin size={14} className="text-accent" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users size={14} className="text-accent" />
                              <span>{event.registeredCount} of {event.capacity} registered</span>
                            </div>
                          </div>

                          {/* Capacity Bar */}
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div className="bg-accent h-full transition-all" style={{ width: `${Math.min(capacityPercent, 100)}%` }} />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowRegisterDialog(true);
                              }}
                              disabled={getRegistrationStatus(event.id) || event.registeredCount >= event.capacity}
                              size="sm"
                              className={`flex-1 ${getRegistrationStatus(event.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-accent hover:bg-accent/90'}`}
                            >
                              {getRegistrationStatus(event.id) ? '✓ Registered' : event.registeredCount >= event.capacity ? 'Full' : 'Register'}
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowParticipantsDialog(true);
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <Eye size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Manage Tab - Admin/Librarian Only */}
            <TabsContent value="manage" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Manage Events</h3>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus size={16} className="mr-2" /> Create Event
                </Button>
              </div>

              {/* Events Management Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">All Events ({events.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No events found</p>
                    ) : (
                      events.map(event => {
                        const participants = getEventParticipants(event.id);
                        return (
                          <div key={event.id} className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-sm">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">{event.startDate}</p>
                                  </div>
                                  <Badge className={event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                    {event.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <p className="text-muted-foreground">Participants</p>
                                    <p className="font-medium">{participants.length}/{event.capacity}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Category</p>
                                    <p className="font-medium capitalize">{event.category}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Location</p>
                                    <p className="font-medium truncate">{event.location}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 w-full md:w-auto">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setShowParticipantsDialog(true);
                                  }}
                                  className="flex-1 md:flex-none"
                                  title="View Participants"
                                >
                                  <BarChart3 size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setShowManageDialog(true);
                                  }}
                                  className="flex-1 md:flex-none"
                                  title="Edit Event"
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:text-destructive flex-1 md:flex-none"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  title="Delete Event"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Citizen View - Browse Only */}
        {isCitizen && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input placeholder="Search events..." className="pl-10 h-12" value={query} onChange={e => setQuery(e.target.value)} />
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {filtered.map(event => {
                const capacityPercent = (event.registeredCount / event.capacity) * 100;

                return (
                  <Card key={event.id} className="hover:shadow-lg transition-all overflow-hidden">
                    <CardContent className="p-0">
                      {/* Event Header */}
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 md:p-4 border-b">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{categoryIcons[event.category]}</span>
                            <Badge className={categoryColors[event.category]}>{event.category.replace('_', ' ')}</Badge>
                          </div>
                          {event.status === 'upcoming' && <Badge variant="outline" className="bg-green-50">Upcoming</Badge>}
                        </div>
                        <h3 className="font-semibold text-sm md:text-base text-foreground">{event.title}</h3>
                      </div>

                      {/* Event Details */}
                      <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                        <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar size={14} className="text-accent" />
                            <span>{event.startDate} to {event.endDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin size={14} className="text-accent" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users size={14} className="text-accent" />
                            <span>{event.registeredCount} of {event.capacity} registered</span>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div className="bg-accent h-full transition-all" style={{ width: `${Math.min(capacityPercent, 100)}%` }} />
                        </div>

                        {/* Register Button */}
                        <Button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowRegisterDialog(true);
                          }}
                          disabled={getRegistrationStatus(event.id) || event.registeredCount >= event.capacity}
                          className={`w-full ${getRegistrationStatus(event.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-accent hover:bg-accent/90'}`}
                        >
                          {getRegistrationStatus(event.id) ? '✓ Registered' : event.registeredCount >= event.capacity ? 'Event Full' : 'Register Now'}
                          <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Registration Dialog - For Citizens */}
        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><strong>Date:</strong> {selectedEvent.startDate} to {selectedEvent.endDate}</p>
                  <p className="text-sm"><strong>Location:</strong> {selectedEvent.location}</p>
                  <p className="text-sm"><strong>Capacity:</strong> {selectedEvent.registeredCount}/{selectedEvent.capacity}</p>
                  <p className="text-sm"><strong>Category:</strong> {selectedEvent.category.replace('_', ' ')}</p>
                </div>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                {isRegistered && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    ✓ Successfully registered for this event!
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegister} disabled={isRegistered} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isRegistered ? 'Registered!' : 'Confirm Registration'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Participants Dialog - For Admin/Librarian */}
        <Dialog open={showParticipantsDialog} onOpenChange={setShowParticipantsDialog}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title} - Participants</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Registered</p>
                    <p className="text-2xl font-bold text-accent">{getEventParticipants(selectedEvent.id).length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="text-2xl font-bold text-primary">{selectedEvent.capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Available Slots</p>
                    <p className="text-2xl font-bold text-info">{selectedEvent.capacity - getEventParticipants(selectedEvent.id).length}</p>
                  </div>
                </div>

                {/* Participants List */}
                <div>
                  <h4 className="font-semibold mb-3">Registered Participants</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getEventParticipants(selectedEvent.id).map(reg => {
                      const member = members.find(m => m.id === reg.memberId);
                      return (
                        <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div>
                            <p className="font-medium text-sm">{member?.name}</p>
                            <p className="text-xs text-muted-foreground">{member?.email}</p>
                          </div>
                          <Badge variant="outline">{reg.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowParticipantsDialog(false)}>
                Close
              </Button>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Export List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Event Dialog - Admin/Librarian Only */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Title</label>
                <Input
                  placeholder="e.g., Summer Reading Program"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Event description..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg mt-1 text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as 'reading' | 'book_fair' | 'storytelling' | 'author_talk' | 'workshop' })}
                    className="w-full p-2 border rounded-lg mt-1 text-sm"
                  >
                    <option value="reading">Reading Program</option>
                    <option value="book_fair">Book Fair</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="author_talk">Author Talk</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <select
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 border rounded-lg mt-1 text-sm"
                >
                  <option value="">Select Library</option>
                  {libraryBranches.map(lib => (
                    <option key={lib.id} value={lib.name}>{lib.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Event Dialog */}
        <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
          <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Event</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><strong>Title:</strong> {selectedEvent.title}</p>
                  <p className="text-sm"><strong>Date:</strong> {selectedEvent.startDate} to {selectedEvent.endDate}</p>
                  <p className="text-sm"><strong>Location:</strong> {selectedEvent.location}</p>
                  <p className="text-sm"><strong>Participants:</strong> {getEventParticipants(selectedEvent.id).length}/{selectedEvent.capacity}</p>
                  <p className="text-sm"><strong>Status:</strong> {selectedEvent.status}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>You can edit event details or delete this event.</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowManageDialog(false)}>
                Close
              </Button>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Edit size={16} className="mr-2" /> Edit Event
              </Button>
              <Button
                onClick={() => handleDeleteEvent(selectedEvent?.id || '')}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <Trash2 size={16} className="mr-2" /> Delete Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
