/* Jotla precompile (build 1.8.0, Phase 0 "precompiled bundle").
   Transpiles every .jsx source into design-handoff/source/jotla/min/*.js at build
   time, so the shipped app loads plain JavaScript: no in-browser Babel, ~2MB less
   to parse, and a markedly faster first boot on older phones.

   The .jsx files stay the canonical source (the Ava Edition pipeline and
   index.dev.html read them directly). Run this after ANY .jsx edit:

       node tools/precompile.js

   tests/boot-assert.js runs it automatically, so the suite can never test a
   stale bundle. No npm install needed: it reuses the repo's own vendored
   @babel/standalone. */
const fs = require('fs');
const path = require('path');

const APP = path.resolve(__dirname, '..', 'design-handoff', 'source', 'jotla');
const OUT = path.join(APP, 'min');
const FILES = ['ios-frame', 'jotla-data', 'jotla-icons', 'jotla-illustrations', 'jotla-ui',
  'jotla-parent-a', 'jotla-month', 'jotla-parent-b', 'jotla-child', 'jotla-onboard', 'jotla-app'];

function run() {
  const Babel = require(path.join(APP, 'vendor', 'babel.min.js'));
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
  let total = 0;
  for (const name of FILES) {
    const src = fs.readFileSync(path.join(APP, name + '.jsx'), 'utf8');
    const out = Babel.transform(src, { presets: ['react'], filename: name + '.jsx' }).code;
    fs.writeFileSync(path.join(OUT, name + '.js'), out);
    total += out.length;
  }
  console.log(`precompiled ${FILES.length} files -> min/ (${Math.round(total / 1024)} KB)`);
}

if (require.main === module) run();
module.exports = { run, FILES };
