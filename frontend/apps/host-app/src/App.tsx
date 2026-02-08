import React, { JSX, useEffect, useState } from "react";
import { PlusCircle, ListTodo, ChevronRight, LogOut } from "lucide-react";
import { componentRegistry } from "./lib/registry";
import {
  CreateActionPage,
  ActionsListPage,
  ActionDetailPage,
  LoginPage,
} from "./pages";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";

// Dynamically import MFE registrations
const loadMFERegistrations = async () => {
  try {
    const { userWorkflowRegistration } = await import("user_app/workflow");
    const { accountWorkflowRegistration } =
      await import("account_app/workflow");
    const { promotionWorkflowRegistration } =
      await import("promotion_app/workflow");

    componentRegistry.register(userWorkflowRegistration);
    componentRegistry.register(accountWorkflowRegistration);
    componentRegistry.register(promotionWorkflowRegistration);

    console.log("✅ All MFE workflow components registered successfully");
  } catch (error) {
    console.error("❌ Error loading MFE registrations:", error);
  }
};

// Wrapper component to handle auth redirects
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const { user, logout, isMaker, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    loadMFERegistrations().then(() => {
      setIsLoading(false);
    });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-700">
          Loading Workflow System...
        </h2>
        <p className="text-slate-500">Initializing micro frontends...</p>
      </div>
    );
  }

  const navItems = [
    { id: "list", label: "All Actions", icon: ListTodo, path: "/actions" },
    ...(isMaker
      ? [
          {
            id: "create",
            label: "Create New",
            icon: PlusCircle,
            path: "/actions/create",
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              W
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-bold text-white tracking-tight">
                Workflow.io
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-slate-800 hover:text-white w-full text-left"
            >
              <item.icon
                size={22}
                className="text-slate-400 group-hover:text-blue-400"
              />
              {isSidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ChevronRight
              size={20}
              className={`transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`}
            />
            {isSidebarOpen && (
              <span className="text-sm font-medium">Collapse</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-800">
              Workflow Actions
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105 ${user?.role === "CHECKER" ? "bg-green-600 shadow-green-100 shadow-lg" : "bg-blue-600 shadow-blue-100 shadow-lg"}`}
              >
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {user?.username}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${user?.role === "CHECKER" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              title="Logout"
            >
              <LogOut
                size={20}
                className="group-hover:translate-x-0.5 transition-transform"
              />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/actions" element={<ActionsListPage />} />
              <Route path="/actions/create" element={<CreateActionPage />} />
              <Route
                path="/actions/:id"
                element={<ActionDetailPageWrapper />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/actions" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

// Wrapper to extract actionId param for ActionDetailPage
import { useParams } from "react-router-dom";
const ActionDetailPageWrapper = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/actions" replace />;
  return <ActionDetailPage actionId={id} />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
