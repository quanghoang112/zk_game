import {
    Entity,
    Has,
    defineEnterSystem,
    defineUpdateSystem,
    getComponentValueStrict,
} from "@latticexyz/recs";
import { PhaserLayer } from "../createPhaserLayer";
import { isThePlayer } from "../utils";

const colorStringToHex = (colorString: string): number => {
    return parseInt(colorString.slice(1), 16);
};

export function createUISystem(layer: PhaserLayer) {
    const {
        world,
        networkLayer: {
            components: { Stats },
        },
        scenes: {
            Main: { phaserScene },
        },
    } = layer;

    // UI Configs
    const CF = {
        x: 20,
        y: 20,
        width: 200,
        height: 50,
        backgroundColor: "#000000",
        outlineColor: "#ffffff",
        textColor: "#ffffff",
        fontSize: 20,
    };

    // Draw background
    const bg = phaserScene.add.rectangle(
        CF.width / 2,
        CF.height / 2,
        CF.width,
        CF.height,
        colorStringToHex(CF.backgroundColor)
    );

    // Draw outline
    const outline = phaserScene.add.graphics();
    outline.lineStyle(4, colorStringToHex(CF.outlineColor));
    outline.strokeRect(0, 0, CF.width, CF.height);

    // Contents
    // Energy
    const energyStat = phaserScene.add.text(0, 0, "energy: 0", {
        fontFamily: "MinecraftPixel",
        fontSize: `${CF.fontSize}px`,
        color: CF.textColor,
    });

    // Update energy text
    const updateEnergyText = (newVal: number) => {
        energyStat.setText(`energy: ${newVal}`);
        energyStat.updateText();
    };

    // Adjust the y position to center the text vertically
    const textBounds = energyStat.getBounds();
    energyStat.y = (CF.height - textBounds.height) / 2;
    energyStat.x = (CF.width - textBounds.width) / 2;

    // UI container
    const uiContainer = phaserScene.add.container(CF.x, CF.y, [
        bg,
        outline,
        energyStat,
    ]);
    uiContainer.setScrollFactor(0);

    // Update energy
    const updateEnergy = (entity: Entity) => {
        if (isThePlayer(entity, layer)) {
            const stats = getComponentValueStrict(Stats, entity);
            updateEnergyText(stats.energy);
        }
    };

    defineEnterSystem(world, [Has(Stats)], ({ entity }) => {
        updateEnergy(entity);
    });

    defineUpdateSystem(world, [Has(Stats)], ({ entity }) => {
        updateEnergy(entity);
    });
}
