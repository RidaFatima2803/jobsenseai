"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/admins", label: "Admin Accounts", icon: Shield },
];

export default function AdminSidebar({ user }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-card border-r flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">Admin Portal</p>
          <p className="text-xs text-muted-foreground truncate">Job-Sense AI</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "group flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </span>
                {active && <ChevronRight className="h-3 w-3 opacity-60" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t space-y-1">
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          {user?.role === "superadmin" && (
            <Badge variant="secondary" className="mt-1.5 text-[10px] px-1.5 py-0">
              Super Admin
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
