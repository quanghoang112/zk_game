

export interface ExtendedPlayer {
    setComponent: (component: { id: string; once: (sprite: any) => void }) => void;
    hasComponent: (id: string) => boolean;
    removeComponent: (id: string, stop?: boolean) => void;
    spawn: () => void;
    despawn: () => void;
    position: { x: number; y: number };
    id: string;
    setCameraFilter: (filter: number) => void;
    type: "Sprite";
    x: number;
    y: number;
}