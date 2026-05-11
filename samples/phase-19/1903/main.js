/*
Toolbox Aid
David Quesenberry
05/11/2026
main.js
*/

const TEXT_TO_SPEECH_PATH = "/tools/text2speech-V2/index.html";
const TEXT_TO_SPEECH_SAMPLE_PRESET_PATH = "/samples/phase-19/1903/sample.1903.text2speech-V2.json";

function buildTextToSpeechHref() {
  const params = new URLSearchParams({
    sampleId: "1903",
    sampleTitle: "Text to Speech V2 JSON Source",
    samplePresetPath: TEXT_TO_SPEECH_SAMPLE_PRESET_PATH
  });
  return TEXT_TO_SPEECH_PATH + "?" + params.toString();
}

function applyLaunchLink() {
  const link = document.getElementById("textToSpeechLaunchLink");
  if (link instanceof HTMLAnchorElement) {
    link.href = buildTextToSpeechHref();
  }
}

function shouldAutoLaunch() {
  const params = new URLSearchParams(window.location.search);
  return params.get("stay") !== "1";
}

function launchTextToSpeech() {
  if (shouldAutoLaunch()) {
    window.location.assign(buildTextToSpeechHref());
  }
}

applyLaunchLink();
launchTextToSpeech();
