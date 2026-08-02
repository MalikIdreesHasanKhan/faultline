import React from "react";
import {Composition, Still} from "remotion";
import {DURATION_SECONDS, FPS, V2_DURATION_SECONDS} from "./constants";
import {FaultlineFilm, FaultlineThumbnail} from "./FaultlineFilm";
import {FaultlineFilmV2} from "./FaultlineFilmV2";
import "./styles.css";
import "./styles-v2.css";

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
      <Composition
        id="FaultlineFilmV2"
        component={FaultlineFilmV2}
        durationInFrames={V2_DURATION_SECONDS * FPS}
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
