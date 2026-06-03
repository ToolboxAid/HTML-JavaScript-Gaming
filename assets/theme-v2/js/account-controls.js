(function () {
    const selects = Array.from(document.querySelectorAll("[data-controls-theme-select]"));
    const preview = document.querySelector("[data-controls-preview]");
    if (!selects.length || !preview) return;

    const groups = Array.from(selects[0].options).map((option) => option.value);

    function applyTheme(selectedValue) {
        groups.forEach((group) => preview.classList.remove(group));
        preview.classList.add(selectedValue);
        selects.forEach((select) => {
            select.value = selectedValue;
        });
    }

    selects.forEach((select) => {
        select.addEventListener("change", function () {
            applyTheme(select.value);
        });
    });
    applyTheme(selects[0].value);
}());
