import type { Project, EditorElement, ButtonElement } from './types';

export const generateHtmlForProject = (project: Project): string => {
  const getElementStyle = (element: EditorElement): string => {
    let style = `position: absolute; left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; height: ${element.size.height}px; transform: rotate(${element.rotation || 0}deg); overflow: hidden;`;
    
    if (element.animation) {
      style += ` animation: ${element.animation.replace('anim-','')} 0.5s ease-out forwards;`;
      
      // Manually add keyframes for specific animations if they are simple
      // This is a simple approach. For complex animations, a CSS file is better.
      if (element.animation === 'anim-fade-in') {
        // Keyframe is already in the global style block
      } else if (element.animation === 'anim-slide-in-up') {
        // Keyframe is already in the global style block
      }
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
      case 'container':
        style += `background-color: ${element.backgroundColor};`;
        content = `<div style="${style}"></div>`;
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
    const displayStyle = index === 0 ? 'block' : 'none';
    
    return `<div id="${page.id}" class="page" style="overflow: hidden; ${displayStyle}; ${pageStyle}" ${redirectAttr} ${audioAttr}>${pageContent}</div>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${project.name || 'URA Project'}</title>
      <style>
        body, html { margin: 0; padding: 0; font-family: sans-serif; }
        .page { width: 100vw; height: 100vh; }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px) scale(1); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .fade-in { animation-name: fadeIn; }
        .slide-in-up { animation-name: slideInUp; }
        .pulse { animation-name: pulse; animation-iteration-count: infinite; }
        .pop { animation-name: pop; }
      </style>
    </head>
    <body>
      ${pagesHtml}
      <audio id="background-audio" loop></audio>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
            const pages = document.querySelectorAll('.page');
            const audioPlayer = document.getElementById('background-audio');
            let currentPageId = pages.length > 0 ? pages[0].id : null;
            let redirectTimer;

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
                if (audioSrc && audioPlayer.src !== audioSrc) {
                    audioPlayer.src = audioSrc;
                    audioPlayer.play().catch(e => console.error("Audio play failed:", e));
                } else if (!audioSrc) {
                    audioPlayer.pause();
                    audioPlayer.src = '';
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
