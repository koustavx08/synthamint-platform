#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Clean up source map files from previous builds
 * This helps prevent build issues and reduces bundle size
 */
function cleanSourceMaps() {
  const dirsToClean = ['dist', 'build', '.vite'];
  
  dirsToClean.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    
    if (fs.existsSync(dirPath)) {
      try {
        // Find and remove .map files recursively
        const files = getAllFiles(dirPath);
        const mapFiles = files.filter(file => file.endsWith('.map'));
        
        mapFiles.forEach(file => {
          try {
            fs.unlinkSync(file);
            console.log(`Cleaned: ${path.relative(process.cwd(), file)}`);
          } catch (err) {
            // Silently ignore errors for individual files
          }
        });
        
        if (mapFiles.length > 0) {
          console.log(`Cleaned ${mapFiles.length} source map files from ${dir}/`);
        }
      } catch (err) {
        // Silently ignore errors for directories that don't exist or can't be read
      }
    }
  });
  
  console.log('Source map cleanup completed');
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
          arrayOfFiles.push(fullPath);
        }
      } catch (err) {
        // Skip files/directories that can't be accessed
      }
    });
  } catch (err) {
    // Skip directories that can't be read
  }
  
  return arrayOfFiles;
}

// Run the cleanup
cleanSourceMaps();
