import { bootWorkspaceGame } from "/old_old_games/shared/workspaceGameBoot.js";
import { hydrateGameManifestPreviewImage } from "/old_old_games/shared/gameManifestPreviewResolver.js";

bootWorkspaceGame("Pong");
void hydrateGameManifestPreviewImage({
  gameId: "Pong",
  imageSelector: "#pong-preview-thumbnail",
  placeholderSelector: "#pong-preview-placeholder"
});
