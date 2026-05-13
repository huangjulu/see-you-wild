import QueryProvider from "@/components/providers/QueryProvider";
import ToastProvider from "@/components/providers/ToastProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  return (
    <QueryProvider>
      <ToastProvider>
        <div className="flex h-screen bg-background">{props.children}</div>
      </ToastProvider>
    </QueryProvider>
  );
};

AdminLayout.displayName = "AdminLayout";
export default AdminLayout;
