const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'assets', 'img');
fs.readdir(imgDir, (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    if (file.endsWith('.png')) {
      const inputPath = path.join(imgDir, file);
      const outputPath = path.join(imgDir, file.replace('.png', '.webp'));
      sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath)
        .then(() => {
          console.log(`Converted ${file} to .webp`);
        })
        .catch(err => {
          console.error(`Error converting ${file}:`, err);
        });
    }
  });
});
