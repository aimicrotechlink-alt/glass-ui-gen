document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const glassPreview = document.getElementById('glass-preview');
    
    // Sliders & Inputs
    const blurSlider = document.getElementById('blur-slider');
    const opacitySlider = document.getElementById('opacity-slider');
    const borderSlider = document.getElementById('border-slider');
    const colorPicker = document.getElementById('color-picker');
    
    // Value Displays
    const blurVal = document.getElementById('blur-val');
    const opacityVal = document.getElementById('opacity-val');
    const borderVal = document.getElementById('border-val');
    
    // Code Output
    const cssCode = document.getElementById('css-code');
    const copyBtn = document.getElementById('copy-btn');
    const randomizeBtn = document.getElementById('randomize-btn');
    
    // Pro Modals & Tabs
    const codeTabs = document.createElement('div');
    codeTabs.className = 'code-tabs';
    codeTabs.innerHTML = `
        <button class="tab-btn active" data-target="css">CSS</button>
        <button class="tab-btn pro-feature" data-target="tailwind">Tailwind <span class="badge">PRO</span></button>
        <button class="tab-btn pro-feature" data-target="react">React <span class="badge">PRO</span></button>
        <button class="tab-btn pro-feature" data-target="vue">Vue <span class="badge">PRO</span></button>
    `;
    
    // Insert tabs above code block
    document.querySelector('.code-header').insertBefore(codeTabs, copyBtn);
    
    // User State Management (Pro Status & Exports)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        localStorage.setItem('glassui_pro', 'true');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    const isPro = localStorage.getItem('glassui_pro') === 'true';
    let exportHistory = JSON.parse(localStorage.getItem('glassui_exports') || '[]');

    if (isPro) {
        document.querySelectorAll('.badge').forEach(b => b.style.display = 'none');
        const upgradeCard = document.querySelector('.upgrade-card');
        if (upgradeCard) {
            upgradeCard.innerHTML = `<h3>Welcome to Pro!</h3><p>Enjoy limitless exports.</p>`;
        }
    }

    // Tab Switching Logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('pro-feature') && !isPro) {
                // If not pro, trigger checkout
                triggerCheckout();
                return;
            }
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.getAttribute('data-target');
            updateTopNavActiveState(currentTab); // Sync top nav buttons
            updateGlass(); // Regenerate code for new tab
        });
    });

    // Fix dead sidebar links
    const sidebarLinks = document.querySelectorAll('.nav-links a');
    const sections = {
        'Generator': document.getElementById('preview-area'),
        'Pro Components': document.getElementById('pro-components-area'),
        'Exports': document.getElementById('exports-area')
    };

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // The textContent includes the text of the span badge 'PRO'. We need to strip it from the end.
            const targetName = link.textContent.replace(/PRO/g, '').trim();
            
            if (link.classList.contains('pro-link') && !isPro) {
                triggerCheckout();
                return;
            }

            // Update active state
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Toggle views
            Object.values(sections).forEach(sec => {
                if (sec) sec.style.display = 'none';
            });
            if (sections[targetName]) {
                sections[targetName].style.display = 'flex';
            }
        });
    });

    // Wire up Pro Component generic "View Code" buttons
    document.querySelectorAll('.components-grid .btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
             const templates = [
                 `<!-- Glass Navbar -->\n<nav class="backdrop-blur-md bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between">\n  <div class="font-bold text-white">Logo</div>\n  <div class="flex gap-4"><a href="#">Home</a><a href="#">About</a></div>\n</nav>`,
                 `<!-- Glass Hero -->\n<div class="h-screen flex items-center justify-center">\n  <div class="backdrop-blur-lg bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl text-center">\n    <h1 class="text-5xl font-bold text-white">Build Faster</h1>\n    <p class="text-gray-300 mt-4">Premium glassmorphism made easy.</p>\n  </div>\n</div>`,
                 `<!-- Glass Pricing -->\n<div class="backdrop-blur-md bg-black/20 border border-white/10 p-8 rounded-2xl w-80">\n  <h3 class="text-2xl text-white font-bold">Pro Tier</h3>\n  <p class="text-4xl text-white mt-4">$29</p>\n  <button class="w-full mt-6 bg-indigo-500 py-2 rounded-lg text-white">Upgrade</button>\n</div>`,
                 `<!-- Glass Login -->\n<form class="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl w-96 flex flex-col gap-4">\n  <h2 class="text-2xl text-white mb-4">Sign In</h2>\n  <input type="email" placeholder="Email" class="bg-black/20 border border-white/10 rounded p-2 text-white">\n  <input type="password" placeholder="Password" class="bg-black/20 border border-white/10 rounded p-2 text-white">\n  <button class="bg-indigo-500 text-white rounded p-2 mt-2">Login</button>\n</form>`
             ];

             const codeToCopy = templates[index] || templates[0];
             navigator.clipboard.writeText(codeToCopy).then(() => {
                 const originalText = btn.textContent;
                 btn.textContent = 'Code Copied!';
                 setTimeout(() => {
                     btn.textContent = originalText;
                 }, 2000);
             });
        });
    });

    // Pro Checkout Trigger
    function triggerCheckout() {
        if(confirm("Unlock React & Tailwind Exporters for $29?")) {
            fetch('/api/checkout', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if(data.url) window.location.href = data.url;
            })
            .catch(err => alert("Checkout error. Ensure server is running."));
        }
    }

    // Attach to Upgrade Buttons
    const upgradeBtnElem = document.querySelector('.upgrade-card .btn');
    if (upgradeBtnElem) {
        upgradeBtnElem.addEventListener('click', (e) => {
            e.preventDefault();
            triggerCheckout();
        });
    }
    
    // Attach top nav buttons to trigger the corresponding tabs and download
    const exportReactBtn = document.getElementById('export-react-btn');
    const exportVueBtn = document.getElementById('export-vue-btn');
    const exportTailwindBtn = document.getElementById('export-tailwind-btn');

    // Helper to update top nav active state
    function updateTopNavActiveState(target) {
        if (!exportReactBtn || !exportVueBtn || !exportTailwindBtn) return;
        
        [exportReactBtn, exportVueBtn, exportTailwindBtn, randomizeBtn].forEach(btn => {
            if (btn && btn.id !== 'randomize-btn') {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
            }
        });

        if (target === 'react' && exportReactBtn) {
            exportReactBtn.classList.remove('btn-outline');
            exportReactBtn.classList.add('btn-primary');
        } else if (target === 'vue' && exportVueBtn) {
            exportVueBtn.classList.remove('btn-outline');
            exportVueBtn.classList.add('btn-primary');
        } else if (target === 'tailwind' && exportTailwindBtn) {
            exportTailwindBtn.classList.remove('btn-outline');
            exportTailwindBtn.classList.add('btn-primary');
        }
    }

    // Function to render the Export History UI from localStorage
    function renderExportHistory() {
        const exportsArea = document.querySelector('#exports-area > div');
        if (!exportsArea) return;

        if (exportHistory.length === 0) {
            exportsArea.innerHTML = `
                <div class="glass-card" style="width: 100%; text-align: center; padding: 4rem 2rem;">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" style="margin-bottom: 1rem; opacity: 0.5;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                    <h3>No recent exports found</h3>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">Files you export from the Generator will appear here for easy redownloading.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="exports-list" style="display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 800px; margin: 0 auto;">';
        
        // Reverse so newest is on top
        [...exportHistory].reverse().forEach(exp => {
            const isReact = exp.filename.includes('.jsx');
            const isVue = exp.filename.includes('.vue');
            const iconColor = isReact ? '#61dafb' : (isVue ? '#41b883' : '#38bdf8');
            
            html += `
                <div class="glass-card" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${iconColor}">
                    <div>
                        <h4 style="color: white; margin-bottom: 0.25rem;">${exp.filename}</h4>
                        <span style="font-size: 0.85rem; opacity: 0.7;">Exported at ${exp.timeString}</span>
                    </div>
                    <button class="btn btn-outline small" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(exp.content)}'))">Copy Code</button>
                </div>
            `;
        });
        
        html += '</div>';
        exportsArea.innerHTML = html;
    }

    // Function to trigger file download and update export history
    function downloadCode(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        // Save to state and re-render
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        exportHistory.push({ filename, content, timeString });
        localStorage.setItem('glassui_exports', JSON.stringify(exportHistory));
        
        renderExportHistory();
    }
    
    // Render exports on initial load
    renderExportHistory();

    [{ btn: exportReactBtn, target: 'react', filename: 'GlassCard.jsx' },
     { btn: exportVueBtn, target: 'vue', filename: 'GlassCard.vue' },
     { btn: exportTailwindBtn, target: 'tailwind', filename: 'glass-tailwind.html' }
    ].forEach(({btn, target, filename}) => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = document.querySelector(`[data-target="${target}"]`);
                if (tab) {
                    // Check if already on this tab and Pro is enabled, then download
                    if (currentTab === target && isProActual) {
                        downloadCode(filename, cssCode.textContent);
                        // Briefly change text to show feedback
                        const originalText = btn.textContent;
                        btn.textContent = 'Downloaded!';
                        setTimeout(() => btn.textContent = originalText, 1500);
                    } else {
                        // Switch to the tab (triggers pro check)
                        tab.click();
                        // If it successfully switched (they have pro), download it immediately too
                        setTimeout(() => {
                            if (currentTab === target) {
                                downloadCode(filename, cssCode.textContent);
                                const originalText = btn.textContent;
                                btn.textContent = 'Downloaded!';
                                setTimeout(() => btn.textContent = originalText, 1500);
                            }
                        }, 100);
                    }
                }
            });
        }
    });

    // Export logic is now handled by the tab switching logic at the top.

    // Utility to convert Hex to RGB
    function hexToRgb(hex) {
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Update function
    function updateGlass() {
        const blur = blurSlider.value;
        const opacity = parseFloat(opacitySlider.value);
        const border = borderSlider.value;
        const color = colorPicker.value;
        const rgb = hexToRgb(color);
        
        const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        const borderColorCSS = border > 0 ? `border: ${border}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0.1, opacity - 0.1)});` : `border: none;`;
        
        glassPreview.style.background = bgColor;
        glassPreview.style.backdropFilter = `blur(${blur}px)`;
        glassPreview.style.webkitBackdropFilter = `blur(${blur}px)`;
        glassPreview.style.border = border > 0 ? `${border}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0.1, opacity - 0.1)})` : 'none';
        glassPreview.style.boxShadow = `0 8px 32px 0 rgba(0, 0, 0, 0.3)`;
        
        blurVal.textContent = blur;
        opacityVal.textContent = opacity.toFixed(2);
        borderVal.textContent = border;

        let codeSnippet = '';
        if (currentTab === 'css') {
            codeSnippet = `background: ${bgColor};\nbox-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\n${borderColorCSS}`;
        } else if (currentTab === 'react') {
            const borderColorReact = border > 0 ? `border: '${border}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0.1, opacity - 0.1)})'` : `border: 'none'`;
            codeSnippet = `const GlassCard = () => (\n  <div style={{\n    background: '${bgColor}',\n    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',\n    backdropFilter: 'blur(${blur}px)',\n    WebkitBackdropFilter: 'blur(${blur}px)',\n    ${borderColorReact}\n  }}>\n    {/* Content */}\n  </div>\n);`;
        } else if (currentTab === 'vue') {
            codeSnippet = `<template>\n  <div class="glass-card">\n    <!-- Content -->\n  </div>\n</template>\n\n<style scoped>\n.glass-card {\n  background: ${bgColor};\n  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);\n  backdrop-filter: blur(${blur}px);\n  -webkit-backdrop-filter: blur(${blur}px);\n  ${borderColorCSS}\n}\n</style>`;
        } else if (currentTab === 'tailwind') {
            const borderTailwind = border > 0 ? `border border-white border-opacity-${Math.round((Math.max(0.1, opacity - 0.1)) * 100)}` : '';
            codeSnippet = `<!-- Approximate Tailwind Classes -->\n<div class="bg-[${color}] bg-opacity-${Math.round(opacity*100)} backdrop-blur-[${blur}px] shadow-2xl ${borderTailwind}">\n  <!-- Content -->\n</div>`;
        }

        cssCode.textContent = codeSnippet;
    }

    [blurSlider, opacitySlider, borderSlider, colorPicker].forEach(input => {
        input.addEventListener('input', updateGlass);
    });

    updateGlass();

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(cssCode.textContent).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        });
    });

    randomizeBtn.addEventListener('click', () => {
        blurSlider.value = Math.floor(Math.random() * 30);
        opacitySlider.value = (Math.random() * 0.7 + 0.1).toFixed(2);
        borderSlider.value = Math.floor(Math.random() * 3);
        
        const r = Math.floor(Math.random() * 155) + 100;
        const g = Math.floor(Math.random() * 155) + 100;
        const b = Math.floor(Math.random() * 155) + 100;
        
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        colorPicker.value = hex;

        updateGlass();
        
        // Reset to CSS mode upon randomize
        if (currentTab !== 'css') {
            document.querySelector('[data-target="css"]').click();
        } else {
            updateTopNavActiveState('css'); // Ensure buttons deactivate if already on CSS
        }
    });
});
