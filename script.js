document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const previewFrame = document.getElementById('preview-frame');
    const runBtn = document.getElementById('run-btn');
    const saveBtn = document.getElementById('save-btn');
    
    // Tab bars
    const projectTabBar = document.querySelector('.project-tab-bar');
    const folderTabBar = document.querySelector('.folder-tab-bar');
    const fileTabBar = document.querySelector('.file-tab-bar');
    
    // File explorer
    const projectStructure = document.getElementById('project-structure');
    
    // Modals
    const newProjectModal = document.getElementById('new-project-modal');
    const newFolderModal = document.getElementById('new-folder-modal');
    const newFileModal = document.getElementById('new-file-modal');
    
    // Modal buttons
    const addProjectBtn = document.getElementById('add-project');
    const addFolderBtn = document.getElementById('add-folder');
    const addFileBtn = document.getElementById('add-file');
    
    const cancelProjectBtn = document.getElementById('cancel-project');
    const createProjectBtn = document.getElementById('create-project');
    
    const cancelFolderBtn = document.getElementById('cancel-folder');
    const createFolderBtn = document.getElementById('create-folder');
    
    const cancelFileBtn = document.getElementById('cancel-file');
    const createFileBtn = document.getElementById('create-file');
    
    // State
    let currentProject = 'project-1';
    let currentFolder = 'folder-1';
    let currentFile = 'file-1';
    
    // Sample data structure
    const projects = {
        'project-1': {
            name: 'Project 1',
            folders: {
                'folder-1': {
                    name: 'Main',
                    files: {
                        'file-1': {
                            name: 'index.html',
                            type: 'html',
                            content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Project</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is a real-time code compiler.</p>\n    <script src="script.js"></script>\n</body>\n</html>'
                        },
                        'file-2': {
                            name: 'styles.css',
                            type: 'css',
                            content: 'body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\nh1 {\n    color: #3498db;\n}'
                        },
                        'file-3': {
                            name: 'script.js',
                            type: 'js',
                            content: 'console.log("Hello from JavaScript!");\n\ndocument.querySelector("h1").addEventListener("click", function() {\n    this.style.color = "#e74c3c";\n});'
                        }
                    }
                }
            }
        }
    };
    
    // Initialize the editor
    function initEditor() {
        updateFileExplorer();
        loadFile(currentFile);
        updatePreview();
    }
    
    // Update file explorer based on current state
    function updateFileExplorer() {
        projectStructure.innerHTML = '';
        
        const currentProjectData = projects[currentProject];
        
        for (const folderId in currentProjectData.folders) {
            const folder = currentProjectData.folders[folderId];
            const isActive = folderId === currentFolder;
            
            const folderLi = document.createElement('li');
            folderLi.className = `folder ${isActive ? 'active' : ''}`;
            folderLi.dataset.id = folderId;
            
            const folderSpan = document.createElement('span');
            folderSpan.innerHTML = `<i class="fas fa-folder"></i> ${folder.name}`;
            
            folderLi.appendChild(folderSpan);
            
            const fileUl = document.createElement('ul');
            
            for (const fileId in folder.files) {
                const file = folder.files[fileId];
                const isFileActive = fileId === currentFile;
                
                const fileLi = document.createElement('li');
                fileLi.className = `file ${isFileActive ? 'active' : ''}`;
                fileLi.dataset.id = fileId;
                fileLi.innerHTML = `<i class="fas fa-file-code"></i> ${file.name}`;
                
                fileUl.appendChild(fileLi);
            }
            
            folderLi.appendChild(fileUl);
            projectStructure.appendChild(folderLi);
        }
    }
    
    // Load file content into editor
    function loadFile(fileId) {
        const file = getFileById(fileId);
        if (file) {
            editor.value = file.content;
            
            // Set editor mode based on file type
            editor.className = '';
            editor.classList.add(file.type);
        }
    }
    
    // Get file by ID
    function getFileById(fileId) {
        const currentProjectData = projects[currentProject];
        for (const folderId in currentProjectData.folders) {
            const folder = currentProjectData.folders[folderId];
            if (folder.files[fileId]) {
                return folder.files[fileId];
            }
        }
        return null;
    }
    
    // Update preview frame
    function updatePreview() {
        const currentProjectData = projects[currentProject];
        let html = '';
        let css = '';
        let js = '';
        
        // Collect all files
        for (const folderId in currentProjectData.folders) {
            const folder = currentProjectData.folders[folderId];
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
    
    // Save current editor content to file
    function saveCurrentFile() {
        const file = getFileById(currentFile);
        if (file) {
            file.content = editor.value;
            updatePreview();
        }
    }
    
    // Tab switching
    function switchTab(tabType, tabId) {
        if (tabType === 'project') {
            currentProject = tabId;
            // Reset folder and file to first available
            const projectData = projects[currentProject];
            const firstFolderId = Object.keys(projectData.folders)[0];
            if (firstFolderId) {
                currentFolder = firstFolderId;
                const folderData = projectData.folders[firstFolderId];
                const firstFileId = Object.keys(folderData.files)[0];
                if (firstFileId) {
                    currentFile = firstFileId;
                }
            }
        } else if (tabType === 'folder') {
            currentFolder = tabId;
            // Reset file to first available in folder
            const folderData = projects[currentProject].folders[currentFolder];
            const firstFileId = Object.keys(folderData.files)[0];
            if (firstFileId) {
                currentFile = firstFileId;
            }
        } else if (tabType === 'file') {
            currentFile = tabId;
        }
        
        // Update UI
        updateActiveTabs();
        updateFileExplorer();
        loadFile(currentFile);
    }
    
    // Update active tabs in all tab bars
    function updateActiveTabs() {
        // Project tabs
        document.querySelectorAll('.project-tab-bar .tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.id === currentProject);
        });
        
        // Folder tabs
        document.querySelectorAll('.folder-tab-bar .tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.id === currentFolder);
        });
        
        // File tabs
        document.querySelectorAll('.file-tab-bar .tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.id === currentFile);
        });
    }
    
    // Add a new project
    function addProject(name) {
        const projectId = 'project-' + Date.now();
        projects[projectId] = {
            name: name,
            folders: {
                'folder-' + Date.now(): {
                    name: 'Main',
                    files: {
                        'file-' + Date.now(): {
                            name: 'index.html',
                            type: 'html',
                            content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>New Project</title>\n</head>\n<body>\n    <h1>New Project</h1>\n</body>\n</html>'
                        }
                    }
                }
            }
        };
        
        // Create tab
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.id = projectId;
        tab.innerHTML = `<span>${name}</span><button class="close-btn"><i class="fas fa-times"></i></button>`;
        projectTabBar.insertBefore(tab, addProjectBtn);
        
        // Switch to new project
        switchTab('project', projectId);
    }
    
    // Add a new folder
    function addFolder(name) {
        const folderId = 'folder-' + Date.now();
        projects[currentProject].folders[folderId] = {
            name: name,
            files: {
                'file-' + Date.now(): {
                    name: 'index.html',
                    type: 'html',
                    content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>New Folder</title>\n</head>\n<body>\n    <h1>New Folder</h1>\n</body>\n</html>'
                }
            }
        };
        
        // Create tab
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.id = folderId;
        tab.innerHTML = `<span>${name}</span><button class="close-btn"><i class="fas fa-times"></i></button>`;
        folderTabBar.insertBefore(tab, addFolderBtn);
        
        // Switch to new folder
        switchTab('folder', folderId);
    }
    
    // Add a new file
    function addFile(name, type) {
        const fileId = 'file-' + Date.now();
        const extension = type === 'html' ? '.html' : type === 'css' ? '.css' : '.js';
        const fullName = name.endsWith(extension) ? name : name + extension;
        
        projects[currentProject].folders[currentFolder].files[fileId] = {
            name: fullName,
            type: type,
            content: type === 'html' ? 
                '<!DOCTYPE html>\n<html>\n<head>\n    <title>New HTML File</title>\n</head>\n<body>\n    \n</body>\n</html>' :
                type === 'css' ?
                '/* New CSS File */' :
                '// New JavaScript File'
        };
        
        // Create tab
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.id = fileId;
        tab.innerHTML = `<span>${fullName}</span><button class="close-btn"><i class="fas fa-times"></i></button>`;
        fileTabBar.insertBefore(tab, addFileBtn);
        
        // Switch to new file
        switchTab('file', fileId);
    }
    
    // Delete a project
    function deleteProject(projectId) {
        if (Object.keys(projects).length <= 1) return; // Don't delete the last project
        
        delete projects[projectId];
        
        // Find and remove tab
        const tab = document.querySelector(`.project-tab-bar .tab[data-id="${projectId}"]`);
        if (tab) tab.remove();
        
        // Switch to another project
        const remainingProjectId = Object.keys(projects)[0];
        if (remainingProjectId) {
            switchTab('project', remainingProjectId);
        }
    }
    
    // Delete a folder
    function deleteFolder(folderId) {
        const projectData = projects[currentProject];
        if (Object.keys(projectData.folders).length <= 1) return; // Don't delete the last folder
        
        delete projectData.folders[folderId];
        
        // Find and remove tab
        const tab = document.querySelector(`.folder-tab-bar .tab[data-id="${folderId}"]`);
        if (tab) tab.remove();
        
        // Switch to another folder
        const remainingFolderId = Object.keys(projectData.folders)[0];
        if (remainingFolderId) {
            switchTab('folder', remainingFolderId);
        }
    }
    
    // Delete a file
    function deleteFile(fileId) {
        const folderData = projects[currentProject].folders[currentFolder];
        if (Object.keys(folderData.files).length <= 1) return; // Don't delete the last file
        
        delete folderData.files[fileId];
        
        // Find and remove tab
        const tab = document.querySelector(`.file-tab-bar .tab[data-id="${fileId}"]`);
        if (tab) tab.remove();
        
        // Switch to another file
        const remainingFileId = Object.keys(folderData.files)[0];
        if (remainingFileId) {
            switchTab('file', remainingFileId);
        }
    }
    
    // Event Listeners
    
    // Run button
    runBtn.addEventListener('click', updatePreview);
    
    // Save button
    saveBtn.addEventListener('click', saveCurrentFile);
    
    // Editor content change
    editor.addEventListener('input', function() {
        // Auto-save after a delay
        clearTimeout(editor.saveTimeout);
        editor.saveTimeout = setTimeout(saveCurrentFile, 1000);
    });
    
    // Tab clicks
    projectTabBar.addEventListener('click', function(e) {
        const tab = e.target.closest('.tab');
        if (tab) {
            switchTab('project', tab.dataset.id);
        }
        
        const closeBtn = e.target.closest('.close-btn');
        if (closeBtn) {
            e.stopPropagation();
            deleteProject(closeBtn.closest('.tab').dataset.id);
        }
    });
    
    folderTabBar.addEventListener('click', function(e) {
        const tab = e.target.closest('.tab');
        if (tab) {
            switchTab('folder', tab.dataset.id);
        }
        
        const closeBtn = e.target.closest('.close-btn');
        if (closeBtn) {
            e.stopPropagation();
            deleteFolder(closeBtn.closest('.tab').dataset.id);
        }
    });
    
    fileTabBar.addEventListener('click', function(e) {
        const tab = e.target.closest('.tab');
        if (tab) {
            switchTab('file', tab.dataset.id);
        }
        
        const closeBtn = e.target.closest('.close-btn');
        if (closeBtn) {
            e.stopPropagation();
            deleteFile(closeBtn.closest('.tab').dataset.id);
        }
    });
    
    // File explorer clicks
    projectStructure.addEventListener('click', function(e) {
        const folder = e.target.closest('.folder');
        if (folder) {
            switchTab('folder', folder.dataset.id);
        }
        
        const file = e.target.closest('.file');
        if (file) {
            switchTab('file', file.dataset.id);
        }
    });
    
    // Add buttons
    addProjectBtn.addEventListener('click', function() {
        document.getElementById('project-name').value = '';
        newProjectModal.style.display = 'flex';
    });
    
    addFolderBtn.addEventListener('click', function() {
        document.getElementById('folder-name').value = '';
        newFolderModal.style.display = 'flex';
    });
    
    addFileBtn.addEventListener('click', function() {
        document.getElementById('file-name').value = '';
        newFileModal.style.display = 'flex';
    });
    
    // Modal buttons
    cancelProjectBtn.addEventListener('click', function() {
        newProjectModal.style.display = 'none';
    });
    
    createProjectBtn.addEventListener('click', function() {
        const name = document.getElementById('project-name').value.trim();
        if (name) {
            addProject(name);
            newProjectModal.style.display = 'none';
        }
    });
    
    cancelFolderBtn.addEventListener('click', function() {
        newFolderModal.style.display = 'none';
    });
    
    createFolderBtn.addEventListener('click', function() {
        const name = document.getElementById('folder-name').value.trim();
        if (name) {
            addFolder(name);
            newFolderModal.style.display = 'none';
        }
    });
    
    cancelFileBtn.addEventListener('click', function() {
        newFileModal.style.display = 'none';
    });
    
    createFileBtn.addEventListener('click', function() {
        const name = document.getElementById('file-name').value.trim();
        const type = document.getElementById('file-type').value;
        if (name) {
            addFile(name, type);
            newFileModal.style.display = 'none';
        }
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
    initEditor();
});
