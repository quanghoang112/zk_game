import { useEffect, useState } from "react";
import { useNetworkLayer } from "./hooks/useNetworkLayer";
import { useStore } from "../store";
import { PhaserLayer } from "./PhaserLayer";
import { UIRoot } from "./UIRoot";
import mudConfig from "contracts/mud.config";

export const App = () => {
  const networkLayer = useNetworkLayer();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (!networkLayer) return;

    useStore.setState({ networkLayer });

    // https://vitejs.dev/guide/env-and-mode.html
    if (import.meta.env.DEV) {
      import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
        mountDevTools({
          config: mudConfig,
          publicClient: networkLayer.network.publicClient,
          walletClient: networkLayer.network.walletClient,
          latestBlock$: networkLayer.network.latestBlock$,
          storedBlockLogs$: networkLayer.network.storedBlockLogs$,
          worldAddress: networkLayer.network.worldContract.address,
          worldAbi: networkLayer.network.worldContract.abi,
          write$: networkLayer.network.write$,
          recsWorld: networkLayer.world,
        }),
      );
    }
  }, [networkLayer]);


  return (
    <div>
      {!isDataLoaded && <UIRoot setIsDataLoaded={setIsDataLoaded} />}
      <PhaserLayer networkLayer={networkLayer} />
    </div>
  );
};
