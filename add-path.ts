#!/usr/bin/env -S deno run --allow-read --allow-write

import { walk } from 'https://deno.land/std@0.224.0/fs/mod.ts';
import { relative, resolve } from 'https://deno.land/std@0.224.0/path/mod.ts';

async function addPathComments(rootDir: string) {
  const resolvedRoot = resolve(rootDir);

  for await (const entry of walk(resolvedRoot, {
    includeDirs: false,
    exts: ['.md'],
  })) {
    const filePath = entry.path;
    const relPath = relative(resolvedRoot, filePath);
    const comment = `<!-- ${relPath} -->\n`;

    try {
      const content = await Deno.readTextFile(filePath);

      if (content.startsWith(comment)) {
        console.log(`Comment already present in ${relPath}`);
        continue;
      }

      const lines = content.split('\n');
      while (lines.length > 0 && (lines[0].trim() === '' || lines[0].trim().startsWith('<!--'))) {
        lines.shift();
      }

      lines.unshift(comment.trim());

      const newContent = lines.join('\n');
      await Deno.writeTextFile(filePath, newContent);
      console.log(`Updated comment in ${relPath}`);
    } catch (err) {
      const error = err as Error;
      console.error(`Error processing ${relPath}: ${error.message}`);
    }
  }
}

if (import.meta.main) {
  const rootDir = Deno.cwd();
  try {
    await addPathComments(rootDir);
    console.log('Finished adding file path comments');
  } catch (err) {
    const error = err as Error;
    console.error('Error:', error.message);
    Deno.exit(1);
  }
}