const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 简单的 CSS 压缩函数
function minifyCSS(inputPath, outputPath) {
  try {
    const cssContent = fs.readFileSync(inputPath, 'utf8');
    
    // 基本的 CSS 压缩
    const minified = cssContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
      .replace(/\s+/g, ' ') // 压缩空格
      .replace(/;\s*/g, ';') // 移除分号后的空格
      .replace(/:\s*/g, ':') // 移除冒号后的空格
      .replace(/\s*\{\s*/g, '{') // 压缩大括号周围的空格
      .replace(/\s*\}\s*/g, '}')
      .replace(/\s*\,\s*/g, ',')
      .replace(/\s*\!\s*/g, '!')
      .trim();
    
    fs.writeFileSync(outputPath, minified);
    console.log(`✓ CSS 压缩完成: ${outputPath}`);
  } catch (error) {
    console.error(`✗ CSS 压缩失败: ${error.message}`);
  }
}

// 主构建函数
function build() {
  console.log('开始构建网站...');
  
  // 压缩 CSS
  minifyCSS('stylesheets/styles.css', 'stylesheets/styles.min.css');
  
  console.log('构建完成！');
}

// 执行构建
build();
