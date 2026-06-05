const tex2svg = require('node-tikzjax').default;
const fs = require('fs');
const path = require('path');

// TikZ diagrams from the blog post
const diagrams = [
  {
    name: 'tikzcd-commutative',
    source: `\\begin{document}
\\begin{tikzpicture}
\\begin{tikzcd}
X \\times Y^X \\ar[r,"\\varepsilon"] & Y \\ar[dd,"\\alpha"] \\\\
X\\times X \\ar[u,"1_X\\times f"] \\ar[ur,"\\hat{f}" swap] \\\\
X \\ar[u,"\\Delta"] \\ar[r,"g" swap] & Y
\\end{tikzcd}
\\end{tikzpicture}
\\end{document}`,
    options: { texPackages: { 'tikz-cd': '' }, showConsole: false }
  },
  {
    name: 'tikz-star',
    source: `\\begin{document}
\\begin{tikzpicture}[line width=7pt,line cap=round,line join=round]
  \\draw[green] (0,0) circle (2);
  \\draw[red] (-1.2,0.45) -- (-0.72,0.9) -- (0,0) -- (-0.72,-0.9) -- (-1.2,-0.2);
  \\draw[red] (1.2,0.45) -- (0.72,0.9) -- (0,0) -- (0.72,-0.9) -- (1.2,-0.2);
\\end{tikzpicture}
\\end{document}`,
    options: { showConsole: false }
  }
];

const outputDir = path.join(__dirname, '..', 'assets', 'tikz');

async function main() {
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const diagram of diagrams) {
    try {
      console.log(`Rendering ${diagram.name}...`);
      const svg = await tex2svg(diagram.source, diagram.options);
      
      const outputPath = path.join(outputDir, `${diagram.name}.svg`);
      fs.writeFileSync(outputPath, svg);
      console.log(`  -> ${outputPath} (${svg.length} bytes)`);
    } catch (err) {
      console.error(`  ERROR rendering ${diagram.name}:`, err.message);
      // Retry with console for debugging
      if (!diagram.options.showConsole) {
        console.error(`  Retrying with showConsole...`);
        try {
          const svg = await tex2svg(diagram.source, { ...diagram.options, showConsole: true });
          const outputPath = path.join(outputDir, `${diagram.name}.svg`);
          fs.writeFileSync(outputPath, svg);
          console.log(`  -> ${outputPath} (${svg.length} bytes)`);
        } catch (err2) {
          console.error(`  ERROR on retry:`, err2.message);
        }
      }
    }
  }
}

main().catch(console.error);
