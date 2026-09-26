document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const errorBanner = document.getElementById('errorBanner');
  const successBanner = document.getElementById('successBanner');
  const uploadForm = document.getElementById('uploadForm');
  const photoInput = document.getElementById('photoInput');
  const resultCard = document.getElementById('resultCard');
  const photoDetails = document.getElementById('photoDetails');
  const photoImg = document.getElementById('photoImg');

  if (urlParams.get('uploadFailed') === '1') {
    errorBanner.style.display = 'block';
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.style.display = 'none';
    successBanner.style.display = 'none';
    resultCard.style.display = 'none';

    if (!photoInput.files || photoInput.files.length === 0) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', photoInput.files[0]);

    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData
      });

      if (response.status === 413) {
        const errorData = await response.json().catch(() => ({}));
        errorBanner.textContent = `Upload Failed: ${errorData.message || 'Photo must be 8 MiB or smaller.'}`;
        errorBanner.style.display = 'block';
        return;
      }

      if (response.status >= 500) {
        // Application treats 5xx as severe failure and redirects
        window.location.href = '/?uploadFailed=1';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Upload failed with status ' + response.status);
        return;
      }

      const data = await response.json();
      successBanner.style.display = 'block';
      resultCard.style.display = 'block';
      photoDetails.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      photoImg.src = `/api/photos/${data.id}/content`;
    } catch (err) {
      console.error('Network or upload error:', err);
      window.location.href = '/?uploadFailed=1';
    }
  });
});
