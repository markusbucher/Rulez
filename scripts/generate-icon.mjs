import sharp from 'sharp';
import { writeFileSync } from 'fs';

// SVG: 1024×1024, deep navy rounded square, gold "R" in a classic serif style
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <!-- Background gradient: deep navy to midnight blue -->
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F2057"/>
      <stop offset="100%" stop-color="#1A3A8F"/>
    </linearGradient>

    <!-- Gold gradient for the R -->
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#FFE26A"/>
      <stop offset="40%"  stop-color="#F5C518"/>
      <stop offset="100%" stop-color="#C8960C"/>
    </linearGradient>

    <!-- Soft glow around the R -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Subtle inner shadow on background -->
    <filter id="innerShadow">
      <feOffset dx="0" dy="4"/>
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in2="SourceGraphic" operator="arithmetic" k2="-1" k3="1"/>
    </filter>
  </defs>

  <!-- Background rounded square -->
  <rect x="32" y="32" width="960" height="960" rx="200" ry="200" fill="url(#bg)"/>

  <!-- Subtle border ring -->
  <rect x="32" y="32" width="960" height="960" rx="200" ry="200"
        fill="none" stroke="#F5C518" stroke-width="6" stroke-opacity="0.25"/>

  <!-- The "R" glyph — drawn as paths for maximum sharpness in any serif style -->
  <!-- Using a custom geometric serif R: elegant proportions -->
  <g filter="url(#glow)" fill="url(#gold)">
    <path d="
      M 290 180
      L 290 844
      L 358 844
      L 358 572
      L 510 572
      L 660 844
      L 740 844
      L 582 560
      C 652 541 700 502 728 444
      C 748 405 758 360 758 308
      C 758 262 748 220 728 184
      C 706 146 674 120 632 104
      C 592 88 536 80 466 80
      L 466 80
      L 290 180
      Z

      M 358 248
      L 454 248
      C 516 248 560 258 588 278
      C 618 300 634 334 634 380
      C 634 426 618 460 588 482
      C 560 502 516 512 454 512
      L 358 512
      Z
    " transform="translate(0, 100)"/>
  </g>

  <!-- Small decorative rule line under the letter -->
  <rect x="310" y="860" width="404" height="6" rx="3"
        fill="url(#gold)" opacity="0.6"/>
</svg>
`;

const svgBuffer = Buffer.from(svg);

// 1. Main icon: 1024×1024 (used by iOS)
await sharp(svgBuffer)
  .resize(1024, 1024)
  .png()
  .toFile('assets/icon.png');

// 2. Adaptive icon foreground: 1024×1024, transparent bg (Android)
//    Use the same design — the launcher will crop to circle/squircle
await sharp(svgBuffer)
  .resize(1024, 1024)
  .png()
  .toFile('assets/adaptive-icon.png');

// 3. Splash screen icon: 200×200 centred on white, exported at 512
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#F9FAFB"/>
  <!-- Mini version of the icon centred -->
  <g transform="translate(56, 56)">
    <rect x="0" y="0" width="400" height="400" rx="80" ry="80" fill="#0F2057"/>
    <rect x="0" y="0" width="400" height="400" rx="80" ry="80"
          fill="none" stroke="#F5C518" stroke-width="3" stroke-opacity="0.3"/>
    <defs>
      <linearGradient id="gold2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#FFE26A"/>
        <stop offset="40%"  stop-color="#F5C518"/>
        <stop offset="100%" stop-color="#C8960C"/>
      </linearGradient>
    </defs>
    <path d="
      M 88 55
      L 88 330
      L 114 330
      L 114 215
      L 172 215
      L 232 330
      L 262 330
      L 198 212
      C 226 205 245 190 256 168
      C 264 152 268 133 268 112
      C 268 93 264 76 256 61
      C 247 45 233 34 215 27
      C 198 20 174 16 143 16
      L 88 55
      Z
      M 114 90
      L 148 90
      C 172 90 189 94 200 103
      C 213 113 219 128 219 148
      C 219 168 213 183 200 192
      C 189 201 172 205 148 205
      L 114 205
      Z
    " fill="url(#gold2)" transform="translate(20, 30)"/>
  </g>
</svg>
`;

await sharp(Buffer.from(splashSvg))
  .resize(512, 512)
  .png()
  .toFile('assets/splash-icon.png');

// 4. Favicon: 48×48
await sharp(svgBuffer)
  .resize(48, 48)
  .png()
  .toFile('assets/favicon.png');

console.log('✓ icon.png          1024×1024');
console.log('✓ adaptive-icon.png 1024×1024');
console.log('✓ splash-icon.png    512×512');
console.log('✓ favicon.png         48×48');
