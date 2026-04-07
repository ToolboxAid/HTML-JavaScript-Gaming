/*
Toolbox Aid
David Quesenberry
03/22/2026
DataIntegrityService.js
*/
function checksum(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}

export default class DataIntegrityService {
  seal(data) {
    const payload = JSON.stringify(data);
    return {
      payload,
      checksum: checksum(payload),
    };
  }

  verify(record) {
    const expected = checksum(record.payload);
    return {
      passed: expected === record.checksum,
      detail: expected === record.checksum ? 'Integrity verified.' : 'Integrity mismatch detected.',
    };
  }
}
