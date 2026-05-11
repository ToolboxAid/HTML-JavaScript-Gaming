const targetUrl = new URL("../text2speech-V2/index.html", window.location.href);
targetUrl.search = window.location.search;
targetUrl.hash = window.location.hash;

const migrationLink = document.querySelector("#text2speechV2MigrationLink");
if (migrationLink) {
  migrationLink.href = targetUrl.href;
}

window.location.replace(targetUrl.href);
