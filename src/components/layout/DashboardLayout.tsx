import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuth";
import {
  Home,
  CreditCard,
  Target,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout } = useAuthState();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

   const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return 'U';
    const firstInitial = user?.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = user?.lastName?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Expenses", href: "/expenses", icon: CreditCard },
    { name: "Budgets", href: "/budgets", icon: Target },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  const getNavItemClass = (path: string) => {
    const isActive = location.pathname === path;
    return `group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
      isActive
        ? "text-blue-700 bg-blue-50/80 shadow-sm"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
    }`;
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Sticky Header */}
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"
            : "bg-white/60 backdrop-blur-sm border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Finance<span className="text-blue-600">.</span>
                    <span className="text-green-600">AI</span>
                  </h1>
                </div>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:ml-10 lg:flex lg:space-x-2">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={getNavItemClass(item.href)}
                    >
                      {isActive && <IconComponent className="h-4 w-4 mr-2" />}
                      {item.name}
                      {isActive && (
                        <div className="absolute inset-0 bg-blue-100/50 rounded-xl -z-10 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/60 rounded-xl border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-300"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-white/80 backdrop-blur-md">
            <div className="px-4 py-6 space-y-3">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={getNavItemClass(item.href)}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {item.name}
                  </a>
                );
              })}

              {/* Mobile User Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50/80 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};
