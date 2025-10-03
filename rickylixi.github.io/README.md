# rickylixi.github.io

This repository hosts the personal website of Xi Li, an Associate Professor of Logic at Central South University. The site is built using Jekyll and hosted on GitHub Pages.

## Project Structure

- **_config.yml**: Configuration settings for the Jekyll site, including site title and description.
- **_posts/**: Contains blog posts in Markdown format.
- **_layouts/**: Layout templates for the site, including default and post-specific layouts.
- **_includes/**: Reusable HTML snippets, such as the head section.
- **assets/**: Contains CSS and JavaScript files for styling and interactivity.
- **pages/**: Additional Markdown pages like About and Research.
- **blog.html**: A static HTML page serving as the blog landing page.
- **index.md**: The main landing page for the site.
- **CNAME**: Custom domain settings for GitHub Pages.
- **Gemfile**: Specifies Ruby gems required for the Jekyll site.
- **.github/workflows/pages.yml**: GitHub Actions workflow for automating deployment.

## Setup Instructions

1. **Clone the Repository**: 
   ```bash
   git clone https://github.com/rickylixi/rickylixi.github.io.git
   cd rickylixi.github.io
   ```

2. **Install Dependencies**: 
   Make sure you have Ruby and Bundler installed, then run:
   ```bash
   bundle install
   ```

3. **Run the Jekyll Server**: 
   Start the local server to preview the site:
   ```bash
   bundle exec jekyll serve
   ```

4. **Access the Site**: 
   Open your browser and go to `http://localhost:4000` to view the site.

## Contributing

Feel free to submit issues or pull requests for any improvements or suggestions.