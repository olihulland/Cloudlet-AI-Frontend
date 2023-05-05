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

export const App = () => {
  const [currentPhase, setCurrentPhase] = useState(undefined);

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Header currentPhase={currentPhase} />

        <Routes>
          <Route path="/" element={<Intro />} />
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
  );
};
