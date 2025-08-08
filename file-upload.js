// 全局函数：将文件转换为Base64
window.fileToBase64 = function(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// 全局函数：重置文件预览
window.resetFilePreview = function() {
    const fileInput = document.getElementById('payment-slip');
    const previewContainer = document.getElementById('file-preview-container');
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
    }
    
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
        uploadStatus.textContent = '';
        uploadStatus.className = '';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('payment-slip');
    const previewContainer = document.getElementById('file-preview-container');
    
    if (fileInput && previewContainer) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (!file) {
                return;
            }
            
            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                alert('请上传有效的文件格式 (JPEG, PNG, GIF, PDF)');
                fileInput.value = '';
                return;
            }
            
            // Check file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                alert('文件太大。最大大小为5MB。');
                fileInput.value = '';
                return;
            }
            
            // Preview the file
            previewContainer.innerHTML = '';
            previewContainer.style.display = 'block';
            
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.classList.add('file-preview');
                img.file = file;
                previewContainer.appendChild(img);
                
                const reader = new FileReader();
                reader.onload = (function(aImg) { 
                    return function(e) { 
                        aImg.src = e.target.result; 
                    }; 
                })(img);
                reader.readAsDataURL(file);
            } else {
                // For PDF or other non-image files
                const fileInfo = document.createElement('div');
                fileInfo.classList.add('file-info');
                fileInfo.innerHTML = `
                    <i class="fas fa-file-pdf"></i>
                    <span>${file.name}</span>
                    <span>(${Math.round(file.size / 1024)} KB)</span>
                `;
                previewContainer.appendChild(fileInfo);
            }
        });
    }
});