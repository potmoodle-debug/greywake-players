const images = [
  {
    name: 'Great-Shell',
    src: '../assets/great-shell.jpg',
    note: 'Direct repository JPEG — no conversion or loader.'
  },
  {
    name: 'Cacklemaw',
    src: '../assets/cacklemaw.jpg',
    note: 'Direct repository JPEG — no conversion or loader.'
  },
  {
    name: 'Latchfan',
    src: '../assets/flora/latchfan.jpg',
    note: 'Direct repository JPEG — no conversion or loader.'
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
