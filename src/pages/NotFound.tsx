import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <div className="mx-4 max-w-md rounded-lg border bg-background p-8 text-center shadow">
        <h1 className="mb-2 text-5xl font-bold tracking-tight">404</h1>
        <p className="mb-6 text-muted-foreground">Página não encontrada</p>
        <Button asChild>
          <Link to="/">Voltar para a Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
