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
let activeThumbnail;

function openModal(imageSrc, altText, thumbnail) {
  viewerImg.src = imageSrc;
  viewerImg.alt = altText;
  activeThumbnail = thumbnail;
  viewer.hidden = false;
  closeViewer.focus();
}

function closeModal() {
  viewer.hidden = true;
  viewerImg.src = '';
  activeThumbnail?.focus();
}

const thumbnails = document.querySelectorAll('.thumbnail');
thumbnails.forEach(thumbnail => {
  const showFullImage = () => {
    const largeImageUrl = thumbnail.getAttribute('data-large') || thumbnail.src;
    const altText = thumbnail.alt || 'Enlarged image';
    openModal(largeImageUrl, altText, thumbnail);
  };

  thumbnail.addEventListener('click', showFullImage);
  thumbnail.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showFullImage();
    }
  });
});

closeViewer.addEventListener('click', closeModal);

viewer.addEventListener('click', event => {
  if (event.target === viewer) {
    closeModal();
  }
});

document.addEventListener('keydown', event => {
  if (!viewer.hidden && event.key === 'Escape') {
    closeModal();
  }
});
