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
import ResourceManagement from "./pages/ResourceManagement";
import SignUpPage from "./pages/SignUpPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignUpPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/resources/management" element={<ProtectedRoute><ResourceManagement /></ProtectedRoute>} />
      <Route path="/responsive-preview" element={<ProtectedRoute><ResponsivePreview /></ProtectedRoute>} />
      <Route path="/departments" element={<ProtectedRoute><DepartmentSelect /></ProtectedRoute>} />
      <Route path="/libraries" element={<ProtectedRoute><LibraryBranches /></ProtectedRoute>} />
      <Route path="/books/search" element={<ProtectedRoute><BookSearch /></ProtectedRoute>} />
      <Route path="/resources/add" element={<ProtectedRoute><AddResource /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><AllResourcesPage /></ProtectedRoute>} />
      <Route path="/resources/digital" element={<ProtectedRoute><DigitalResources /></ProtectedRoute>} />
      <Route path="/borrow-requests" element={<ProtectedRoute><BorrowRequests /></ProtectedRoute>} />
      <Route path="/readers/check-in" element={<ProtectedRoute><LibraryReadersPage /></ProtectedRoute>} />
      <Route path="/readers/checked-in" element={<ProtectedRoute><ReadersPage /></ProtectedRoute>} />
      <Route path="/readers/history" element={<ProtectedRoute><ReadersHistoryPage /></ProtectedRoute>} />
      <Route path="/members/add" element={<ProtectedRoute><AddMemberPage /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
      <Route path="/admin/requests-approve" element={<ProtectedRoute><AdminRequestsPage /></ProtectedRoute>} />
      <Route path="/admin/requests-borrow" element={<ProtectedRoute><AdminRequestsPage /></ProtectedRoute>} />
      <Route path="/admin/borrowed" element={<ProtectedRoute><BorrowedResourcesPage /></ProtectedRoute>} />
      <Route path="/admin/renewals" element={<ProtectedRoute><RenewalRequestsPage /></ProtectedRoute>} />
      <Route path="/admin/history" element={<ProtectedRoute><AdminHistoryPage /></ProtectedRoute>} />
      <Route path="/circulation" element={<ProtectedRoute><CirculationManagement /></ProtectedRoute>} />
      <Route path="/circulation/books" element={<ProtectedRoute><BookCirculationPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/user/requests" element={<ProtectedRoute><BorrowRequests /></ProtectedRoute>} />
      <Route path="/user/borrowed" element={<ProtectedRoute><BorrowedResourcesPage /></ProtectedRoute>} />
      <Route path="/user/history" element={<ProtectedRoute><CitizenHistoryPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsAnalyticsPage /></ProtectedRoute>} />
      <Route path="/reports-analytics" element={<ProtectedRoute><ReportsAnalyticsPage /></ProtectedRoute>} />
      <Route path="/fees" element={<ProtectedRoute><FeesPage /></ProtectedRoute>} />
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
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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
