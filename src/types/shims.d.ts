/*
  Temporary type shims to silence editor errors until dependencies are installed.
  After running `npm install`, you can remove this file if you prefer strict typing.
*/

// Vite env typing (in case vite/client types aren't picked up yet)
interface ImportMetaEnv {
  readonly BASE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Minimal JSX runtime declarations
declare module "react/jsx-runtime" {
  export const Fragment: any;
  export const jsx: any;
  export const jsxs: any;
}

// React and common libs as any (only to quiet the editor)
declare module "react" {
  const React: any;
  export default React;
  export const useState: any;
  export const useEffect: any;
  export const createElement: any;
}

declare module "react-dom/client" {
  export const createRoot: any;
}

declare module "react-router-dom" {
  export const BrowserRouter: any;
  export const HashRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Link: any;
  export const useLocation: any;
}

declare module "@tanstack/react-query" {
  export const QueryClient: any;
  export const QueryClientProvider: any;
}

declare module "sonner" {
  export const toast: any;
}

declare module "lucide-react" {
  export const Search: any;
  export const Download: any;
  export const Edit2: any;
  export const Trash2: any;
  export const List: any;
  export const Image: any;
  export const Plus: any;
  export const Save: any;
  export const AlertCircle: any;
}

// UI components fallback types
declare module "@/components/ui/button" {
  export const Button: any;
}
declare module "@/components/ui/card" {
  export const Card: any;
  export const CardContent: any;
  export const CardHeader: any;
  export const CardTitle: any;
}
declare module "@/components/ui/input" {
  export const Input: any;
}
declare module "@/components/ui/badge" {
  export const Badge: any;
}
declare module "@/components/ui/toaster" {
  export function Toaster(): any;
}
declare module "@/components/ui/sonner" {
  export const Toaster: any;
}
declare module "@/components/ui/tooltip" {
  export const TooltipProvider: any;
}
