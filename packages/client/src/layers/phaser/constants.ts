export enum Scenes {
    Main = "Main",
}

export enum Maps {
    Main = "Main",
}

export enum Animations {
    RotatingPlanet = "RotatingPlanet",
}
export enum Sprites {
    SpaceShip,
}

export enum Assets {
    MainAtlas = "MainAtlas",
    Tileset = "Tileset",
}

export enum Direction {
    Unknown,
    Up,
    Right,
    Down,
    Left,
}

export const TILE_HEIGHT = 64;
export const TILE_WIDTH = 64;
export const CHUNK_SIZE = 64 * 16;
export const CHUNK_TILES = 16;
export const MAP_CONFIG = {
    WIDTH_TILE: 0,
    HEIGHT_TILE: 0,
    GAME_SEED: "0",
};
