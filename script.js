const form = document.getElementById('test-form');
const inputs = form.querySelectorAll('input, select');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
let selectedFile = null;

function validateForm() {
  const allFilled = [...inputs].every(input => input.value);
  uploadBtn.disabled = !(selectedFile && allFilled);
}

inputs.forEach(input => input.addEventListener('input', validateForm));

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  selectedFile = e.dataTransfer.files[0];
  dropZone.textContent = `File selected: ${selectedFile.name}`;
  validateForm();
});

fileInput.addEventListener('change', e => {
  selectedFile = e.target.files[0];
  dropZone.textContent = `File selected: ${selectedFile.name}`;
  validateForm();
});

uploadBtn.addEventListener('click', () => {
  const formData = new FormData(form);
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

const resetBtn = document.getElementById('reset-btn');

resetBtn.addEventListener('click', (e) => {
  e.preventDefault();

  // Clear form inputs
  form.reset();

  // Clear selected file and reset drop zone
  selectedFile = null;
  dropZone.textContent = 'Drag & Drop your TDMS file here';
  fileInput.value = '';

  // Disable the upload button
  uploadBtn.disabled = true;
});



