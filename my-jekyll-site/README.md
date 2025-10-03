# My Jekyll Site

This is a Jekyll site hosted on GitHub Pages. Below are the instructions for setting up and using this project.

## Project Structure

- **_config.yml**: Configuration settings for the Jekyll site, including site title and description.
- **_posts/**: Contains blog posts in Markdown format. Each post includes metadata such as title and date.
- **_layouts/**: Layout templates for the site.
  - **default.html**: The default layout for all pages.
  - **post.html**: The layout specifically for blog posts.
- **_includes/**: Reusable HTML snippets.
  - **head.html**: Contains the head section of the HTML.
  - **header.html**: Contains the header section of the HTML.
- **_sass/**: Sass styles for the site.
  - **_base.scss**: Base styles for the site.
- **assets/**: Contains static assets.
  - **css/**: CSS files for styling.
    - **styles.css**: Main CSS styles for the site.
  - **js/**: JavaScript files for interactivity.
    - **main.js**: JavaScript code for the site.
- **pages/**: Additional Markdown pages.
  - **about.md**: Information about the site or author.
  - **research.md**: Outlines research interests or projects.
- **index.md**: The homepage of the site.
- **CNAME**: Custom domain settings for the GitHub Pages site.
- **Gemfile**: Specifies Ruby gems required for the Jekyll site.
- **.github/workflows/pages.yml**: GitHub Actions workflow for deploying the site.

## Setup Instructions

1. **Clone the Repository**: Clone this repository to your local machine.
   ```
   git clone https://github.com/yourusername/my-jekyll-site.git
   ```

2. **Install Dependencies**: Navigate to the project directory and install the required gems.
   ```
   cd my-jekyll-site
   bundle install
   ```

3. **Run the Jekyll Server**: Start the Jekyll server to preview your site locally.
   ```
   bundle exec jekyll serve
   ```

4. **Access Your Site**: Open your web browser and go to `http://localhost:4000` to view your site.

## Usage

- To create a new blog post, add a new Markdown file in the `_posts` directory following the naming convention `YYYY-MM-DD-title.md`.
- Update the `_config.yml` file to change site settings such as title and description.
- Customize styles in the `assets/css/styles.css` file or in the `_sass/_base.scss` file.

## Deployment

This site is automatically deployed to GitHub Pages. Make sure to push your changes to the `main` branch to update the live site.

## License

This project is licensed under the MIT License. See the LICENSE file for details.