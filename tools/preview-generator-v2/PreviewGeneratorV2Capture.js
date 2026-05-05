class PreviewGeneratorV2Capture {
  static getAvailableFullScreenCaptureSize(doc = document, win = window, fallbackWidth = 1, fallbackHeight = 1) {
    const root = doc?.documentElement;
    const body = doc?.body;
    const width = Math.max(1, Math.ceil(
      win?.innerWidth
        || root?.clientWidth
        || body?.clientWidth
        || root?.scrollWidth
        || body?.scrollWidth
        || fallbackWidth
        || 1
    ));
    const height = Math.max(1, Math.ceil(
      win?.innerHeight
        || root?.clientHeight
        || body?.clientHeight
        || root?.scrollHeight
        || body?.scrollHeight
        || fallbackHeight
        || 1
    ));
    return { width, height };
  }
}

export { PreviewGeneratorV2Capture };
