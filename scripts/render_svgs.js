const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

process.chdir(path.join(__dirname, '..'));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const files = [
    'gr30_logo_light',
    'gr30_logo_dark',
    'gr30_logo_transparent',
    'gr30_logo_transparent_light'
  ];
  
  for (const file of files) {
    const svgPath = path.resolve(`assets/img/logos/${file}.svg`);
    const pngPath = path.resolve(`assets/img/logos/${file}_highres.png`);
    
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    await page.setContent(svgContent);
    

    const dimensions = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const viewBox = svg.getAttribute('viewBox').split(' ');
      return {
        width: parseFloat(viewBox[2]),
        height: parseFloat(viewBox[3])
      };
    });
    

    const scale = 800 / dimensions.height;
    const width = Math.round(dimensions.width * scale);
    const height = 800;
    
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    

    const html = `
      <html>
        <body style="margin: 0; padding: 0; background: transparent;">
          <div style="width: ${width}px; height: ${height}px;">
            ${svgContent}
          </div>
        </body>
      </html>
    `;
    await page.setContent(html);
    
    await page.screenshot({ path: pngPath, omitBackground: true });
    console.log(`Rendered ${pngPath}`);
    

  }
  
  await browser.close();
})();
