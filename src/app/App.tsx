import "../styles/fonts.css";
import "../styles/radio.css";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: "ether-toast",
          },
        }}
      />
      <style>{`
        .ether-toast {
          background: linear-gradient(160deg, #2A1A0A 0%, #1A0E04 100%);
          border: 1px solid #5A3A18;
          color: #FF9500;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.06em;
          border-radius: 8px;
          padding: 10px 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.7), 0 0 12px rgba(255,100,0,0.1);
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 320px;
          text-shadow: 0 0 8px rgba(255,149,0,0.4);
        }
      `}</style>
    </>
  );
}