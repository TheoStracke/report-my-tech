import { FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Relatório Técnico</h1>
            <p className="text-xs text-muted-foreground">Theo Stracke</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
