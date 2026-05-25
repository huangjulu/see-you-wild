import "./globals.css";

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = (props: RootLayoutProps) => {
  return props.children;
};

RootLayout.displayName = "RootLayout";
export default RootLayout;
