import fs from 'fs';
import path from 'path';

function findFileByName(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      // Skip system folders and node_modules to avoid infinite loops or slow down
      if (
        filePath.startsWith('/proc') || 
        filePath.startsWith('/sys') || 
        filePath.startsWith('/dev') || 
        filePath.startsWith('/lib') || 
        filePath.startsWith('/bin') || 
        filePath.startsWith('/sbin') || 
        filePath.startsWith('/usr') || 
        filePath.startsWith('/var/lib') ||
        filePath.includes('node_modules') || 
        filePath.includes('.git')
      ) {
        return;
      }
      
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch (e) {
        return;
      }
      
      if (stat && stat.isDirectory()) {
        results = results.concat(findFileByName(filePath));
      } else {
        if (file.includes('input_file') || file.includes('soccer_stickers') || file.includes('zonakids') || file.endsWith('.png') || file.endsWith('.jpg')) {
          results.push(filePath);
        }
      }
    });
  } catch (e) {
    // Ignore read errors
  }
  return results;
}

try {
  // Let's start search from container root
  const files = findFileByName('/');
  fs.writeFileSync('test_files.txt', files.join('\n'));
} catch (e) {
  fs.writeFileSync('test_files.txt', 'Error: ' + e.message);
}
