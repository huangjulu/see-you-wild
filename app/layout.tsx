import "./globals.css";

type RootLayoutProps = {
  children: React.ReactNode;
};

function RootLayout(props: RootLayoutProps) {
  return props.children;
}

RootLayout.displayName = "RootLayout";
export default RootLayout;
