import React from "react";
import {Composition, Still} from "remotion";
import {DURATION_SECONDS, FPS} from "./constants";
import {FaultlineFilm, FaultlineThumbnail} from "./FaultlineFilm";
import "./styles.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FaultlineFilm"
        component={FaultlineFilm}
        durationInFrames={DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Still
        id="FaultlineThumbnail"
        component={FaultlineThumbnail}
        width={1920}
        height={1080}
      />
    </>
  );
};
