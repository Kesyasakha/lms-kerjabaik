import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuthStore } from "@/fitur/autentikasi/stores/authStore";

// Layouts
import { MainLayout } from "@/shared/komponen/layout/MainLayout";

// Auth pages
import { LoginPage } from "@/fitur/autentikasi/pages/LoginPage";
import { RegisterPage } from "@/fitur/autentikasi/pages/RegisterPage";

// Dashboard pages
import { PembelajarDashboard } from "@/fitur/dasbor/pages/PembelajarDashboard";

// User management pages
import { UsersPage } from "@/fitur/pengguna/pages/UsersPage";

// Course management pages
import { CoursesPage } from "@/fitur/kursus/pages/CoursesPage";
import { CourseDetailPage } from "@/fitur/kursus/pages/CourseDetailPage";
import { CourseBuilderPage } from "@/fitur/kursus/pages/CourseBuilderPage";
import { LearningRoomPage } from "@/fitur/pembelajar/pages/LearningRoomPage";
import { AssignmentsPage } from "@/fitur/pembelajar/pages/AssignmentsPage";
import { AssignmentDetailPage } from "@/fitur/pembelajar/pages/AssignmentDetailPage";
import { AssessmentsListPage } from "@/fitur/pembelajar/pages/AssessmentsListPage";
import { TakeAssessmentPage } from "@/fitur/pembelajar/pages/TakeAssessmentPage";
import { AssessmentResultsPage } from "@/fitur/pembelajar/pages/AssessmentResultsPage";

// Assessment pages
import { AssessmentsPage } from "@/fitur/penilaian/pages/AssessmentsPage";
import { AssessmentBuilderPage } from "@/fitur/penilaian/pages/AssessmentBuilderPage";
import { QuizTakerPage } from "@/fitur/penilaian/pages/QuizTakerPage";

// Reports pages
import { ReportsPage } from "@/fitur/laporan/pages/ReportsPage";

// Superadmin pages - Lazy loaded (handle named exports)
const SuperadminDashboard = lazy(() => import("@/fitur/dasbor/pages/SuperadminDashboard").then(m => ({ default: m.SuperadminDashboard })));
const TenantsPage = lazy(() => import("@/fitur/superadmin/pages/TenantsPage").then(m => ({ default: m.TenantsPage })));
const TenantDetailPage = lazy(() => import("@/fitur/superadmin/pages/TenantDetailPage").then(m => ({ default: m.TenantDetailPage })));
const AnalyticsPage = lazy(() => import("@/fitur/superadmin/pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const AuditLogsPage = lazy(() => import("@/fitur/superadmin/pages/AuditLogsPage").then(m => ({ default: m.AuditLogsPage })));
const GlobalUsersPage = lazy(() => import("@/fitur/superadmin/pages/GlobalUsersPage").then(m => ({ default: m.GlobalUsersPage })));

// Admin pages - Lazy loaded (handle named exports)
const HalamanPenggunaAdmin = lazy(() => import("@/fitur/admin/pages/HalamanPenggunaAdmin").then(m => ({ default: m.HalamanPenggunaAdmin })));
const HalamanKursusAdmin = lazy(() => import("@/fitur/admin/pages/HalamanKursusAdmin").then(m => ({ default: m.HalamanKursusAdmin })));
const HalamanDetailKursusAdmin = lazy(() => import("@/fitur/admin/pages/HalamanDetailKursusAdmin").then(m => ({ default: m.HalamanDetailKursusAdmin })));
const HalamanDasborAdmin = lazy(() => import("@/fitur/admin/pages/HalamanDasborAdmin").then(m => ({ default: m.HalamanDasborAdmin })));
const HalamanLaporanAdmin = lazy(() => import("@/fitur/admin/pages/HalamanLaporanAdmin").then(m => ({ default: m.HalamanLaporanAdmin })));

// Template Preview - Lazy loaded
const PreviewLayout = lazy(() => import("@/fitur/template-preview/layouts/PreviewLayout"));
const DashboardPreview = lazy(() => import("@/fitur/template-preview/pages/DashboardPreview").then(m => ({ default: m.DashboardPreview })));
const SuperadminDashboardPreview = lazy(() => import("@/fitur/template-preview/pages/SuperadminDashboardPreview").then(m => ({ default: m.SuperadminDashboardPreview })));
const TenantListPreview = lazy(() => import("@/fitur/template-preview/pages/TenantListPreview").then(m => ({ default: m.TenantListPreview })));

// Instructor pages - Lazy loaded (default exports)
const InstructorDashboard = lazy(() => import("@/fitur/instruktur/pages/InstructorDashboard"));
const InstructorCoursesPage = lazy(() => import("@/fitur/instruktur/pages/InstructorCoursesPage"));
const InstructorCourseDetailPage = lazy(() => import("@/fitur/instruktur/pages/InstructorCourseDetailPage"));
const CourseContentEditorPage = lazy(() => import("@/fitur/instruktur/pages/CourseContentEditorPage"));
const AssessmentCenterPage = lazy(() => import("@/fitur/instruktur/pages/AssessmentCenterPage"));
const StudentProgressPage = lazy(() => import("@/fitur/instruktur/pages/StudentProgressPage"));

// Loading Component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Dashboard Router berdasarkan role
function DashboardRouter() {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "superadmin":
      return (
        <Suspense fallback={<PageLoader />}>
          <SuperadminDashboard />
        </Suspense>
      );
    case "admin":
      return <Navigate to="/admin" replace />;
    case "instruktur":
      return <Navigate to="/instruktur/dashboard" replace />;
    case "pembelajar":
      return <Navigate to="/pembelajar/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export function AppRouter() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<DashboardRouter />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/pembelajar/dashboard" element={<PembelajarDashboard />} />

        {/* Superadmin Dashboard - Lazy Loaded */}
        <Route
          path="/superadmin"
          element={
            <Suspense fallback={<PageLoader />}>
              <SuperadminDashboard />
            </Suspense>
          }
        />

        {/* User Management */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Course Management */}
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/kursus/:id" element={<CourseDetailPage />} />

        {/* Learner Courses */}
        <Route path="/pembelajar/courses" element={<CoursesPage />} />
        <Route path="/pembelajar/kursus/:id" element={<CourseDetailPage />} />

        <Route path="/pembelajar/learn/:enrollmentId" element={<LearningRoomPage />} />

        {/* Assignments */}
        <Route path="/pembelajar/assignments" element={<AssignmentsPage />} />
        <Route path="/pembelajar/assignments/:id" element={<AssignmentDetailPage />} />

        {/* Assessments */}
        <Route path="/pembelajar/assessments" element={<AssessmentsListPage />} />
        <Route path="/pembelajar/penilaian/:assessmentId" element={<TakeAssessmentPage />} />
        <Route path="/pembelajar/penilaian/:assessmentId/take/:attemptId" element={<TakeAssessmentPage />} />
        <Route path="/pembelajar/penilaian/:assessmentId/results" element={<AssessmentResultsPage />} />
        <Route
          path="/kursus/new"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin", "admin", "instruktur"]}
            >
              <CourseBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kursus/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin", "admin", "instruktur"]}
            >
              <CourseBuilderPage />
            </ProtectedRoute>
          }
        />

        {/* Assessments */}
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route
          path="/penilaian/new"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin", "admin", "instruktur"]}
            >
              <AssessmentBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penilaian/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["superadmin", "admin", "instruktur"]}
            >
              <AssessmentBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route path="/penilaian/:id/take" element={<QuizTakerPage />} />

        {/* Reports */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* Superadmin Routes - Lazy Loaded */}
        <Route
          path="/superadmin/tenants"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <TenantsPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/superadmin/tenants/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <TenantDetailPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/superadmin/analytics"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <AnalyticsPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/superadmin/audit-logs"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <AuditLogsPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/superadmin/users"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <GlobalUsersPage />
              </ProtectedRoute>
            </Suspense>
          }
        />

        {/* Instructor Routes - Lazy Loaded */}
        <Route
          path="/instruktur/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["instruktur"]}>
                <InstructorDashboard />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/instruktur/courses"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["instruktur"]}>
                <InstructorCoursesPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/instruktur/kursus/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["instruktur"]}>
                <InstructorCourseDetailPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/instruktur/kursus/:id/edit"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["instruktur"]}>
                <CourseContentEditorPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/instruktur/assessments"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["instruktur"]}>
                <AssessmentCenterPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/instruktur/students"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["instruktur"]}>
                <StudentProgressPage />
              </ProtectedRoute>
            </Suspense>
          }
        />

        {/* Admin Routes - Lazy Loaded */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["admin"]}>
                <HalamanDasborAdmin />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["admin"]}>
                <HalamanPenggunaAdmin />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["admin"]}>
                <HalamanKursusAdmin />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/kursus/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["admin"]}>
                <HalamanDetailKursusAdmin />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute allowedRoles={["admin"]}>
                <HalamanLaporanAdmin />
              </ProtectedRoute>
            </Suspense>
          }
        />
      </Route>

      <Route
        path="/template-preview/*"
        element={
          <Suspense fallback={<PageLoader />}>
            <PreviewLayout>
              <Routes>
                <Route path="dashboard" element={<DashboardPreview />} />
                <Route path="superadmin" element={<SuperadminDashboardPreview />} />
                <Route path="tenants" element={<TenantListPreview />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </PreviewLayout>
          </Suspense>
        }
      />

      {/* Fallback */}
      <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
