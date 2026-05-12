import QueryProvider from "@/components/providers/QueryProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {props.children}
      </div>
    </QueryProvider>
  );
};

AdminLayout.displayName = "AdminLayout";
export default AdminLayout;
