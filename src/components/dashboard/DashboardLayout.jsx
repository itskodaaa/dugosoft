import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import ChatSupportWidget from "@/components/shared/ChatSupportWidget";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <DashboardSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-60"}`}>
        <DashboardHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="p-3 sm:p-5 lg:p-8 min-h-[calc(100vh-4rem)] pb-safe">
          <Outlet />
        </main>
      </div>
      <ChatSupportWidget />
    </div>
  );
}