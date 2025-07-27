import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useAuthStore } from "@/store/AuthStore";

export function NavUser() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useSidebar();

  useEffect(() => {
    refreshUser();
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();

    toast({
      title: "Logged Out",
      description: "You have successfully logged out.",
      variant: "default",
    });

    navigate("/login");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu onOpenChange={(open) => open && refreshUser()}>
          <DropdownMenuTrigger asChild>
            <div className="relative rounded-md p-[1px] bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500">
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent bg-card data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">K5</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-muted-foreground text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg"
            side={isMobile ? "bottom" : "bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg text-sans">K5</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-muted-foreground font-normal text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {user.isVerified ? (
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4 text-green-500" />
                  Verified
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                  <a href="/verify-email">Verify Account</a>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-accent hover:text-accent">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="text-accent hover:text-accent">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer bg-destructive text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
