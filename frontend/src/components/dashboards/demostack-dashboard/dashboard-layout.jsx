import { DashboardSidebar } from "./components/demostack/sidebar";
import { DashboardTopbar } from "./components/demostack/topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import "./dashboard.css";
function DashboardLayout({ children }) {
  return <SidebarProvider
    className="demostack-dashboard h-svh gap-6 overflow-hidden no-scrollbar"
    style={{
      "--sidebar-width": "16.25rem",
      "--sidebar-width-icon": "5.125rem"
    }}
  >
      <DashboardSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden md:p-1.5 md:pl-0">
        <div className="bg-background sticky top-0 z-50 w-full shrink-0">
          <DashboardTopbar />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full border-x border-b md:rounded-b-2xl">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>;
}
export {
  DashboardLayout as default
};
