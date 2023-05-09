import * as React from "react";
import {
  Alert,
  AlertIcon,
  ChakraProvider,
  Container,
  theme,
} from "@chakra-ui/react";
import { Header } from "./components/Header";
import { useState } from "react";
import { Intro } from "./pages/Intro";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Data } from "./pages/Data";
import { QueryClient, QueryClientProvider } from "react-query";

export interface PageProps {
  setCurrentPhase: (phase: string | undefined) => void;
}

export const App = () => {
  const [currentPhase, setCurrentPhase] = useState<string | undefined>(
    undefined
  );

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Router>
          <Header currentPhase={currentPhase} />

          <Routes>
            <Route
              path="/"
              element={<Intro setCurrentPhase={setCurrentPhase} />}
            />
            <Route
              path="/data"
              element={<Data setCurrentPhase={setCurrentPhase} />}
            />
            <Route
              path="*"
              element={
                <Container>
                  <Alert status="error">
                    <AlertIcon />
                    Error 404: No Match
                  </Alert>
                </Container>
              }
            />
          </Routes>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
};
