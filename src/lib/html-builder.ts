import type { Project, EditorElement, ButtonElement, AnimationElement, LoginFormElement, VideoElement } from './types';

export const generateHtmlForProject = (project: Project): string => {
  const getElementStyle = (element: EditorElement): string => {
    let style = `position: absolute; left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; height: ${element.size.height}px; transform: rotate(${element.rotation || 0}deg);`;
    
    if (element.type !== 'animation') {
       style += ' overflow: hidden;';
    }

    if (element.animation && element.animation !== 'none' && element.type !== 'animation') {
      const animationName = element.animation.startsWith('anim-') ? element.animation.substring(5) : element.animation;
      let duration = '1.5s';
      if (['shake', 'explode', 'bounce'].includes(animationName)) duration = '1s';
      if (animationName === 'glow') duration = '2s';

      const iterationCount = element.loopAnimation ? 'infinite' : '1';
      style += ' animation: ' + animationName + ' ' + duration + ' ' + iterationCount + ' ease-in-out;';
    }
    
    return style;
  };

  const getClipPathForShape = (shape: ButtonElement['shape']): string | undefined => {
    switch (shape) {
      case 'triangle-up': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'triangle-down': return 'polygon(0% 0%, 100% 0%, 50% 100%)';
      default: return undefined;
    }
  }

  const generateAnimationHtml = (element: AnimationElement): string => {
    const style = getElementStyle(element);
    const loopClass = element.loopAnimation ? 'loop' : '';
    switch (element.animationType) {
        case 'fireworks':
            return `<div class="fireworks-container ${loopClass}" style="${style}"><canvas class="fireworks-canvas"></canvas></div>`;
        case 'confetti':
            return `<div class="confetti-container ${loopClass}" style="${style}"></div>`;
        case 'sparks':
            return `<div class="sparks-container ${loopClass}" style="${style}"></div>`;
    }
    return '';
  }


  const generateElementHtml = (element: EditorElement): string => {
    let content = '';
    let style = getElementStyle(element);

    switch (element.type) {
      case 'text':
        style += `font-size: ${element.fontSize}px; color: ${element.color}; font-weight: ${element.fontWeight}; display: flex; align-items: center; justify-content: center;`;
        content = `<div style="${style}">${element.content}</div>`;
        break;
      case 'button':
        const clipPath = getClipPathForShape(element.shape);
        let borderRadius;
        if (element.shape === 'circle') borderRadius = '50%';
        else if (element.shape === 'pill') borderRadius = '9999px';
        else borderRadius = `${element.borderRadius}px`;
        
        const buttonInnerStyle = `font-size: ${element.fontSize}px; color: ${element.color}; background-color: ${element.backgroundColor}; font-weight: ${element.fontWeight}; border-radius: ${borderRadius}; width: 100%; height: 100%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;`;
        const buttonWrapperStyle = clipPath ? `clip-path: ${clipPath};` : '';
        content = `
          <div style="${style}">
            <div style="${buttonWrapperStyle} width: 100%; height: 100%;">
              <button style="${buttonInnerStyle}" ${element.linkToPageId ? `data-link-to="${element.linkToPageId}"` : ''}>${element.content}</button>
            </div>
          </div>
        `;
        break;
      case 'image':
        content = `<div style="${style}"><img src="${element.src}" alt="image" style="width: 100%; height: 100%; object-fit: cover;" /></div>`;
        break;
      case 'video':
        const videoEl = element as VideoElement;
        const loopAttr = videoEl.loop ? 'loop' : '';
        content = `<div style="${style}"><video src="${videoEl.src}" autoplay ${loopAttr} muted style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;"></video></div>`;
        break;
      case 'container':
        style += `background-color: ${element.backgroundColor};`;
        content = `<div style="${style}"></div>`;
        break;
      case 'animation':
        content = generateAnimationHtml(element as AnimationElement);
        break;
      case 'login-form':
        const formEl = element as LoginFormElement;
        const formId = `login-form-${formEl.id}`;
        content = `
          <div style="${style}">
            <form id="${formId}" style="width: 100%; height: 100%; padding: 20px; box-sizing: border-box; background-color: ${formEl.formBackgroundColor}; border: 2px solid ${formEl.formBorderColor}; border-radius: 8px; display: flex; flex-direction: column; gap: 15px; justify-content: center;">
              <h2 style="font-size: ${formEl.titleFontSize}px; font-weight: ${formEl.titleFontWeight}; color: ${formEl.titleColor}; text-align: center; margin: 0 0 10px 0;">${formEl.titleText}</h2>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="${formId}-username" style="font-size: ${formEl.labelFontSize}px; color: ${formEl.labelColor};">${formEl.usernameLabel}</label>
                <input type="text" id="${formId}-username" name="username" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc; box-sizing: border-box;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="${formId}-password" style="font-size: ${formEl.labelFontSize}px; color: ${formEl.labelColor};">${formEl.passwordLabel}</label>
                <input type="password" id="${formId}-password" name="password" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc; box-sizing: border-box;">
              </div>
              <button type="submit" style="padding: 10px; border-radius: 4px; border: none; background-color: #007bff; color: white; cursor: pointer; font-size: 16px;">${formEl.buttonText}</button>
            </form>
          </div>
        `;
        break;
    }
    return content;
  };

  const pagesHtml = project.pages.map((page, index) => {
    let pageContent;
    let pageStyle;

    if (page.isBuildFromHtml && page.buildHtml) {
        // If building from HTML, we just wrap it in a page container.
        // The user's HTML should define its own styling.
        pageContent = page.buildHtml;
        pageStyle = '';
    } else if (page.isCustomHtml) {
        pageContent = page.customHtml || '';
        pageStyle = ''; // Custom HTML for preview takes full control
    } else {
        pageContent = page.elements?.map(generateElementHtml).join('') || '';
        pageStyle = `position: relative; width: 100vw; height: 100vh; background-color: ${page.backgroundColor}; ${page.backgroundImage ? `background-image: url(${page.backgroundImage}); background-size: cover; background-position: center;` : ''}`;
    }

    const redirectAttr = page.redirect?.toPageId ? `data-redirect-to="${page.redirect.toPageId}" data-redirect-delay="${page.redirect.delay * 1000}"` : '';
    const audioAttr = page.audioUrl ? `data-audio-src="${page.audioUrl}"` : '';
    const audioLoopAttr = page.audioLoop ? `data-audio-loop="true"` : '';
    const displayStyle = 'none'; // Initially hide all pages
    
    return `<div id="${page.id}" class="page" style="overflow: hidden; display: ${displayStyle}; ${pageStyle}" ${redirectAttr} ${audioAttr} ${audioLoopAttr}>${pageContent}</div>`;
  }).join('');

  // Collect all login form scripts
  const loginFormScripts = project.pages
    .flatMap(page => page.elements)
    .filter(el => !!el && el.type === 'login-form')
    .map(element => {
        const formEl = element as LoginFormElement;
        const formId = `login-form-${formEl.id}`;
        return `
            (function() {
                const form = document.getElementById('${formId}');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const username = e.target.username.value;
                        const password = e.target.password.value;
                        const correctUsername = '${formEl.correctUsername}';
                        const correctPassword = '${formEl.correctPassword}';

                        if (username === correctUsername && password === correctPassword) {
                            const successMsg = '${formEl.successMessage || ''}';
                            if (successMsg) alert(successMsg);
                            const successPage = '${formEl.successPageId || ''}';
                            if (successPage) window.navigateTo(successPage);
                        } else {
                            const failureMsg = '${formEl.failureMessage || ''}';
                            if (failureMsg) alert(failureMsg);
                            const failurePage = '${formEl.failurePageId || ''}';
                            if (failurePage) window.navigateTo(failurePage);
                        }
                    });
                }
            })();
        `;
    }).join('\n');


  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
      <title>${project.name || 'Create-X Project'}</title>
      <style>
        body, html { margin: 0; padding: 0; font-family: sans-serif; overflow: hidden; }
        .page { width: 100vw; height: 100vh; }
        video { cursor: pointer; }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes pop { 0%, 100% { transform: scale(1); opacity: 0; } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes explode {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px #A0CFEC; }
          50% { box-shadow: 0 0 20px #A0CFEC, 0 0 30px #A0CFEC; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-7px); }
        }

        /* Page Level Animations */
        .fireworks-container, .confetti-container, .sparks-container { pointer-events: none; position: absolute; top:0; left: 0; width: 100%; height: 100%; }
        .fireworks-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

        @keyframes confetti-fall {
            0% { transform: translateY(-10vh) rotate(0deg) rotateY(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg) rotateY(360deg); opacity: 0; }
        }

        @keyframes spark-flow {
            0% { transform: translate(0, 0) scale(0); opacity: 1; }
            50% { opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
        }
        
      </style>
    </head>
    <body>
      ${pagesHtml}
      <audio id="background-audio"></audio>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
            const pages = document.querySelectorAll('.page');
            const audioPlayer = document.getElementById('background-audio');
            let currentPageId = pages.length > 0 ? pages[0].id : null;
            let redirectTimer;
            let hasInteracted = false;
            const animationInstances = new Map();
            
            function handleFirstInteraction(e) {
                if(e.target.tagName !== 'VIDEO') {
                    hasInteracted = true;
                    handlePageChange(document.getElementById(currentPageId));
                    window.removeEventListener('click', handleFirstInteraction, true);
                }
            }
            window.addEventListener('click', handleFirstInteraction, true);

            function navigateTo(pageId) {
              const targetPage = document.getElementById(pageId);
              if (targetPage) {
                pages.forEach(p => p.style.display = 'none');
                targetPage.style.display = 'block';
                currentPageId = pageId;
                handlePageChange(targetPage);
                // Update hash without adding to history
                history.replaceState(null, '', '#' + pageId);
              }
            }
            window.navigateTo = navigateTo;

            function handlePageChange(pageElement) {
                if (!pageElement) return;
                clearTimeout(redirectTimer);
                
                // Clear all running animation instances
                animationInstances.forEach(instance => instance.stop());
                animationInstances.clear();
                
                // Handle Redirect
                const redirectTo = pageElement.getAttribute('data-redirect-to');
                const delay = pageElement.getAttribute('data-redirect-delay');
                if (redirectTo && delay) {
                    redirectTimer = setTimeout(() => {
                        navigateTo(redirectTo);
                    }, parseInt(delay, 10));
                }

                // Handle Audio
                const audioSrc = pageElement.getAttribute('data-audio-src');
                const audioLoop = pageElement.hasAttribute('data-audio-loop');

                if (audioPlayer && hasInteracted) {
                    if (audioSrc && audioPlayer.src !== audioSrc) {
                        audioPlayer.src = audioSrc;
                        audioPlayer.loop = audioLoop;
                        audioPlayer.play().catch(e => console.error("Audio play failed:", e));
                    } else if (audioSrc && audioPlayer.src === audioSrc) {
                        // If src is the same, just update loop property and ensure it plays
                        audioPlayer.loop = audioLoop;
                        if (audioPlayer.paused) {
                           audioPlayer.play().catch(e => console.error("Audio play failed:", e));
                        }
                    } else if (!audioSrc) {
                        audioPlayer.pause();
                        audioPlayer.src = '';
                    }
                }

                // Start animations on new page
                startAnimationsForPage(pageElement);
            }

            function startAnimationsForPage(pageElement) {
                const fireworksContainers = pageElement.querySelectorAll('.fireworks-container');
                fireworksContainers.forEach(container => {
                    const canvas = container.querySelector('.fireworks-canvas');
                    if (canvas) {
                        const instance = new FireworksInstance(canvas, container.classList.contains('loop'));
                        instance.start();
                        animationInstances.set(container, instance);
                    }
                });

                const confettiContainers = pageElement.querySelectorAll('.confetti-container');
                confettiContainers.forEach(container => {
                   const run = () => createConfetti(container);
                   run();
                   if (container.classList.contains('loop')) {
                       const intervalId = setInterval(run, 5000);
                       animationInstances.set(container, { stop: () => clearInterval(intervalId) });
                   }
                });

                const sparksContainers = pageElement.querySelectorAll('.sparks-container');
                sparksContainers.forEach(container => {
                    const run = () => createSparks(container);
                    run();
                     if (container.classList.contains('loop')) {
                        const intervalId = setInterval(run, 200);
                        animationInstances.set(container, { stop: () => clearInterval(intervalId) });
                    }
                });
            }
            
            function createConfetti(container) {
                const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
                for (let i = 0; i < 100; i++) {
                    const confetti = document.createElement('div');
                    confetti.style.position = 'absolute';
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.top = (-20 - Math.random() * 20) + 'px';
                    confetti.style.width = (Math.random() * 8 + 6) + 'px';
                    confetti.style.height = (Math.random() * 10 + 8) + 'px';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
                    confetti.style.animation = 'confetti-fall ' + (3 + Math.random() * 2) + 's ' + (Math.random() * 4) + 's linear';
                    confetti.style.animationFillMode = 'forwards';
                    container.appendChild(confetti);
                    setTimeout(() => confetti.remove(), 7000);
                }
            }

            function createSparks(container) {
                 for (let i = 0; i < 5; i++) {
                    const spark = document.createElement('div');
                    spark.style.position = 'absolute';
                    spark.style.left = '50%';
                    spark.style.top = '50%';
                    spark.style.width = (Math.random() * 3 + 1) + 'px';
                    spark.style.height = spark.style.width;
                    spark.style.background = '#FFD700';
                    spark.style.borderRadius = '50%';
                    spark.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
                    spark.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px');
                    spark.style.animation = 'spark-flow ' + (0.5 + Math.random() * 0.5) + 's ease-out';
                    container.appendChild(spark);
                    setTimeout(() => spark.remove(), 1000);
                 }
            }

            ${loginFormScripts}

            document.body.addEventListener('click', (e) => {
              if (e.target.tagName === 'VIDEO') {
                e.target.muted = !e.target.muted;
                return;
              }
              // Traverse up the DOM to find the button if a child was clicked
              let target = e.target;
              while(target && target.tagName !== 'BUTTON') {
                target = target.parentElement;
              }

              if (target && target.tagName === 'BUTTON' && !target.closest('form')) {
                const linkTo = target.getAttribute('data-link-to');
                if (linkTo) {
                  navigateTo(linkTo);
                }
              }
            });
            
            window.addEventListener('hashchange', () => {
                const pageId = window.location.hash.substring(1);
                if (pageId) {
                    navigateTo(pageId);
                }
            });

            // --- ADVANCED FIREWORKS SCRIPT ---
            class FireworksInstance {
              constructor(canvas, loop = false) {
                this.canvas = canvas;
                this.ctx = canvas.getContext("2d");
                this.loop = loop;
                this.rockets = [];
                this.particles = [];
                this.shotCounter = 0;
                this.launchIntervalId = null;
                this.animationFrameId = null;
                this.running = false;
                
                this.TIER_5_SHOT = 5;
                this.TIER_10_SHOT = 10;
                this.TIER_15_SHOT = 15;
                this.TIER_20_SHOT = 20;
                this.TIER_30_SHOT = 30;

                window.addEventListener("resize", () => {
                  if (this.running) {
                    this.canvas.width = this.canvas.parentElement.clientWidth;
                    this.canvas.height = this.canvas.parentElement.clientHeight;
                  }
                });
              }

              start() {
                if (this.running) return;
                this.running = true;
                this.canvas.width = this.canvas.parentElement.clientWidth;
                this.canvas.height = this.canvas.parentElement.clientHeight;
                this.launchRockets();
                this.animate();
              }

              stop() {
                if (!this.running) return;
                this.running = false;
                clearInterval(this.launchIntervalId);
                cancelAnimationFrame(this.animationFrameId);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.rockets = [];
                this.particles = [];
              }

              launchRockets() {
                if (this.launchIntervalId) clearInterval(this.launchIntervalId);

                const intervalLogic = () => {
                    let nextShotType = 'normal';
                    let centerShot = false;

                    if (this.shotCounter === this.TIER_5_SHOT) { nextShotType = 'bigRed'; centerShot = true; } 
                    else if (this.shotCounter === this.TIER_10_SHOT) { nextShotType = 'superHeavy'; centerShot = true; }
                    else if (this.shotCounter === this.TIER_15_SHOT) { nextShotType = 'vipGreenGold'; centerShot = true; }
                    else if (this.shotCounter === this.TIER_20_SHOT) { nextShotType = 'ultraVIP'; centerShot = true; }
                    else if (this.shotCounter === this.TIER_30_SHOT) { nextShotType = 'nuclear'; centerShot = true; }
                    
                    const launchX = centerShot ? this.canvas.width / 2 : Math.random() * this.canvas.width;
                    this.rockets.push(new this.Rocket(launchX, this.canvas.height, this, nextShotType));

                    if (nextShotType !== 'normal') {
                        if (nextShotType === 'nuclear') this.shotCounter = 0;
                    } else {
                        this.shotCounter++;
                    }

                    if (this.shotCounter > this.TIER_30_SHOT) { this.shotCounter = 1; }
                };

                intervalLogic(); // Launch first rocket immediately
                this.launchIntervalId = setInterval(intervalLogic, Math.random() * 500 + 500);
                
                if (!this.loop) {
                    setTimeout(() => clearInterval(this.launchIntervalId), 5000); // Stop launching after 5s if not looping
                }
              }

              animate() {
                if (!this.running) return;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                for (let i = this.rockets.length - 1; i >= 0; i--) {
                  const r = this.rockets[i];
                  r.update();
                  r.draw();
                  if (r.exploded) this.rockets.splice(i, 1);
                }

                for (let i = this.particles.length - 1; i >= 0; i--) {
                  const p = this.particles[i];
                  p.update();
                  p.draw();
                  if (p.life <= 0) this.particles.splice(i, 1);
                }

                this.animationFrameId = requestAnimationFrame(() => this.animate());
              }

              Particle = class {
                constructor(x, y, colors, instance, type = 'normal') {
                  this.instance = instance;
                  this.x = x; this.y = y;
                  this.color = colors[Math.floor(Math.random() * colors.length)];
                  this.type = type;
                  const props = {
                      normal: { radius: 0.7, speed: 6, life: 50, decay: 0.90, gravity: 0.1, shadow: 3, flicker: 0 },
                      bigRed: { radius: 1.4, speed: 8, life: 75, decay: 0.92, gravity: 0.15, shadow: 5.6, flicker: 0.1 },
                      superHeavy: { radius: 1.75, speed: 9, life: 90, decay: 0.93, gravity: 0.18, shadow: 7, flicker: 0.2 },
                      vipGreenGold: { radius: 2.1, speed: 10, life: 100, decay: 0.94, gravity: 0.2, shadow: 8.4, flicker: 0.3 },
                      ultraVIP: { radius: 2.8, speed: 12, life: 125, decay: 0.95, gravity: 0.25, shadow: 14, flicker: 0.4 },
                      nuclear: { radius: 3.5, speed: 15, life: 150, decay: 0.96, gravity: 0.3, shadow: 21, flicker: 0.8 }
                  };
                  const p = props[type] || props.normal;
                  this.radius = Math.random() * p.radius + 0.7; this.speed = Math.random() * p.speed + 2;
                  this.life = p.life; this.decay = p.decay; this.gravity = p.gravity;
                  this.shadow = p.shadow; this.flickerIntensity = p.flicker;
                  this.angle = Math.random() * Math.PI * 2; this.originalColor = this.color;
                }
                update() {
                  this.x += Math.cos(this.angle) * this.speed; this.y += Math.sin(this.angle) * this.speed + this.gravity;
                  this.speed *= this.decay; this.life--;
                }
                draw() {
                  const ctx = this.instance.ctx;
                  ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                  let finalColor = this.originalColor; let opacity = 1;
                  if (['nuclear', 'ultraVIP', 'vipGreenGold'].includes(this.type)) {
                      const flicker = Math.random() * this.flickerIntensity; opacity = 1 - flicker;
                      if (this.type === 'nuclear' && Math.random() < 0.5) finalColor = '#FFFF66';
                      opacity *= (this.life / (this.type === 'nuclear' ? 150 : this.type === 'ultraVIP' ? 125 : 100));
                  }
                  ctx.fillStyle = finalColor; ctx.globalAlpha = opacity;
                  ctx.shadowBlur = this.shadow; ctx.shadowColor = this.originalColor;
                  ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
                }
              }

              Rocket = class {
                constructor(x, y, instance, shotType = 'normal') {
                  this.instance = instance;
                  this.x = x;
                  this.y = y;
                  this.shotType = shotType;
                  const config = {
                      normal: { speed: 7, colors: ['#FFD700', '#FFA500', '#ADD8E6', '#FFFFFF'], targetY: 0.4, tailLength: 15, headSize: 2.1, headShadow: 8 },
                      bigRed: { speed: 10, colors: ['#FF0000', '#FF4500', '#FFFFFF'], targetY: 0.3, tailLength: 25, headSize: 2.8, headShadow: 11.2 },
                      superHeavy: { speed: 11, colors: ['#A020F0', '#FFFFFF', '#DDA0DD'], targetY: 0.25, tailLength: 30, headSize: 3.5, headShadow: 14 },
                      vipGreenGold: { speed: 12, colors: ['#FFD700', '#00FF00', '#FFFFFF'], targetY: 0.2, tailLength: 35, headSize: 4.2, headShadow: 16.8 },
                      ultraVIP: { speed: 13, colors: ['#FF2400', '#FF8C00', '#FFFF00', '#FFFFFF'], targetY: 0.1, tailLength: 40, headSize: 4.9, headShadow: 19.6 },
                      nuclear: { speed: 15, colors: ['#FFFF66', '#FFFFFF', '#FF8C00'], targetY: 0.05, tailLength: 50, headSize: 5.6, headShadow: 28 }
                  };
                  const c = config[shotType] || config.normal;
                  this.speed = Math.random() * 4 + c.speed; this.colorSet = c.colors;
                  this.targetY = Math.random() * (this.instance.canvas.height * c.targetY) + (this.instance.canvas.height * 0.1);
                  this.tailLength = c.tailLength; this.headSize = c.headSize; this.headShadow = c.headShadow;
                  this.history = []; this.exploded = false;
                  this.color = this.colorSet[Math.floor(Math.random() * this.colorSet.length)];
                }
                update() {
                  this.y -= this.speed;
                  if (Math.random() < 0.8 || this.shotType === 'nuclear') this.history.push({ x: this.x, y: this.y });
                  if (this.history.length > this.tailLength) this.history.shift();
                  if (this.y < this.targetY) { this.explode(); this.exploded = true; }
                }
                draw() {
                  const ctx = this.instance.ctx;
                  ctx.beginPath(); ctx.arc(this.x, this.y, this.headSize, 0, Math.PI * 2);
                  ctx.fillStyle = this.color; ctx.shadowBlur = this.headShadow; ctx.shadowColor = this.color; ctx.fill();
                  ctx.beginPath(); ctx.moveTo(this.x, this.y);
                  for (let i = this.history.length - 1; i >= 0; i--) {
                    const point = this.history[i];
                    ctx.lineTo(point.x, point.y);
                  }
                  ctx.strokeStyle = this.color; ctx.lineWidth = this.headSize / 2; ctx.stroke();
                  ctx.shadowBlur = 0;
                }
                explode() {
                  const particleCount = { normal: 100, bigRed: 150, superHeavy: 200, vipGreenGold: 250, ultraVIP: 350, nuclear: 600 };
                  const count = particleCount[this.shotType] || 100;
                  for (let i = 0; i < count; i++) {
                    this.instance.particles.push(new this.instance.Particle(this.x, this.y, this.colorSet, this.instance, this.shotType));
                  }
                }
              }
            }
            
            // Initial page load handling
            const initialPageId = window.location.hash.substring(1) || (pages.length > 0 ? pages[0].id : null);
            if (initialPageId) {
                navigateTo(initialPageId);
            }
        });
      </script>
    </body>
    </html>
  `;
};
