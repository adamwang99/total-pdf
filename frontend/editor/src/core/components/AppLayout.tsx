import { ReactNode } from "react";
import { useBanner } from "@app/contexts/BannerContext";
import NavigationWarningModal from "@app/components/shared/NavigationWarningModal";
import { Wordmark } from "@app/components/shared/Wordmark";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * App layout wrapper that handles banner rendering and viewport sizing
 * Automatically adjusts child components to fit remaining space after banner
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { banner } = useBanner();

  return (
    <>
      <style>{`
        .h-screen {
          height: 100% !important;
        }
      `}</style>
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        {banner}
        <div style={{ flex: 1, minHeight: 0, height: 0 }}>{children}</div>
      </div>
      <Wordmark
        alt="Total PDF"
        muted
        aria-hidden="true"
        style={{
          position: "fixed",
          right: 16,
          bottom: 12,
          height: 18,
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 1000,
        }}
      />
      <NavigationWarningModal />
    </>
  );
}
