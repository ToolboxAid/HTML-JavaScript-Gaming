// ToolboxAid.com
// David Quesenberry
// 01/20/2024
// message.js

export class Message {

    static textArea = null;
    static initMessages = true;

    static initialize() {
        this.textArea = document.getElementById('messagesID');
        this.clear();
    }

    static add(message) {
        let formattedTimestamp = new Date().toLocaleString().replace(/,/g, '');
        this.textArea.value += `${formattedTimestamp} ${message} \n`;
        this.textArea.disabled = true;
        formattedTimestamp = null;
    }

    static clear() {
        this.textArea.value = "";
        this.add(`Messages Cleared.`);
        if (this.initMessages) {
            this.initMessages = false;
            this.add(`Press 'F11' to enter/exit full screen.`);
            this.add(`Add '#ØØØØØØØØ' to palette for Transparent.`);
        }
    }

    static setupOnLoad() {
        document.addEventListener('DOMContentLoaded', () => {
            Message.initialize();
        });
    }
}

// Set up the onload event
Message.setupOnLoad();