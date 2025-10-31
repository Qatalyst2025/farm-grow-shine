const fs = require('fs');
const path = require('path');

function fixDist() {
  const distPath = path.join(__dirname, 'dist');
  const srcPath = path.join(distPath, 'src');

  console.log('🛠️ Fixing dist structure...');

  // Move all files from dist/src/* to dist/
  if (fs.existsSync(srcPath)) {
    const items = fs.readdirSync(srcPath);
    items.forEach(item => {
      const oldPath = path.join(srcPath, item);
      const newPath = path.join(distPath, item);
      fs.renameSync(oldPath, newPath);
    });
    fs.rmdirSync(srcPath, { recursive: true });
  }

  console.log('✅ Dist structure fixed!');
}

fixDist();

