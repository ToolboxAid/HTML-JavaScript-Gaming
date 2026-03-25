/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceInvadersInitialsEntry.js
*/
const KEY_CODES = Array.from({ length: 26 }).map((_, index) => `Key${String.fromCharCode(65 + index)}`);

function codeToLetter(code) {
  if (!code || !code.startsWith('Key')) {
    return null;
  }

  const letter = code.slice(3, 4).toUpperCase();
  return /^[A-Z]$/.test(letter) ? letter : null;
}

export default class SpaceInvadersInitialsEntry {
  constructor() {
    this.active = false;
    this.playerId = null;
    this.score = 0;
    this.buffer = ['A', 'A', 'A'];
    this.cursor = 0;
  }

  begin({ playerId, score }) {
    this.active = true;
    this.playerId = playerId;
    this.score = Math.max(0, Math.trunc(score || 0));
    this.buffer = ['A', 'A', 'A'];
    this.cursor = 0;
  }

  cancel() {
    this.active = false;
  }

  getInitials() {
    return this.buffer.join('');
  }

  update(input) {
    if (!this.active || !input) {
      return { confirmed: false };
    }

    let acceptedLetter = false;
    KEY_CODES.forEach((code) => {
      if (!acceptedLetter && input.isPressed?.(code)) {
        const letter = codeToLetter(code);
        if (letter) {
          this.buffer[this.cursor] = letter;
          this.cursor = Math.min(2, this.cursor + 1);
          acceptedLetter = true;
        }
      }
    });

    if (input.isPressed?.('Backspace')) {
      this.cursor = Math.max(0, this.cursor - 1);
      this.buffer[this.cursor] = 'A';
    }

    if (input.isPressed?.('ArrowLeft')) {
      this.cursor = Math.max(0, this.cursor - 1);
    }
    if (input.isPressed?.('ArrowRight')) {
      this.cursor = Math.min(2, this.cursor + 1);
    }

    if (input.isPressed?.('ArrowUp') || input.isPressed?.('ArrowDown')) {
      const direction = input.isPressed?.('ArrowUp') ? 1 : -1;
      const code = this.buffer[this.cursor].charCodeAt(0) - 65;
      const next = (code + direction + 26) % 26;
      this.buffer[this.cursor] = String.fromCharCode(65 + next);
    }

    if (input.isPressed?.('Enter')) {
      return {
        confirmed: true,
        initials: this.getInitials(),
        playerId: this.playerId,
        score: this.score,
      };
    }

    return { confirmed: false };
  }
}
