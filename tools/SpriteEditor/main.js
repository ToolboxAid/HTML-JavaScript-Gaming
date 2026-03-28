import { SpriteEditorApp } from "./modules/app.js";

const canvas = document.getElementById("spriteEditorCanvas");
const fileInput = document.getElementById("spriteEditorFileInput");
const downloadLink = document.getElementById("spriteEditorDownloadLink");

new SpriteEditorApp(canvas, fileInput, downloadLink);
