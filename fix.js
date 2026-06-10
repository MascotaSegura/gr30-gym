const fs = require('fs');
const files = ['terminos.html', 'privacidad.html', 'reglamento.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add flex flex-col to body
  content = content.replace(
    '<body class="bg-brand-white font-sans antialiased selection:bg-brand-green selection:text-brand-black text-brand-black min-h-[100svh] overflow-x-hidden">',
    '<body class="bg-brand-white font-sans antialiased selection:bg-brand-green selection:text-brand-black text-brand-black min-h-[100svh] flex flex-col overflow-x-hidden">'
  );

  // 2. Fix links in nav
  content = content.replace('href="#servicios"', 'href="index.html#servicios"');
  content = content.replace('href="#entrenadores"', 'href="index.html#entrenadores"');
  content = content.replace('href="#resenas"', 'href="index.html#resenas"');
  content = content.replace('href="#planes"', 'href="index.html#planes"');
  content = content.replace('href="#contacto"', 'href="index.html#contacto"');

  // 3. Add mobileMenu div
  const mobileMenuStr = `</header>

<div id="mobileMenu" aria-hidden="true" class="fixed inset-0 bg-brand-black invisible flex flex-col px-8 sm:px-12 overflow-y-auto pt-24 pb-12 z-[55]">
  <nav class="flex flex-col gap-6 sm:gap-8">
    <a href="index.html" class="mobile-link text-5xl sm:text-6xl font-display font-bold tracking-tighter text-brand-white hover:text-brand-green focus:text-brand-green focus:outline-none active:text-brand-green transition-colors w-max">INICIO</a>
    <a href="index.html#servicios" class="mobile-link text-5xl sm:text-6xl font-display font-bold tracking-tighter text-brand-white hover:text-brand-green focus:text-brand-green focus:outline-none active:text-brand-green transition-colors w-max">SERVICIOS</a>
    <a href="index.html#entrenadores" class="mobile-link text-5xl sm:text-6xl font-display font-bold tracking-tighter text-brand-white hover:text-brand-green focus:text-brand-green focus:outline-none active:text-brand-green transition-colors w-max">STAFF</a>
    <a href="index.html#resenas" class="mobile-link text-5xl sm:text-6xl font-display font-bold tracking-tighter text-brand-white hover:text-brand-green focus:text-brand-green focus:outline-none active:text-brand-green transition-colors w-max">RESEÑAS</a>
    <a href="index.html#planes" class="mobile-link text-5xl sm:text-6xl font-display font-bold tracking-tighter text-brand-white hover:text-brand-green focus:text-brand-green focus:outline-none active:text-brand-green transition-colors w-max">PLANES</a>
    <a href="login.html" class="mobile-link text-5xl sm:text-6xl font-display font-bold tracking-tighter text-brand-white hover:text-brand-green focus:text-brand-green focus:outline-none active:text-brand-green transition-colors w-max">INICIAR SESIÓN</a>
    <a href="index.html#contacto" class="mobile-link text-5xl sm:text-6xl font-display font-bold tracking-tighter text-brand-green hover:text-brand-white focus:text-brand-white focus:outline-none active:text-brand-white transition-colors mt-6 sm:mt-8 w-max">CONTACTO</a>
  </nav>
</div>

<main class="flex-1 px-6 lg:px-12 pb-24 pt-48 max-w-4xl mx-auto w-full flex flex-col gap-12">`;
  
  content = content.replace('</header>\r\n<main class="flex-1 px-6 lg:px-12 pb-24 pt-48 max-w-4xl mx-auto w-full flex flex-col gap-12">', mobileMenuStr);
  content = content.replace('</header>\n<main class="flex-1 px-6 lg:px-12 pb-24 pt-48 max-w-4xl mx-auto w-full flex flex-col gap-12">', mobileMenuStr);

  // 4. Add script
  const scriptStr = `  </footer>

  <script>
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const header = document.getElementById('mainHeader');
    ScrollTrigger.create({
      start: "top -50",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === 1) {
          gsap.to(header, { yPercent: -100, duration: 0.3, ease: "power2.out", overwrite: true });
        } else {
          gsap.to(header, { yPercent: 0, duration: 0.3, ease: "power2.out", overwrite: true });
        }
      }
    });

    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let menuOpen = false;

    if (mobileMenu && menuBtn) {
      gsap.set(mobileMenu, { xPercent: 100, autoAlpha: 1 });
      const tlMenu = gsap.timeline({ paused: true, defaults: { ease: "power4.inOut" } });
      tlMenu.to(mobileMenu, { xPercent: 0, duration: 0.5 })
            .fromTo(mobileLinks, { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.05, duration: 0.4 }, "-=0.3");

      function toggleMenu() {
        menuOpen = !menuOpen;
        menuBtn.setAttribute('aria-expanded', menuOpen);
        const menuIcon = document.getElementById('menuIcon');
        if (menuOpen) {
          mobileMenu.setAttribute('aria-hidden', 'false');
          document.querySelector('main').setAttribute('inert', '');
          menuIcon.className = "ph-bold ph-x text-3xl";
          tlMenu.play();
          document.body.style.overflow = 'hidden';
        } else {
          mobileMenu.setAttribute('aria-hidden', 'true');
          document.querySelector('main').removeAttribute('inert');
          menuIcon.className = "ph-bold ph-list text-3xl";
          tlMenu.reverse();
          document.body.style.overflow = '';
        }
      }

      menuBtn.addEventListener('click', toggleMenu);
    }
  </script>
</body>`;

  content = content.replace('  </footer>\r\n</body>', scriptStr);
  content = content.replace('  </footer>\n</body>', scriptStr);

  fs.writeFileSync(file, content);
}
