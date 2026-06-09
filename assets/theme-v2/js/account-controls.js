(function () {
    const selects = Array.from(document.querySelectorAll("[data-controls-theme-select]"));
    const preview = document.querySelector("[data-controls-preview]");

    if (selects.length && preview) {
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
    }

    function sliderDisplayValue(slider, output) {
        const unit = output.dataset.sliderUnit || "";
        const prefix = output.dataset.sliderSigned === "true" && Number(slider.value) > 0 ? "+" : "";
        return `${prefix}${slider.value}${unit}`;
    }

    function sliderDefaultValue(slider) {
        return slider.dataset.sliderDefault || slider.defaultValue || slider.min || "0";
    }

    document.querySelectorAll("[data-slider-value-for]").forEach((output) => {
        const slider = document.getElementById(output.dataset.sliderValueFor);
        if (!slider) {
            return;
        }

        const updateOutput = function () {
            const value = sliderDisplayValue(slider, output);
            output.value = value;
            output.textContent = value;
        };

        slider.addEventListener("input", updateOutput);
        slider.addEventListener("change", updateOutput);
        slider.addEventListener("dblclick", function () {
            slider.value = sliderDefaultValue(slider);
            updateOutput();
            slider.dispatchEvent(new Event("input", { bubbles: true }));
        });
        updateOutput();
    });
}());
