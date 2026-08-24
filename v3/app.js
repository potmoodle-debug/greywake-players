const images = [
  {
    name: 'Great-Shell — OLD WORKING',
    src: '../assets/great-shell.jpg',
    note: 'Older direct JPEG — about 427 KB.'
  },
  {
    name: 'Great-Shell — CURRENT PROBLEM',
    src: '../assets/obsidian/great-shell-canon-visual-reference.webp',
    note: 'Later processed WebP — about 7.5 KB.'
  },
  {
    name: 'Latchfan — OLD WORKING',
    src: '../assets/flora/latchfan.jpg',
    note: 'Older direct JPEG.'
  },
  {
    name: 'Latchfan — CURRENT PROBLEM',
    src: '../assets/obsidian/latchfan-01-mature-specimen.webp',
    note: 'Later processed WebP — about 7.5 KB.'
  },
  {
    name: 'Cacklemaw — OLD WORKING',
    src: '../assets/cacklemaw.jpg',
    note: 'Older direct JPEG — about 260 KB.'
  },
  {
    name: 'Cacklemaw Pack — CURRENT PROBLEM',
    src: '../assets/obsidian/cacklemaw-pack-stonelip-view.webp',
    note: 'Later processed WebP — about 7.5 KB. Different composition, included to compare file quality rather than exact framing.'
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
    caption.textContent = `${item.name} — ${item.src}`;
    dialog.showModal();
  });

  const title = document.createElement('h2');
  title.textContent = item.name;

  const note = document.createElement('p');
  note.textContent = item.note;

  const path = document.createElement('code');
  path.textContent = item.src;

  card.append(img, title, note, path);
  gallery.append(card);
}

closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
