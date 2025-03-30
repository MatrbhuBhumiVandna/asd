document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const previewFrame = document.getElementById('preview-frame');
    const runBtn = document.getElementById('run-btn');
    const saveBtn = document.getElementById('save-btn');
    const fileTree = document.getElementById('project-structure');
    const editorTabs = document.querySelector('.editor-tabs');
    
    // Add buttons
    const addProjectBtn = document.getElementById('add-project');
    const addFolderBtn = document.getElementById('add-folder');
    const addFileBtn = document.getElementById('add-file');
    
    // Modals
    const newProjectModal = document.getElementById('new-project-modal');
    const newFolderModal = document.getElementById('new-folder-modal');
    const newFileModal = document.getElementById('new-file-modal');
    
    // Modal buttons
    const cancelProjectBtn = document.getElementById('cancel-project');
    const createProjectBtn = document.getElementById('create-project');
    const cancelFolderBtn = document.getElementById('cancel-folder');
    const createFolderBtn = document.getElementById('create-folder');
    const cancelFileBtn = document.getElementById('cancel-file');
    const createFileBtn = document.getElementById('create-file');
    
    // State
    let currentProject = null;
    let currentFile = null;
    let projects = {};
    
    // Initialize the editor
    function init() {
        // Create a default project if none exists
        if (Object.keys(projects).length === 0) {
            createDefaultProject();
        }
        
        // Set the first project as current
        currentProject = Object.keys(projects)[0];
        
        // Render the file tree
        renderFileTree();
        
        // Open the first file
        openFirstFile();
    }
    
    // Create a default project with sample files
    function createDefaultProject() {
        const projectId = 'project-' + Date.now();
        const folderId = 'folder-' + Date.now();
        const htmlFileId = 'file-' + Date.now();
        const cssFileId = 'file-' + (Date.now() + 1);
        const jsFileId = 'file-' + (Date.now() + 2);
        
        projects[projectId] = {
            name: 'My Project',
            folders: {
                [folderId]: {
                    name: 'Main',
                    files: {
                        [htmlFileId]: {
                            name: 'index.html',
                            type: 'html',
                            content: `<!DOCTYPE html>
<html>
<head>
    <title>My Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to CodeCraft!</h1>
    <p>Edit this file to see real-time changes.</p>
    <button id="demo-btn">Click Me</button>
    <script src="script.js"></script>
</body>
</html>`
                        },
                        [cssFileId]: {
                            name: 'styles.css',
                            type: 'css',
                            content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
    color: #333;
}

h1 {
    color: #4361ee;
}

#demo-btn {
    background-color: #4361ee;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
}

#demo-btn:hover {
    background-color: #3a56d4;
}`
                        },
                        [jsFileId]: {
                            name: 'script.js',
                            type: 'js',
                            content: `document.getElementById('demo-btn').addEventListener('click', function() {
    alert('Button clicked!');
    this.textContent = 'Clicked!';
});`
                        }
                    }
                }
            }
        };
    }
    
    // Render the file tree
    function renderFileTree() {
        fileTree.innerHTML = '';
        
        const project = projects[currentProject];
        if (!project) return;
        
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            
            const folderItem = document.createElement('li');
            folderItem.className = 'folder';
            folderItem.dataset.id = folderId;
            folderItem.innerHTML = `
                <span><i class="fas fa-folder"></i> ${folder.name}</span>
            `;
            
            const fileList = document.createElement('ul');
            
            for (const fileId in folder.files) {
                const file = folder.files[fileId];
                
                const fileItem = document.createElement('li');
                fileItem.className = 'file';
                fileItem.dataset.id = fileId;
                fileItem.innerHTML = `
                    <i class="fas fa-file-code"></i> ${file.name}
                `;
                
                fileItem.addEventListener('click', () => openFile(fileId));
                
                fileList.appendChild(fileItem);
            }
            
            folderItem.appendChild(fileList);
            fileTree.appendChild(folderItem);
        }
    }
    
    // Open the first available file
    function openFirstFile() {
        const project = projects[currentProject];
        if (!project) return;
        
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            const fileIds = Object.keys(folder.files);
            
            if (fileIds.length > 0) {
                openFile(fileIds[0]);
                break;
            }
        }
    }
    
    // Open a file in the editor
    function openFile(fileId) {
        const file = findFileById(fileId);
        if (!file) return;
        
        currentFile = fileId;
        
        // Update active state in file tree
        document.querySelectorAll('.file-tree .file').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`.file-tree .file[data-id="${fileId}"]`)?.classList.add('active');
        
        // Update or create tab
        let tab = document.querySelector(`.editor-tab[data-id="${fileId}"]`);
        if (!tab) {
            tab = document.createElement('div');
            tab.className = 'editor-tab';
            tab.dataset.id = fileId;
            tab.innerHTML = `
                <i class="fas fa-file-code"></i>
                ${file.name}
                <button class="close-btn"><i class="fas fa-times"></i></button>
            `;
            
            tab.addEventListener('click', () => openFile(fileId));
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeFile(fileId);
            });
            
            editorTabs.appendChild(tab);
        }
        
        // Update active tab
        document.querySelectorAll('.editor-tab').forEach(el => {
            el.classList.remove('active');
        });
        tab.classList.add('active');
        
        // Load file content
        editor.value = file.content;
    }
    
    // Close a file
    function closeFile(fileId) {
        // Don't close the last file
        if (document.querySelectorAll('.editor-tab').length <= 1) return;
        
        // Remove tab
        const tab = document.querySelector(`.editor-tab[data-id="${fileId}"]`);
        if (tab) tab.remove();
        
        // If closing the current file, open another one
        if (fileId === currentFile) {
            const remainingTab = document.querySelector('.editor-tab');
            if (remainingTab) {
                openFile(remainingTab.dataset.id);
            } else {
                currentFile = null;
                editor.value = '';
            }
        }
    }
    
    // Find a file by ID
    function findFileById(fileId) {
        const project = projects[currentProject];
        if (!project) return null;
        
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            if (folder.files[fileId]) {
                return folder.files[fileId];
            }
        }
        
        return null;
    }
    
    // Save the current file
    function saveFile() {
        if (!currentFile) return;
        
        const file = findFileById(currentFile);
        if (file) {
            file.content = editor.value;
        }
    }
    
    // Update the preview
    function updatePreview() {
        saveFile();
        
        const project = projects[currentProject];
        if (!project) return;
        
        let html = '';
        let css = '';
        let js = '';
        
        // Collect all files
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            for (const fileId in folder.files) {
                const file = folder.files[fileId];
                if (file.type === 'html') {
                    html = file.content;
                } else if (file.type === 'css') {
                    css = file.content;
                } else if (file.type === 'js') {
                    js = file.content;
                }
            }
        }
        
        // Combine into a complete HTML document
        const combinedHtml = html.replace('</head>', `<style>${css}</style></head>`)
                               .replace('</body>', `<script>${js}</script></body>`);
        
        // Update preview frame
        previewFrame.srcdoc = combinedHtml;
    }
    
    // Add a new project
    function addProject(name) {
        const projectId = 'project-' + Date.now();
        const folderId = 'folder-' + Date.now();
        const fileId = 'file-' + Date.now();
        
        projects[projectId] = {
            name: name,
            folders: {
                [folderId]: {
                    name: 'Main',
                    files: {
                        [fileId]: {
                            name: 'index.html',
                            type: 'html',
                            content: `<!DOCTYPE html>
<html>
<head>
    <title>${name}</title>
</head>
<body>
    <h1>${name}</h1>
    <p>Start coding here!</p>
</body>
</html>`
                        }
                    }
                }
            }
        };
        
        // Switch to the new project
        currentProject = projectId;
        renderFileTree();
        openFirstFile();
    }
    
    // Add a new folder
    function addFolder(name) {
        const folderId = 'folder-' + Date.now();
        const fileId = 'file-' + Date.now();
        
        projects[currentProject].folders[folderId] = {
            name: name,
            files: {
                [fileId]: {
                    name: 'index.html',
                    type: 'html',
                    content: `<!DOCTYPE html>
<html>
<head>
    <title>New Folder</title>
</head>
<body>
    <h1>${name}</h1>
</body>
</html>`
                }
            }
        };
        
        renderFileTree();
    }
    
    // Add a new file
    function addFile(name, type) {
        const extension = type === 'html' ? '.html' : type === 'css' ? '.css' : '.js';
        const fullName = name.endsWith(extension) ? name : name + extension;
        
        // Find the first folder to add the file to
        const project = projects[currentProject];
        const folderId = Object.keys(project.folders)[0];
        if (!folderId) return;
        
        const fileId = 'file-' + Date.now();
        
        project.folders[folderId].files[fileId] = {
            name: fullName,
            type: type,
            content: type === 'html' ? 
                `<!DOCTYPE html>
<html>
<head>
    <title>New HTML File</title>
</head>
<body>
    
</body>
</html>` :
                type === 'css' ?
                `/* ${fullName} */` :
                `// ${fullName}`
        };
        
        renderFileTree();
        openFile(fileId);
    }
    
    // Event Listeners
    
    // Run button
    runBtn.addEventListener('click', updatePreview);
    
    // Save button
    saveBtn.addEventListener('click', saveFile);
    
    // Auto-save when editor content changes
    editor.addEventListener('input', function() {
        // Auto-save after a delay
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(saveFile, 1000);
    });
    
    // Add project button
    addProjectBtn.addEventListener('click', function() {
        document.getElementById('project-name').value = '';
        newProjectModal.style.display = 'flex';
    });
    
    // Add folder button
    addFolderBtn.addEventListener('click', function() {
        document.getElementById('folder-name').value = '';
        newFolderModal.style.display = 'flex';
    });
    
    // Add file button
    addFileBtn.addEventListener('click', function() {
        document.getElementById('file-name').value = '';
        newFileModal.style.display = 'flex';
    });
    
    // Create project
    createProjectBtn.addEventListener('click', function() {
        const name = document.getElementById('project-name').value.trim();
        if (name) {
            addProject(name);
            newProjectModal.style.display = 'none';
        }
    });
    
    // Create folder
    createFolderBtn.addEventListener('click', function() {
        const name = document.getElementById('folder-name').value.trim();
        if (name) {
            addFolder(name);
            newFolderModal.style.display = 'none';
        }
    });
    
    // Create file
    createFileBtn.addEventListener('click', function() {
        const name = document.getElementById('file-name').value.trim();
        const type = document.getElementById('file-type').value;
        if (name) {
            addFile(name, type);
            newFileModal.style.display = 'none';
        }
    });
    
    // Cancel buttons
    cancelProjectBtn.addEventListener('click', function() {
        newProjectModal.style.display = 'none';
    });
    
    cancelFolderBtn.addEventListener('click', function() {
        newFolderModal.style.display = 'none';
    });
    
    cancelFileBtn.addEventListener('click', function() {
        newFileModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === newProjectModal) {
            newProjectModal.style.display = 'none';
        }
        if (e.target === newFolderModal) {
            newFolderModal.style.display = 'none';
        }
        if (e.target === newFileModal) {
            newFileModal.style.display = 'none';
        }
    });
    
    // Initialize the editor
    init();
});
