import { React, useEffect } from "react";
import styled from "styled-components";
import { LoadingBar } from "./LoadingBar";
import { BootScreen } from "./BootScreen";
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "../../store";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SyncStep } from "@latticexyz/store-sync";

export const LoadingScreen = ({ setIsDataLoaded }: { setIsDataLoaded: (loaded: boolean) => void }) => {
  const {
    networkLayer: {
      components: { SyncProgress },
    },
  } = useMUD();

  const syncProgress = useComponentValue(SyncProgress, singletonEntity, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
    latestBlockNumber: 0n,
    lastBlockNumberProcessed: 0n,
  });

  useEffect(() => {
    if (syncProgress.step === SyncStep.LIVE) {
      setIsDataLoaded(true);
    }
  }, [syncProgress.step, setIsDataLoaded]);

  if (syncProgress.step === SyncStep.LIVE) {
    setIsDataLoaded(true);
    return null;
  }

  return (
    <BootScreen>
      {syncProgress.message}…
      <LoadingContainer>
        {Math.floor(syncProgress.percentage)}%
        <Loading percentage={syncProgress.percentage} />
      </LoadingContainer>
    </BootScreen>
  );
};

const LoadingContainer = styled.div`
  display: grid;
  justify-items: start;
  justify-content: start;
  align-items: center;
  height: 30px;
  width: 100%;
  grid-gap: 20px;
  grid-template-columns: auto 1fr;
`;

const Loading = styled(LoadingBar)`
  width: 100%;
  min-width: 200px;
`;
