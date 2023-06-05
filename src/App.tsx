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
import { PreProcessing } from "./pages/PreProcessing";
import { WorkingData } from "./data/types";
import { ModelTraining } from "./pages/ModelTraining";
import { ModelEvaluation } from "./pages/ModelEvaluation";

export interface PageProps {
  setStepInfo: (info: StepInfo | undefined) => void;
  workingData?: WorkingData;
  setWorkingData?: (data: WorkingData | undefined) => void;
}

export interface StepInfo {
  currentPhase: string;
  nextStep?: string;
  prevStep?: string;
  allowNext?: boolean;
}

export const App = () => {
  const [currentStepInfo, setCurrentStepInfo] = useState<
    StepInfo | undefined
  >();
  const [workingData, setWorkingData] = useState<WorkingData | undefined>();

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Router>
          <Header stepInfo={currentStepInfo} />

          <Routes>
            <Route
              path="/"
              element={<Intro setStepInfo={setCurrentStepInfo} />}
            />
            <Route
              path="/data"
              element={
                <Data
                  setStepInfo={setCurrentStepInfo}
                  workingData={workingData}
                  setWorkingData={setWorkingData}
                />
              }
            />
            <Route
              path="/pre-processing"
              element={
                <PreProcessing
                  setStepInfo={setCurrentStepInfo}
                  workingData={workingData}
                  setWorkingData={setWorkingData}
                />
              }
            />
            <Route
              path="/model-training"
              element={
                <ModelTraining
                  setStepInfo={setCurrentStepInfo}
                  workingData={workingData}
                  setWorkingData={setWorkingData}
                />
              }
            />
            <Route
              path="/model-evaluation"
              element={
                <ModelEvaluation
                  setStepInfo={setCurrentStepInfo}
                  workingData={workingData}
                />
              }
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
