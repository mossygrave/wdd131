// Select the menu button and the menu
const menuButton = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

// Add a click event listener to the button
menuButton.addEventListener('click', () => {
  // Toggle the 'open' class on the menu to show/hide it
  menu.classList.toggle('open');

  // Update the aria-expanded attribute for accessibility
  const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', !isExpanded);
});
    // Select the modal viewer elements
    const viewer = document.querySelector('.viewer');
    const viewerImg = viewer.querySelector('img');
    const closeViewer = viewer.querySelector('.close-viewer');

    // Function to open the modal with the specified image source
    function openModal(imageSrc, altText) {
      viewerImg.src = imageSrc;
      viewerImg.alt = altText;
      viewer.style.display = 'grid';
    }

    // Function to close the modal
    function closeModal() {
      viewer.style.display = 'none';
      // Optionally, remove the src to stop any ongoing image loading
      viewerImg.src = '';
    }

    // Add event listeners to thumbnail images
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        // Use the data-large attribute if available, or fallback to the thumbnail's src
        const largeImageUrl = thumbnail.getAttribute('data-large') || thumbnail.src;
        const altText = thumbnail.alt || 'Enlarged image';
        openModal(largeImageUrl, altText);
      });
    });

    // Add event listener for the close button
    closeViewer.addEventListener('click', closeModal);

    // Optionally close the modal if clicking outside the image (but inside the viewer)
    viewer.addEventListener('click', (event) => {
      // Only close if the viewer itself was clicked, not one of its children
      if (event.target === viewer) {
        closeModal();
      }
    });
