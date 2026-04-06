import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BooksProvider } from "@/contexts/BooksContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import DepartmentSelect from "./pages/DepartmentSelect";
import LibraryBranches from "./pages/LibraryBranches";
import BookSearch from "./pages/BookSearch";
import AddResource from "./pages/AddResource";
import MembersPage from "./pages/MembersPage";
import BorrowRequests from "./pages/BorrowRequests";
import ReadersPage from "./pages/ReadersPage";
import FeesPage from "./pages/FeesPage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import DigitalResources from "./pages/DigitalResources";
import Notifications from "./pages/Notifications";
import CirculationManagement from "./pages/CirculationManagement";
import BookCirculationPage from "./pages/BookCirculationPage";
import ResponsivePreview from "./pages/ResponsivePreview";
import SettingsPage from "./pages/SettingsPage";
import ReportsAnalyticsPage from "./pages/ReportsAnalyticsPage";
import AddMemberPage from "./pages/AddMemberPage";
import LibraryReadersPage from "./pages/LibraryReadersPage";
import ReadersHistoryPage from "./pages/ReadersHistoryPage";
import AllResourcesPage from "./pages/AllResourcesPage";
import AdminRequestsPage from "./pages/AdminRequestsPage";
import BorrowedResourcesPage from "./pages/BorrowedResourcesPage";
import RenewalRequestsPage from "./pages/RenewalRequestsPage";
import AdminHistoryPage from "./pages/AdminHistoryPage";
import CitizenHistoryPage from "./pages/CitizenHistoryPage";
import CitizenMyRequestsPage from "./pages/CitizenMyRequestsPage";
import ResourceManagement from "./pages/ResourceManagement";
import SignUpPage from "./pages/SignUpPage";
import LibraryLocationManagement from "./pages/LibraryLocationManagement";

import LibraryCardPage from "./pages/LibraryCardPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

/** Route only accessible to specific roles. Redirects to /dashboard if role not allowed. */
function RoleRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/resources/management" element={<RoleRoute roles={['admin','librarian']}><ResourceManagement /></RoleRoute>} />
      <Route path="/responsive-preview" element={<RoleRoute roles={['admin']}><ResponsivePreview /></RoleRoute>} />
      <Route path="/departments" element={<ProtectedRoute><DepartmentSelect /></ProtectedRoute>} />
      <Route path="/libraries" element={<RoleRoute roles={['admin','librarian']}><LibraryBranches /></RoleRoute>} />
      <Route path="/books/search" element={<ProtectedRoute><BookSearch /></ProtectedRoute>} />
      <Route path="/resources/add" element={<RoleRoute roles={['admin','librarian']}><AddResource /></RoleRoute>} />
      <Route path="/resources" element={<ProtectedRoute><AllResourcesPage /></ProtectedRoute>} />
      <Route path="/resources/digital" element={<ProtectedRoute><DigitalResources /></ProtectedRoute>} />
      <Route path="/borrow-requests" element={<RoleRoute roles={['citizen']}><BorrowRequests /></RoleRoute>} />
      <Route path="/readers/check-in" element={<RoleRoute roles={['admin','librarian']}><LibraryReadersPage /></RoleRoute>} />
      <Route path="/readers/checked-in" element={<RoleRoute roles={['admin','librarian']}><ReadersPage /></RoleRoute>} />
      <Route path="/readers/history" element={<RoleRoute roles={['admin','librarian']}><ReadersHistoryPage /></RoleRoute>} />
      <Route path="/members/add" element={<RoleRoute roles={['admin','librarian']}><AddMemberPage /></RoleRoute>} />
      <Route path="/members" element={<RoleRoute roles={['admin','librarian']}><MembersPage /></RoleRoute>} />
      <Route path="/admin/requests-approve" element={<RoleRoute roles={['admin','librarian']}><AdminRequestsPage /></RoleRoute>} />
      <Route path="/admin/libraries" element={<RoleRoute roles={['admin']}><LibraryLocationManagement /></RoleRoute>} />
      <Route path="/admin/requests-borrow" element={<RoleRoute roles={['admin','librarian']}><AdminRequestsPage /></RoleRoute>} />
      <Route path="/admin/borrowed" element={<RoleRoute roles={['admin','librarian']}><BorrowedResourcesPage /></RoleRoute>} />
      <Route path="/admin/renewals" element={<RoleRoute roles={['admin','librarian']}><RenewalRequestsPage /></RoleRoute>} />
      <Route path="/admin/history" element={<RoleRoute roles={['admin','librarian']}><AdminHistoryPage /></RoleRoute>} />
      <Route path="/circulation" element={<RoleRoute roles={['admin','librarian']}><CirculationManagement /></RoleRoute>} />
      <Route path="/circulation/books" element={<RoleRoute roles={['admin','librarian']}><BookCirculationPage /></RoleRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/user/requests" element={<RoleRoute roles={['citizen']}><CitizenMyRequestsPage /></RoleRoute>} />
      <Route path="/user/borrowed" element={<RoleRoute roles={['citizen']}><BorrowedResourcesPage /></RoleRoute>} />
      <Route path="/user/history" element={<RoleRoute roles={['citizen']}><CitizenHistoryPage /></RoleRoute>} />
      <Route path="/settings" element={<RoleRoute roles={['admin','librarian']}><SettingsPage /></RoleRoute>} />
      <Route path="/reports" element={<RoleRoute roles={['admin','librarian']}><ReportsAnalyticsPage /></RoleRoute>} />
      <Route path="/reports-analytics" element={<RoleRoute roles={['admin','librarian']}><ReportsAnalyticsPage /></RoleRoute>} />
      <Route path="/fees" element={<ProtectedRoute><FeesPage /></ProtectedRoute>} />
      <Route path="/my-card" element={<RoleRoute roles={['citizen']}><LibraryCardPage /></RoleRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
        <ErrorBoundary>
          <AuthProvider>
            <BooksProvider>
              <AccessibilityProvider>
                <AppRoutes />
              </AccessibilityProvider>
            </BooksProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
