import { PhaserLayer } from "../createPhaserLayer";

export function createTestSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: {
                // phaserScene,
                camera: { phaserCamera },
                input,
                objectPool,
            },
        },
    } = layer;

    const entity = "0xC0FFEE";
    const obj = objectPool.get(entity, "Rectangle");
    obj.setComponent({
        id: "animation",
        once: (rect) => {
            rect.setSize(20, 20);
            rect.setFillStyle(0xff0000);
        },
    });
    obj.setComponent({
        id: "position",
        once: (rect) => {
            rect.setPosition(1030, 1030);
        },
    });

    obj.x = obj.position.x;
    obj.y = obj.position.y;

    phaserCamera.startFollow(obj, true, 0.1, 0.1);

    input.keyboard$.subscribe(async (key: Phaser.Input.Keyboard.Key) => {
        let x = 0;
        let y = 0;

        if (key.isDown) {
            if (key.keyCode === 37) x = -1;
            else if (key.keyCode == 38) y = -1;
            else if (key.keyCode == 39) x = 1;
            else if (key.keyCode == 40) y = 1;
        }

        if (x != 0 || y != 0) {
            obj.setComponent({
                id: "position",
                once: (rect) => {
                    rect.setPosition(obj.position.x + x, obj.position.y + y);
                    obj.x += x;
                    obj.y += y;
                },
            });

            console.log(
                `mouse: ${phaserCamera.scrollX}, ${phaserCamera.scrollY}`
            );
            console.log(`player.x: ${obj.x}`);
            console.log(`player.y: ${obj.y}`);

            // phaserCamera.centerOn(obj.position.x, obj.position.y);
        }
    });
}
