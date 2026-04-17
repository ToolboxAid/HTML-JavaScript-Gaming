/*
Toolbox Aid
David Quesenberry
03/22/2026
TexturePreprocessPipeline.js
*/
export default class TexturePreprocessPipeline {
  run(texture) {
    return {
      ...texture,
      width: Math.max(1, texture.width),
      height: Math.max(1, texture.height),
      padded: true,
      atlasReady: true,
    };
  }
}
