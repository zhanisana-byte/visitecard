import DashboardHeader from "@/components/DashboardHeader";

export default function MonEspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard">
      <DashboardHeader />
      {children}
    </div>
  );
}
