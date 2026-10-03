// Fails on any CSS syntax warning in the source stylesheets. The minifier is
// error-tolerant: a malformed selector does not fail the build, it silently
// drops rules after it (a stray comment inside a selector list once took the
// form-field styles out of production). Run in npm test.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { transform } from 'esbuild';

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.css')) files.push(p);
  }
})('src');

let bad = 0;
for (const file of files) {
  const { warnings } = await transform(readFileSync(file, 'utf8'), { loader: 'css', minify: true, sourcefile: file });
  for (const w of warnings) {
    bad++;
    console.error(`✗ ${file}:${w.location?.line}:${w.location?.column} ${w.text}\n    ${w.location?.lineText?.trim()}`);
  }
}
if (bad) {
  console.error(`\n✗ CSS CHECK FAILED — ${bad} warning(s); rules after a syntax error are silently dropped.`);
  process.exit(1);
}
console.log(`✓ CSS CHECK OK — ${files.length} stylesheets parse without warnings`);
