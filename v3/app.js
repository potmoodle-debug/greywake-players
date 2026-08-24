const images = [
  {
    name: 'Great-Shell',
    src: 'assets/great-shell-canon-visual-reference.jpg',
    note: 'Fresh full-dimension JPEG made directly from the live Obsidian/Drive master.'
  },
  {
    name: 'Cacklemaw Pack',
    src: 'assets/cacklemaw-pack-stonelip-view.jpg',
    note: 'Fresh full-dimension JPEG made directly from the live Obsidian/Drive master.'
  },
  {
    name: 'Latchfan — Mature Specimen',
    src: 'assets/latchfan-01-mature-specimen.jpg',
    note: 'Fresh full-dimension JPEG made directly from the live Obsidian/Drive master.'
  },
  {
    name: 'Latchfan — Stone-Lip Habitat',
    src: 'assets/latchfan-02-stonelip-habitat.jpg',
    note: 'Fresh full-dimension JPEG made directly from the live Obsidian/Drive master.'
  }
];

const gallery = document.getElementById('gallery');
const dialog = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const caption = document.getElementById('lightbox-caption');
const closeButton = document.getElementById('close');

for (const item of images) {
  const card = document.createElement('article');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.name;
  img.loading = 'eager';
  img.decoding = 'async';
  img.addEventListener('click', () => {
    lightboxImage.src = item.src;
    lightboxImage.alt = item.name;
    caption.textContent = item.name;
    dialog.showModal();
  });

  const title = document.createElement('h2');
  title.textContent = item.name;

  const note = document.createElement('p');
  note.textContent = item.note;

  card.append(img, title, note);
  gallery.append(card);
}

closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
