import { useCanvas } from './use-canvas';

export const SpaceCanvas = () => {
  const { registerCanvasElementRefHandler, setHouseImageLoaded, setIdleImageLoaded, setWalkImageLoaded } = useCanvas();

  return (
    <>
      <canvas ref={registerCanvasElementRefHandler} className="box-border h-full w-full border-4 border-black"></canvas>
      <img
        id="img_floor_and_walls"
        src="/assets/interior/spritesheet.png"
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
        src="/assets/female-character/idle/Idle.png"
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
        src="/assets/female-character/walk/Walk.png"
        alt="Walk sprites"
        className="hidden"
        ref={(element) => {
          if (element?.complete) {
            setWalkImageLoaded(true);
          }
        }}
      />
    </>
  );
};
