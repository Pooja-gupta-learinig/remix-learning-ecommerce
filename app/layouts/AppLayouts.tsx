import { Header, Footer } from "~/components/common";


interface AppLayoutProps {
  children: React.ReactNode;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

export function AppLayout({ children, hasHeader = true, hasFooter = true }: AppLayoutProps) {

    return (
        <main>
        <div className="w-full h-fit relative"> 
        {hasHeader && <Header />}
        {children}
        {hasFooter && <Footer />}
    </div>
    </main>);
}


