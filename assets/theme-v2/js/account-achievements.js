(function () {
    const tabs = Array.from(document.querySelectorAll("[data-achievements-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-achievements-panel]"));
    if (!tabs.length || !panels.length) {
        return;
    }

    function showTab(tabName) {
        tabs.forEach((tab) => {
            const isActive = tab.dataset.achievementsTab === tabName;
            tab.setAttribute("aria-pressed", String(isActive));
            tab.classList.toggle("primary", isActive);
        });

        panels.forEach((panel) => {
            const isActive = panel.dataset.achievementsPanel === tabName;
            panel.hidden = !isActive;
            panel.setAttribute("aria-hidden", String(!isActive));
        });
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            showTab(tab.dataset.achievementsTab);
        });
    });

    showTab("build");
}());
