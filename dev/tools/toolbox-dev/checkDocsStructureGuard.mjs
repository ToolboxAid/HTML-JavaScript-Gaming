import fs from 'fs';
import path from 'path';

const INVALID_PATH = 'docs/roadmaps';
const VALID_PATH = 'dev/archive/legacy-docs-build/roadmaps';

function fail(msg) {
  console.error('❌ DOCS STRUCTURE ERROR:\n' + msg);
  process.exit(1);
}

function ok(msg) {
  console.log('✔ ' + msg);
}

// Rule 1: invalid folder must not exist
if (fs.existsSync(INVALID_PATH)) {
  const files = fs.readdirSync(INVALID_PATH);
  if (files.length === 0) {
    console.log('⚠ Found empty docs/roadmaps → safe to delete');
  } else {
    fail('docs/roadmaps/ is not allowed and contains files');
  }
} else {
  ok('no invalid docs/roadmaps/ directory');
}

// Rule 2: valid roadmap path must exist
if (!fs.existsSync(VALID_PATH)) {
  fail('missing required dev/archive/legacy-docs-build/roadmaps/');
} else {
  ok('dev/archive/legacy-docs-build/roadmaps exists');
}

// Rule 3: prevent roadmap drift
const devRoot = 'dev/build/dev';
const files = fs.readdirSync(devRoot);

files.forEach(f => {
  if (f.toLowerCase().includes('roadmap') && !f.includes('roadmaps')) {
    console.warn('⚠ Potential misplaced roadmap:', f);
  }
});

console.log('✔ docs structure validation complete');
