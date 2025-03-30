// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' }});
let editor;
let currentFile = null;
let files = {
    'index.html': {
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: '<!DOCTYPE html>\n<html>\n<head>\n\t<title>My Page</title>\n\t<link rel="stylesheet" href="style.css">\n</head>\n<body>\n\t<h1>Hello World!</h1>\n\t<script src="script.js"></script>\n</body>\n</html>'
    },
    'style.css': {
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: 'body { font-family: Arial; background-color: #f0f0f0; }'
    },
    'script.js': {
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: 'console.log("Hello from JS!");'
    },
    'index.php': {
        name: 'index.php',
        type: 'file',
        language: 'php',
        content: '<?php\n\techo "Hello from PHP!";\n?>'
    }
};

require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: files['index.html'].content,
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true
    });

    // Load file explorer
    renderFileExplorer();
    setActiveFile('index.html');

    // Watch for editor changes
    editor.onDidChangeModelContent(() => {
        if (currentFile) {
            files[currentFile].content = editor.getValue();
        }
    });
});

// File explorer functions
function renderFileExplorer() {
    const fileExplorer = document.getElementById('file-explorer');
    fileExplorer.innerHTML = '';
    
    Object.values(files).forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item';
        fileElement.innerHTML = `
            <i class="fas ${file.type === 'folder' ? 'fa-folder' : 'fa-file-code'}"></i>
            <span>${file.name}</span>
        `;
        
        fileElement.addEventListener('click', () => {
            setActiveFile(file.name);
        });
        
        fileExplorer.appendChild(fileElement);
    });
}

function setActiveFile(filename) {
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('span').textContent === filename) {
            item.classList.add('active');
        }
    });
    
    currentFile = filename;
    const file = files[filename];
    document.getElementById('language-selector').value = file.language;
    
    const model = monaco.editor.createModel(
        file.content,
        file.language
    );
    editor.setModel(model);
    
    // Update preview if it's an HTML file
    if (filename.endsWith('.html') {
        updatePreview();
    }
}

// Preview functions
function updatePreview() {
    if (!currentFile) return;
    
    const previewFrame = document.getElementById('preview-frame');
    const file = files[currentFile];
    
    if (file.language === 'html') {
        previewFrame.srcdoc = file.content;
    }
}

// Toolbar actions
document.getElementById('run-btn').addEventListener('click', updatePreview);
document.getElementById('refresh-preview').addEventListener('click', updatePreview);

document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(editor.getValue());
    alert('Code copied to clipboard!');
});

document.getElementById('language-selector').addEventListener('change', (e) => {
    if (currentFile) {
        files[currentFile].language = e.target.value;
        monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
    }
});

// File management
document.getElementById('new-file').addEventListener('click', () => {
    const fileName = prompt('Enter file name (include extension .html, .css, .js, .php):');
    if (fileName) {
        const extension = fileName.split('.').pop();
        let language = 'plaintext';
        
        if (['html', 'htm'].includes(extension)) language = 'html';
        else if (extension === 'css') language = 'css';
        else if (extension === 'js') language = 'javascript';
        else if (extension === 'php') language = 'php';
        
        files[fileName] = {
            name: fileName,
            type: 'file',
            language: language,
            content: extension === 'php' ? '<?php\n\n?>' : ''
        };
        
        renderFileExplorer();
        setActiveFile(fileName);
    }
});

document.getElementById('new-folder').addEventListener('click', () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        files[folderName] = {
            name: folderName,
            type: 'folder',
            items: []
        };
        renderFileExplorer();
    }
});
