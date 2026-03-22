/*
Toolbox Aid
David Quesenberry
03/22/2026
DistributionPackager.js
*/
export default class DistributionPackager {
  createPackage({
    id,
    version = '0.0.0',
    profile,
    samples = [],
    assets = [],
    notes = [],
  } = {}) {
    const uniqueAssets = [...new Set(assets)];
    const uniqueSamples = [...new Set(samples)];
    return {
      id,
      version,
      profile: profile?.id || profile || 'unknown',
      fileCount: uniqueAssets.length + uniqueSamples.length,
      samples: uniqueSamples.map((sampleId) => ({
        sampleId,
        entry: `samples/${sampleId}/index.html`,
      })),
      assets: uniqueAssets,
      notes: [...notes],
      generatedAt: 'repo-time',
    };
  }
}
