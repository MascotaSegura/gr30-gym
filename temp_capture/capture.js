const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set resolution to standard desktop
  await page.setViewport({ width: 1440, height: 900 });

  const artifactsPath = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\852bc8c9-0552-4c9f-a8cc-4e417b106290\\';
  
  const urls = [
    { name: 'software_hero.png', url: 'http://localhost:8080/software.html' },
    { name: 'landing_home.png', url: 'http://localhost:8080/index.html' },
    { name: 'kiosco_ui.png', url: 'http://localhost:8080/kiosco.html' }
  ];

  for (const item of urls) {
    console.log(`Navigating to ${item.url}...`);
    await page.goto(item.url, { waitUntil: 'networkidle0' });
    
    // Give GSAP animations a second to settle
    await new Promise(r => setTimeout(r, 1500));
    
    console.log(`Taking screenshot: ${item.name}`);
    await page.screenshot({ path: artifactsPath + item.name });
  }

  await browser.close();
  console.log('Screenshots completed.');
})();
