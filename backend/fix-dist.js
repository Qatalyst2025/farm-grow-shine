const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixDist() {
  const distPath = path.join(__dirname, 'dist');
  
  console.log('Fixing dist structure...');
  
  // Move backend/src/main.js to dist/main.js
  const mainJsPath = path.join(distPath, 'backend', 'src', 'main.js');
  if (fs.existsSync(mainJsPath)) {
    console.log('Moving main.js...');
    fs.renameSync(mainJsPath, path.join(distPath, 'main.js'));
  }
  
  // Move other backend/src files to dist/
  const backendSrcPath = path.join(distPath, 'backend', 'src');
  if (fs.existsSync(backendSrcPath)) {
    const files = fs.readdirSync(backendSrcPath);
    files.forEach(file => {
      const oldPath = path.join(backendSrcPath, file);
      const newPath = path.join(distPath, file);
      if (fs.existsSync(oldPath) && fs.statSync(oldPath).isFile()) {
        console.log(`Moving ${file}...`);
        fs.renameSync(oldPath, newPath);
      }
    });
  }
  
  // Move blockchain/src to dist/blockchain
  const blockchainSrcPath = path.join(distPath, 'blockchain', 'src');
  const blockchainDestPath = path.join(distPath, 'blockchain');
  if (fs.existsSync(blockchainSrcPath)) {
    console.log('Moving blockchain files...');
    // Use rsync or cp to move entire directory structure
    try {
      execSync(`cp -r ${blockchainSrcPath}/* ${blockchainDestPath}/`);
    } catch (e) {
      // Fallback: manual copy
      copyRecursiveSync(blockchainSrcPath, blockchainDestPath);
    }
  }
  
  // Clean up empty directories
  [path.join(distPath, 'backend', 'src'), 
   path.join(distPath, 'backend'),
   path.join(distPath, 'blockchain', 'src')].forEach(dir => {
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
  });
  
  console.log('Dist structure fixed!');
}

function copyRecursiveSync(src, dest) {
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(child => {
        copyRecursiveSync(path.join(src, child), path.join(dest, child));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

fixDist();
