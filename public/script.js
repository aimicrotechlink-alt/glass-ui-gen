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

    // Upgrade & Export Buttons
    const upgradeBtn = document.getElementById('upgrade-btn');
    const exportReactBtn = document.getElementById('export-react-btn');
    const exportVueBtn = document.getElementById('export-vue-btn');
    const exportTailwindBtn = document.getElementById('export-tailwind-btn');

    // Pro Feature Logic
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' && urlParams.get('session_id')) {
        localStorage.setItem('glassui_pro', 'true');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    const isPro = localStorage.getItem('glassui_pro') === 'true';

    if (isPro && upgradeBtn) {
        upgradeBtn.textContent = "Pro Enabled";
        upgradeBtn.classList.remove('btn-primary', 'btn-glow');
        upgradeBtn.classList.add('btn-outline');
        upgradeBtn.disabled = true;
        const pDesc = document.querySelector('.upgrade-card p');
        if (pDesc) pDesc.textContent = "Thanks for upgrading! Premium features unlocked.";
    }

    if (upgradeBtn && !isPro) {
        upgradeBtn.addEventListener('click', async () => {
            upgradeBtn.textContent = 'Loading...';
            try {
                const res = await fetch('/api/checkout', { method: 'POST' });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                }
            } catch (err) {
                console.error(err);
                alert("Could not connect to payment server.");
                upgradeBtn.textContent = 'Upgrade to Pro - $29';
            }
        });
    }

    function requirePro(cb) {
        return () => {
            if (!isPro) {
                alert("This is a Pro feature! Please upgrade to unlock exports and premium templates.");
            } else {
                cb();
            }
        }
    }

    let currentExportMode = 'css';
    function setExportMode(mode) {
        currentExportMode = mode;
        const codeTitle = document.querySelector('.code-header h4');
        if (codeTitle) {
            codeTitle.textContent = mode === 'css' ? 'CSS Code' : `${mode.charAt(0).toUpperCase() + mode.slice(1)} Code`;
        }
        updateGlass();
    }

    if (exportReactBtn) exportReactBtn.addEventListener('click', requirePro(() => setExportMode('react')));
    if (exportVueBtn) exportVueBtn.addEventListener('click', requirePro(() => setExportMode('vue')));
    if (exportTailwindBtn) exportTailwindBtn.addEventListener('click', requirePro(() => setExportMode('tailwind')));

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
        if (currentExportMode === 'css') {
            codeSnippet = `background: ${bgColor};\nbox-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\n${borderColorCSS}`;
        } else if (currentExportMode === 'react') {
            const borderColorReact = border > 0 ? `border: '${border}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0.1, opacity - 0.1)})'` : `border: 'none'`;
            codeSnippet = `const GlassCard = () => (\n  <div style={{\n    background: '${bgColor}',\n    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',\n    backdropFilter: 'blur(${blur}px)',\n    WebkitBackdropFilter: 'blur(${blur}px)',\n    ${borderColorReact}\n  }}>\n    {/* Content */}\n  </div>\n);`;
        } else if (currentExportMode === 'vue') {
            codeSnippet = `<template>\n  <div class="glass-card">\n    <!-- Content -->\n  </div>\n</template>\n\n<style scoped>\n.glass-card {\n  background: ${bgColor};\n  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);\n  backdrop-filter: blur(${blur}px);\n  -webkit-backdrop-filter: blur(${blur}px);\n  ${borderColorCSS}\n}\n</style>`;
        } else if (currentExportMode === 'tailwind') {
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
        if (currentExportMode !== 'css') {
            setExportMode('css');
        }
    });
});
