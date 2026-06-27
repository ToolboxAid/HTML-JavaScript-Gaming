function getPaletteSignature(palette) {
  return JSON.stringify(Array.isArray(palette) ? palette : []);
}

export { getPaletteSignature };
