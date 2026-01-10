import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Buffer } from "buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const GOOGLE_CLIENT_ID =
  "904411623972-h7slosk6i4fasu4ttfgq7gjqqkas7hn9.apps.googleusercontent.com";

// Create a client (you can customize defaults here)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 45 * 1000, // Data is fresh for 45 seconds
      gcTime: 10 * 60 * 1000, // Cache data for 10 minutes
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: true, // Refresh when user returns to tab
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
