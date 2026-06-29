export function codeToLetter(code) {
  if (!code || !code.startsWith('Key')) {
    return null;
  }

  const letter = code.slice(3, 4).toUpperCase();
  return /^[A-Z]$/.test(letter) ? letter : null;
}
