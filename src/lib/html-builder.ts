import type { Project, EditorElement, ButtonElement, AnimationElement } from './types';

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
      style += ` animation: ${animationName} ${duration} ${iterationCount} ease-in-out;`;
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
            return `<div class="fireworks-container ${loopClass}" style="${style}"></div>`;
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
        content = `<div style="${style}"><video src="${element.src}" muted autoplay loop style="width: 100%; height: 100%; object-fit: cover;"></video></div>`;
        break;
      case 'container':
        style += `background-color: ${element.backgroundColor};`;
        content = `<div style="${style}"></div>`;
        break;
      case 'animation':
        content = generateAnimationHtml(element as AnimationElement);
        break;
    }
    return content;
  };

  const pagesHtml = project.pages.map((page, index) => {
    let pageContent;
    let pageStyle;

    if (page.isCustomHtml) {
        pageContent = page.customHtml || '';
        pageStyle = ''; // Custom HTML takes full control
    } else {
        pageContent = page.elements.map(generateElementHtml).join('');
        pageStyle = `position: relative; width: 100vw; height: 100vh; background-color: ${page.backgroundColor}; ${page.backgroundImage ? `background-image: url(${page.backgroundImage}); background-size: cover; background-position: center;` : ''}`;
    }

    const redirectAttr = page.redirect?.toPageId ? `data-redirect-to="${page.redirect.toPageId}" data-redirect-delay="${page.redirect.delay * 1000}"` : '';
    const audioAttr = page.audioUrl ? `data-audio-src="${page.audioUrl}"` : '';
    const audioLoopAttr = page.audioLoop !== false ? `data-audio-loop="true"` : '';
    const displayStyle = index === 0 ? 'block' : 'none';
    
    return `<div id="${page.id}" class="page" style="overflow: hidden; ${displayStyle}; ${pageStyle}" ${redirectAttr} ${audioAttr} ${audioLoopAttr}>${pageContent}</div>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${project.name || 'URA Project'}</title>
      <style>
        body, html { margin: 0; padding: 0; font-family: sans-serif; overflow: hidden; }
        .page { width: 100vw; height: 100vh; }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
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
        .fireworks-container, .confetti-container, .sparks-container { pointer-events: none; }

        @keyframes firework-up { to { transform: translateY(-100%); opacity: 0; } }
        @keyframes firework-explode { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        
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
            const animationIntervals = new Map();

            function navigateTo(pageId) {
              const targetPage = document.getElementById(pageId);
              if (targetPage) {
                pages.forEach(p => p.style.display = 'none');
                targetPage.style.display = 'block';
                currentPageId = pageId;
                handlePageChange(targetPage);
              }
            }

            function handlePageChange(pageElement) {
                clearTimeout(redirectTimer);
                
                // Clear all running animation intervals
                animationIntervals.forEach(interval => clearInterval(interval));
                animationIntervals.clear();
                
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
                if (audioPlayer) {
                    if (audioSrc && audioPlayer.src !== audioSrc) {
                        audioPlayer.src = audioSrc;
                        audioPlayer.loop = pageElement.hasAttribute('data-audio-loop');
                        audioPlayer.play().catch(e => console.error("Audio play failed:", e));
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
                    const run = () => createFireworks(container);
                    run();
                    if (container.classList.contains('loop')) {
                        animationIntervals.set(container, setInterval(run, 3000));
                    }
                });

                const confettiContainers = pageElement.querySelectorAll('.confetti-container');
                confettiContainers.forEach(container => {
                   const run = () => createConfetti(container);
                   run();
                   if (container.classList.contains('loop')) {
                       animationIntervals.set(container, setInterval(run, 5000));
                   }
                });

                const sparksContainers = pageElement.querySelectorAll('.sparks-container');
                sparksContainers.forEach(container => {
                    const run = () => createSparks(container);
                    run();
                     if (container.classList.contains('loop')) {
                        animationIntervals.set(container, setInterval(run, 200));
                    }
                });
            }

            function createFireworks(container) {
                for (let i = 0; i < 15; i++) {
                    const firework = document.createElement('div');
                    firework.style.position = 'absolute';
                    firework.style.bottom = '0';
                    firework.style.left = Math.random() * 100 + '%';
                    firework.style.width = '2px';
                    firework.style.height = '10px';
                    firework.style.background = \`hsl(\${Math.random() * 360}, 100%, 50%)\`;
                    firework.style.animation = \`firework-up \${1 + Math.random()}s ease-out\`;
                    container.appendChild(firework);

                    firework.addEventListener('animationend', () => {
                        for (let j = 0; j < 30; j++) {
                            const particle = document.createElement('div');
                            particle.style.position = 'absolute';
                            particle.style.left = firework.style.left;
                            particle.style.top = firework.offsetTop + 'px'; // Explode from where rocket ended
                            particle.style.width = '3px';
                            particle.style.height = '3px';
                            const color = \`hsl(\${Math.random() * 360}, 100%, 50%)\`;
                            particle.style.background = color;
                            particle.style.borderRadius = '50%';
                            const angle = Math.random() * Math.PI * 2;
                            const distance = Math.random() * 50;
                            particle.style.transform = \`translate(\${Math.cos(angle) * distance}px, \${Math.sin(angle) * distance}px)\`;
                            particle.style.transition = 'transform 1s, opacity 1s';
                            particle.style.opacity = '1';
                            
                            setTimeout(() => {
                                particle.style.transform += ' scale(0)';
                                particle.style.opacity = '0';
                            }, 10);

                            container.appendChild(particle);
                            setTimeout(() => particle.remove(), 1000);
                        }
                        firework.remove();
                    });
                }
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
                    confetti.style.transform = \`rotate(\${Math.random() * 360}deg)\`;
                    confetti.style.animation = \`confetti-fall \${3 + Math.random() * 2}s \${Math.random() * 4}s linear\`;
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
                    spark.style.animation = \`spark-flow \${0.5 + Math.random() * 0.5}s ease-out\`;
                    container.appendChild(spark);
                    setTimeout(() => spark.remove(), 1000);
                 }
            }


            document.body.addEventListener('click', (e) => {
              // Traverse up the DOM to find the button if a child was clicked
              let target = e.target;
              while(target && target.tagName !== 'BUTTON') {
                target = target.parentElement;
              }

              if (target && target.tagName === 'BUTTON') {
                const linkTo = target.getAttribute('data-link-to');
                if (linkTo) {
                  navigateTo(linkTo);
                }
              }
            });
            
            // Initial page load handling
            if (currentPageId) {
                const initialPage = document.getElementById(currentPageId);
                if(initialPage) {
                    handlePageChange(initialPage);
                }
            }
        });
      </script>
    </body>
    </html>
  `;
};
