(function () {
    const slot = document.querySelector("[data-tool-display-mode]");
    if (!slot) return;

    const displayMode = document.createElement("details");
    displayMode.className = "accordion tool-display-mode";
    displayMode.id = "toolDisplayMode";
    displayMode.open = true;

    const summary = document.createElement("summary");
    summary.textContent = "Tool Display Mode";
    displayMode.appendChild(summary);
    slot.replaceWith(displayMode);


    async function enterToolMode() {
        document.body.classList.add("tool-focus-mode");
        displayMode.open = true;

        try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.warn("Fullscreen was blocked by the browser. CSS tool display mode is still active.", error);
        }
    }

    async function exitToolMode() {
        document.body.classList.remove("tool-focus-mode");
        displayMode.open = false;

        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.warn("Exit fullscreen failed.", error);
        }
    }

    summary.addEventListener("click", function (event) {
        event.preventDefault();

        if (document.body.classList.contains("tool-focus-mode") || document.fullscreenElement) {
            exitToolMode();
        } else {
            enterToolMode();
        }
    });

    document.addEventListener("fullscreenchange", function () {
        if (!document.fullscreenElement && document.body.classList.contains("tool-focus-mode")) {
            document.body.classList.remove("tool-focus-mode");
            displayMode.open = false;
        }
    });
}());
