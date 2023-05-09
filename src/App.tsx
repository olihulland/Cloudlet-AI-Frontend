import * as React from "react";
import {
  Alert,
  AlertIcon,
  ChakraProvider,
  Container,
  theme,
} from "@chakra-ui/react";
import { Header } from "./components/Header";
import { useEffect, useState } from "react";
import { Intro } from "./pages/Intro";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Data } from "./pages/Data";
import { QueryClient, QueryClientProvider } from "react-query";
import { io } from "socket.io-client";

export interface PageProps {
  setCurrentPhase: (phase: string | undefined) => void;
}

export const App = () => {
  const [currentPhase, setCurrentPhase] = useState<string | undefined>(
    undefined
  );
  const [socketInstance, setSocketInstance] = useState<any>();

  const queryClient = new QueryClient();

  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_API_WS}`, {
      transports: ["websocket"],
    });

    setSocketInstance(socket);

    socket.on("connect", () => {
      console.log("ws: connect websocket");
    });

    socket.on("disconnect", (data) => {
      console.log("ws: disconnect ws", data);
    });

    socket.on("data_update", (dataStr) => {
      const data = JSON.parse(dataStr);
      console.log("ws: data update");
      if (data.queries_updated) {
        queryClient.invalidateQueries({ queryKey: data.queries_updated });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
