import "./globals.css";

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = (props) => {
  return props.children;
};

RootLayout.displayName = "RootLayout";
export default RootLayout;
