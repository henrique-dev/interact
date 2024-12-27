import { useCanvas } from './use-canvas';

export const SpaceCanvas = () => {
  const { registerCanvasElementRefHandler, setHouseImageLoaded, setIdleImageLoaded, setWalkImageLoaded } = useCanvas();

  return (
    <>
      <canvas ref={registerCanvasElementRefHandler} className="box-border h-full w-full border-4 border-black"></canvas>
      <img
        id="img_floor_and_walls"
        src="/assets/house.png"
        alt="House sprites"
        className="hidden"
        ref={(element) => {
          if (element?.complete) {
            setHouseImageLoaded(true);
          }
        }}
      />
      <img
        id="img_character_idle"
        src="/assets/character-idle.png"
        alt="Idle sprites"
        className="hidden"
        ref={(element) => {
          if (element?.complete) {
            setIdleImageLoaded(true);
          }
        }}
      />
      <img
        id="img_character_walk"
        src="/assets/character-walk.png"
        alt="Walk sprites"
        className="hidden"
        ref={(element) => {
          if (element?.complete) {
            setWalkImageLoaded(true);
          }
        }}
      />
      <img id="img_character_shadow" src="/assets/character-shadow.png" alt="Character shadow" className="hidden" />
    </>
  );
};
