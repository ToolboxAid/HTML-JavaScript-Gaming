import { bootWorkspaceGame } from "/games/shared/workspaceGameBoot.js";
import { hydrateGameManifestPreviewImage } from "/games/shared/gameManifestPreviewResolver.js";

bootWorkspaceGame("Pong");
void hydrateGameManifestPreviewImage({
  gameId: "Pong",
  imageSelector: "#pong-preview-thumbnail",
  placeholderSelector: "#pong-preview-placeholder"
});
