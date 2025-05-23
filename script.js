const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
let selectedFile = null;

// Highlight drop zone on drag
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

// Remove highlight on drag leave
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

// Handle file drop
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  selectedFile = e.dataTransfer.files[0];
  dropZone.textContent = `File selected: ${selectedFile.name}`;
});

// Handle file browse
fileInput.addEventListener('change', e => {
  selectedFile = e.target.files[0];
  dropZone.textContent = `File selected: ${selectedFile.name}`;
});

// Handle upload click
uploadBtn.addEventListener('click', () => {
  if (!selectedFile) {
    alert('No file selected!');
    return;
  }

  const formData = new FormData();
  formData.append('tdmsFile', selectedFile);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
    .then(res => res.text())
    .then(msg => alert(msg))
    .catch(err => {
      console.error('Upload failed:', err);
      alert('Upload failed');
    });
});