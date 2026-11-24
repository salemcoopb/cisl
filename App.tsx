import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { ToastProvider } from "./components/ui/Toast";
import { RoleProvider } from "./lib/RoleContext";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </RoleProvider>
    </BrowserRouter>
  );
}
