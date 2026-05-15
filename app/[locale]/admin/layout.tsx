import ToastProvider from "@/components/providers/ToastProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = (props: AdminLayoutProps) => {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-background">{props.children}</div>
    </ToastProvider>
  );
};

AdminLayout.displayName = "AdminLayout";
export default AdminLayout;
