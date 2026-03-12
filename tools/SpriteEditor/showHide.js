// ToolboxAid.com
// David Quesenberry
// 01/20/2024
// showHide.js

class ShowHide {
    static click() {
        // Select the box3 element
        const box3 = document.querySelector('.box3');
        const button = document.getElementById('showHide');

        if (box3) {
            // Check if the element is currently hidden
            const isHidden = box3.classList.contains('hidden');

            if (isHidden) {
                // If hidden, show it
                box3.classList.remove('hidden');
                if (button) button.textContent = "Hide data";
            } else {
                // If visible, hide it
                box3.classList.add('hidden');
                if (button) button.textContent = "Show data"; // Update button text
            }
        } else {
            console.error("box3 element not found.");
        }
    }
}

export default ShowHide;