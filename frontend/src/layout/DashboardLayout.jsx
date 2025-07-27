import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ThemeSwitcher from "@/components/themeSwitcher";
import { ArrowRight } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/AuthStore";
import { NavUser } from "@/components/nav-user";
function DashboardLayout() {
  const navigate = useNavigate(); // Move this inside the component
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const handleLogout = () => {
    logout(); // Call the logout function from the store
    toast({
      title: "Logged Out",
      description: "You have successfully logged out.",
      variant: "default", // You can change the variant if needed
    });
    navigate("/login"); // Redirect the user to the login page after logging out
  };

  const location = useLocation(); // returns object like { pathname: "/dashboard/add-item" }

  // Break down the path
  const pathnames = location.pathname.split("/").filter((x) => x);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between pr-6 gap-2 transition-[width,height] ease-linear w-full mb-4 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14 z-10">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard/home">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {pathnames.map((segment, index) => {
                  const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                  const label = segment
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());
                  const isLast = index === pathnames.length - 1;

                  return (
                    <React.Fragment key={to}>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild className="hidden md:block">
                            <Link to={to}>{label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <div>
                {user ? (
                  <NavUser user={user}/>
                ) : (
                  <button
                    className="flex items-center gap-2 border-border border rounded-full px-6 py-2 text-primary hover:bg-accent transition-all"
                    onClick={() => navigate("/login")}
                  >
                    Login
                    <ArrowRight className="h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardLayout;
