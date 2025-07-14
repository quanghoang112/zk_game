import {
    Entity,
    Has,
    defineEnterSystem,
    defineUpdateSystem,
    getComponentValueStrict,
    getComponentValue,
} from "@latticexyz/recs";
import {
    tileCoordToPixelCoord,
    pixelCoordToTileCoord,
    pixelToChunkCoord,
} from "@latticexyz/phaserx";
import { PhaserLayer } from "../createPhaserLayer";
import { isThePlayer } from "../utils";
import { 
    TILE_WIDTH, 
    TILE_HEIGHT, 
} from "../constants";


const colorStringToHex = (colorString: string): number => {
    return parseInt(colorString.slice(1), 16);
};

export function createUISystem(layer: PhaserLayer) {
    const {
        world,
        networkLayer: {
            components: { Stats,Position },
            systemCalls: {death},
        },
        scenes: {
            Main: { 
                phaserScene,
                objectPool, 

            },
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
    const Energybg = phaserScene.add.rectangle(
        CF.width / 2,
        CF.height / 2,
        CF.width,
        CF.height,
        colorStringToHex(CF.backgroundColor)
    );

    const Healthbg = phaserScene.add.rectangle(
        CF.width / 2,
        CF.height / 2,
        CF.width,
        CF.height,
        colorStringToHex(CF.backgroundColor)
    );

    //preload images
    phaserScene.load.image("flag","./assets/death/flag.png");


    // Draw outline
    const EnergyOutline = phaserScene.add.graphics();
    EnergyOutline.lineStyle(3, colorStringToHex(CF.outlineColor), 0.7);
    EnergyOutline.strokeRect(0, 0, CF.width, CF.height);

    const HealthOutline = phaserScene.add.graphics();
    HealthOutline.lineStyle(3, colorStringToHex(CF.outlineColor), 0.7);
    HealthOutline.strokeRect(0, 0, CF.width, CF.height);

    // Contents
    // Energy
    const energyStat = phaserScene.add.text(0, 0, "", {
        fontSize: `${CF.fontSize}px`,
        fontFamily: "MinecraftPixel",
    });

    // Update energy text
    const updateEnergyText = (newVal: number) => {
        energyStat.setText(`energy: ${newVal}`);
        energyStat.updateText();

        // Adjust the y position to center the text vertically
        const textBounds = energyStat.getBounds();
        energyStat.y = (CF.height - textBounds.height) / 2;
        energyStat.x = (CF.width - textBounds.width) / 2;
    };

    // Set default value
    updateEnergyText(0);

    // UI container
    const uiEnergyContainer = phaserScene.add.container(CF.x, CF.y, [
        Energybg,
        EnergyOutline,
        energyStat,
    ]);
    uiEnergyContainer.setScrollFactor(0);
    uiEnergyContainer.setDepth(2);

    // Update energy
    const updateEnergy = (entity: Entity) => {
        if (isThePlayer(entity, layer)) {
            const stats = getComponentValueStrict(Stats, entity);
            updateEnergyText(stats.energy);
        }
    };

    // Health
    const healthStat = phaserScene.add.text(0, 0, "", {
        fontSize: `${CF.fontSize}px`,
        fontFamily: "MinecraftPixel",
    });
    // Update health text
    const updateHealthText = (newVal: number) => {
        healthStat.setText(`health: ${newVal}`);
        healthStat.updateText();
        const textBounds = healthStat.getBounds();
        healthStat.y = (CF.height - textBounds.height) / 2;
        healthStat.x = (CF.width - textBounds.width) / 2;
    };

    // Set default value
    updateHealthText(0);
    
    // UI container
    const uiHealthContainer = phaserScene.add.container(CF.x+220, CF.y, [
        Healthbg,
        HealthOutline,
        healthStat,
    ]);
    uiHealthContainer.setScrollFactor(0);
    uiHealthContainer.setDepth(2);

    // Update health
    const updateHealth = (entity: Entity) => {
        if (isThePlayer(entity, layer)) {
            const stats = getComponentValueStrict(Stats, entity);
            // const stats = getComponentValueStrict(Position, entity);
            updateHealthText(stats.health);
            // updateHealthText(stats.x+stats.y); // Just for testing, replace with actual health value
        }
    };


    defineEnterSystem(world, [Has(Stats)], ({ entity }) => {
        updateEnergy(entity);
        updateHealth(entity);
        // console.log("Entity: ");
    });

    defineUpdateSystem(world, [Has(Stats)], ({ entity }) => {
        updateEnergy(entity);
        updateHealth(entity);
        
        // for (const entity of world.entities) {
        // const obj = objectPool.get(entity, "Sprite");
        // const sprite = obj.id;
        // if (obj) {
        //     console.log(`Entity ${entity} có sprite:`, sprite);
        // }
        // // }
    });

    
}
