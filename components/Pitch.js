import Icon from "./Icon";
export default function Pitch() {
  return (
    <div className="pitch-scene" aria-label="Illustration of a football turf">
      <div className="pitch-orbit orbit-one" /><div className="pitch-orbit orbit-two" />
      <div className="pitch-shadow" />
      <div className="pitch">
        <div className="pitch-lines"><div className="half-line" /><div className="center-circle" /><div className="center-dot" /><div className="penalty penalty-left" /><div className="penalty penalty-right" /><div className="goal goal-left" /><div className="goal goal-right" /></div>
        <span className="player player-one" /><span className="player player-two" /><span className="player player-three" /><span className="player player-four" /><span className="ball" />
      </div>
      <div className="pitch-tag tag-top"><span className="live-dot" /> THE GAME IS ON</div>
      <div className="pitch-tag tag-bottom"><span><Icon name="star" /></span><div>MADE FOR<br /><strong>GOOD GAMES</strong></div></div>
      <span className="scene-caption">A LITTLE FIELD. A LOT OF GAME.</span>
    </div>
  );
}
