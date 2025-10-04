document.addEventListener('DOMContentLoaded', function() {
  const resizableLayout = document.querySelector('.resizable-layout');
  const resizer = document.querySelector('.resizer');
  const header = resizableLayout.querySelector('header');
  const section = resizableLayout.querySelector('section');

  let isResizing = false;
  let startX, startWidthHeader, startWidthSection;

  resizer.addEventListener('mousedown', function(e) {
    isResizing = true;
    startX = e.clientX;
    startWidthHeader = header.offsetWidth;
    startWidthSection = section.offsetWidth;
    resizer.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection during drag
  });

  document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;

    const currentX = e.clientX;
    const diff = currentX - startX;

    const newWidthHeader = startWidthHeader + diff;
    const newWidthSection = startWidthSection - diff;

    // Define minimum and maximum widths to prevent elements from collapsing
    const minHeaderWidth = 150; // Minimum width for the header
    const maxHeaderWidth = 400; // Maximum width for the header
    const minSectionWidth = 150; // Minimum width for the section

    if (newWidthHeader >= minHeaderWidth && newWidthHeader <= maxHeaderWidth && newWidthSection >= minSectionWidth) {
      header.style.width = `${newWidthHeader}px`;
      section.style.width = `${newWidthSection}px`;
      
      // Update grid column widths if using grid
      // Note: If using grid, direct width manipulation might be overridden.
      // A better approach for grid would be to update grid-column-width properties.
      // For simplicity here, we'll assume direct width manipulation works or adjust if needed.
      // If using grid, you might need to update the style of the grid container or the columns directly.
      // Example for grid:
      // resizableLayout.style.gridTemplateColumns = `${newWidthHeader}px 10px ${newWidthSection}px`;
    }
  });

  document.addEventListener('mouseup', function() {
    if (isResizing) {
      isResizing = false;
      resizer.style.cursor = 'col-resize'; // Reset cursor
      document.body.style.userSelect = ''; // Re-enable text selection
    }
  });

  // Initial setup for responsive adjustments if needed
  // This part might need more sophisticated handling based on actual breakpoints and desired behavior
  // For now, the CSS media queries handle the basic responsiveness.
});
