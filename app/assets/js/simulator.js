// Handle dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
    document.getElementById('light-icon').style.display = 'block';
    document.getElementById('dark-icon').style.display = 'none';
} else {
    document.getElementById('light-icon').style.display = 'none';
    document.getElementById('dark-icon').style.display = 'block';
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
        document.getElementById('light-icon').style.display = 'block';
        document.getElementById('dark-icon').style.display = 'none';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('light-icon').style.display = 'none';
        document.getElementById('dark-icon').style.display = 'block';
    }
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    
    if (document.documentElement.classList.contains('dark')) {
        document.getElementById('light-icon').style.display = 'block';
        document.getElementById('dark-icon').style.display = 'none';
    } else {
        document.getElementById('light-icon').style.display = 'none';
        document.getElementById('dark-icon').style.display = 'block';
    }
});

// Terminal functionality
document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal-output');
    const commandInput = document.getElementById('command-input');
    const promptElement = document.getElementById('prompt');
    
    // Virtual file system
    const fileSystem = {
        '/': {
            type: 'directory',
            children: {
                'home': {
                    type: 'directory',
                    children: {
                        'user': {
                            type: 'directory',
                            children: {
                                'documents': {
                                    type: 'directory',
                                    children: {
                                        'readme.txt': {
                                            type: 'file',
                                            content: 'Welcome to the Linux Terminal Simulator!\nThis is a basic simulation of a Linux bash terminal environment.\nType "help" to see available commands.'
                                        }
                                    }
                                },
                                'pictures': {
                                    type: 'directory',
                                    children: {}
                                },
                                'hello.sh': {
                                    type: 'file',
                                    executable: true,
                                    content: 'echo "Hello, World!"'
                                }
                            }
                        }
                    }
                },
                'bin': {
                    type: 'directory',
                    children: {
                        'ls': { type: 'file', executable: true },
                        'cat': { type: 'file', executable: true },
                        'echo': { type: 'file', executable: true }
                    }
                },
                'etc': {
                    type: 'directory',
                    children: {
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1 localhost\n::1 localhost'
                        }
                    }
                }
            }
        }
    };
    
    // Current state
    let currentPath = '/home/user';
    let commandHistory = [];
    let historyIndex = -1;
    let tempCommand = '';
    let username = 'user';
    let hostname = 'terminal';
    
    // Helper functions
    function getPathObject(path) {
        if (path === '/') return fileSystem['/'];
        
        const parts = path.split('/').filter(Boolean);
        let current = fileSystem['/'];
        
        for (const part of parts) {
            if (part === '..') {
                // Move up one directory in path tracking
                parts.splice(parts.indexOf(part) - 1, 2);
                return getPathObject('/' + parts.join('/'));
            } else if (part === '.') {
                continue;
            } else if (!current.children || !current.children[part]) {
                return null;
            } else {
                current = current.children[part];
            }
        }
        
        return current;
    }
    
    function resolvePath(path) {
        if (path.startsWith('/')) {
            return path;
        }
        
        if (currentPath === '/') {
            return '/' + path;
        }
        
        return currentPath + '/' + path;
    }
    
    function normalizePath(path) {
        const parts = path.split('/').filter(Boolean);
        const resultParts = [];
        
        for (const part of parts) {
            if (part === '..') {
                resultParts.pop();
            } else if (part !== '.') {
                resultParts.push(part);
            }
        }
        
        return '/' + resultParts.join('/');
    }
    
    function getParentPath(path) {
        const normalized = normalizePath(path);
        const lastSlashIndex = normalized.lastIndexOf('/');
        
        if (lastSlashIndex <= 0) {
            return '/';
        }
        
        return normalized.substring(0, lastSlashIndex);
    }
    
    function getFileName(path) {
        const parts = path.split('/').filter(Boolean);
        return parts[parts.length - 1];
    }
    
    function getDirectoryContents(path) {
        const obj = getPathObject(path);
        if (!obj || obj.type !== 'directory') return null;
        
        return Object.entries(obj.children || {}).map(([name, item]) => ({
            name,
            type: item.type,
            executable: item.executable || false
        }));
    }
    
    // Update prompt
    function updatePrompt() {
        let displayPath = currentPath;
        if (displayPath.startsWith('/home/' + username)) {
            displayPath = '~' + displayPath.substring(('/home/' + username).length);
            if (displayPath === '~') displayPath = '~/';
        }
        promptElement.textContent = `${username}@${hostname}:${displayPath}$ `;
    }
    
    // Terminal output functions
    function printOutput(text, className = '') {
        const output = document.createElement('div');
        if (className) output.className = className;
        output.textContent = text;
        terminal.appendChild(output);
        terminal.scrollTop = terminal.scrollHeight;
    }
    
    function printPromptWithCommand(command) {
        const output = document.createElement('div');
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = promptElement.textContent;
        
        const commandSpan = document.createElement('span');
        commandSpan.textContent = command;
        
        output.appendChild(promptSpan);
        output.appendChild(commandSpan);
        terminal.appendChild(output);
        terminal.scrollTop = terminal.scrollHeight;
    }
    
    function printError(text) {
        printOutput(text, 'error');
    }
    
    // Command implementation
    const commands = {
        help: {
            execute: (args) => {
                printOutput('Available commands:');
                printOutput('  cd [dir]           - Change directory');
                printOutput('  ls [dir]           - List directory contents');
                printOutput('  pwd                - Print working directory');
                printOutput('  mkdir <dir>        - Create directory');
                printOutput('  touch <file>       - Create empty file');
                printOutput('  cat <file>         - Display file contents');
                printOutput('  rm <file/dir>      - Remove file or directory');
                printOutput('  echo <text>        - Print text');
                printOutput('  clear              - Clear terminal');
                printOutput('  help               - Display this help');
                printOutput('  exit               - Exit terminal');
                printOutput('  whoami             - Display current user');
                printOutput('  hostname           - Display hostname');
                printOutput('  date               - Display current date');
            }
        },
        
        cd: {
            execute: (args) => {
                if (!args[0]) {
                    // Default to user's home directory
                    currentPath = `/home/${username}`;
                    updatePrompt();
                    return;
                }
                
                let targetPath = args[0];
                if (targetPath === '~') {
                    targetPath = `/home/${username}`;
                } else if (targetPath.startsWith('~/')) {
                    targetPath = `/home/${username}/${targetPath.substring(2)}`;
                } else {
                    targetPath = resolvePath(targetPath);
                }
                
                targetPath = normalizePath(targetPath);
                const targetObj = getPathObject(targetPath);
                
                if (!targetObj) {
                    printError(`cd: ${args[0]}: No such file or directory`);
                    return;
                }
                
                if (targetObj.type !== 'directory') {
                    printError(`cd: ${args[0]}: Not a directory`);
                    return;
                }
                
                currentPath = targetPath;
                updatePrompt();
            }
        },
        
        ls: {
            execute: (args) => {
                const options = args.filter(arg => arg.startsWith('-'));
                const paths = args.filter(arg => !arg.startsWith('-'));
                
                const showAll = options.some(opt => opt === '-a' || opt === '-la' || opt === '-al');
                const showLong = options.some(opt => opt === '-l' || opt === '-la' || opt === '-al');
                
                const targetPath = paths[0] ? resolvePath(paths[0]) : currentPath;
                const contents = getDirectoryContents(targetPath);
                
                if (contents === null) {
                    printError(`ls: cannot access '${paths[0]}': No such file or directory`);
                    return;
                }
                
                if (showAll) {
                    contents.unshift({ name: '.', type: 'directory' });
                    contents.unshift({ name: '..', type: 'directory' });
                }
                
                if (showLong) {
                    for (const item of contents) {
                        const permissions = item.type === 'directory' ? 'drwxr-xr-x' : (item.executable ? '-rwxr-xr-x' : '-rw-r--r--');
                        const dateStr = new Date().toLocaleString('en-US', { 
                            month: 'short', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        
                        let itemName = item.name;
                        let className = '';
                        if (item.type === 'directory') {
                            itemName = `<span class="directory">${itemName}/</span>`;
                            className = 'directory';
                        } else if (item.executable) {
                            itemName = `<span class="executable">${itemName}*</span>`;
                            className = 'executable';
                        } else {
                            itemName = `<span class="file">${itemName}</span>`;
                            className = 'file';
                        }
                        
                        const outputLine = document.createElement('div');
                        outputLine.innerHTML = `${permissions} ${username} ${username} 4096 ${dateStr} ${itemName}`;
                        terminal.appendChild(outputLine);
                    }
                } else {
                    const outputLine = document.createElement('div');
                    outputLine.className = 'files-container';
                    
                    for (const item of contents) {
                        const itemSpan = document.createElement('span');
                        if (item.type === 'directory') {
                            itemSpan.textContent = item.name + '/';
                            itemSpan.className = 'directory';
                        } else if (item.executable) {
                            itemSpan.textContent = item.name + '*';
                            itemSpan.className = 'executable';
                        } else {
                            itemSpan.textContent = item.name;
                            itemSpan.className = 'file';
                        }
                        outputLine.appendChild(itemSpan);
                    }
                    
                    terminal.appendChild(outputLine);
                }
                
                terminal.scrollTop = terminal.scrollHeight;
            }
        },
        
        pwd: {
            execute: (args) => {
                printOutput(currentPath);
            }
        },
        
        mkdir: {
            execute: (args) => {
                if (!args[0]) {
                    printError('mkdir: missing operand');
                    return;
                }
                
                const targetPath = resolvePath(args[0]);
                const parentPath = getParentPath(targetPath);
                const dirName = getFileName(targetPath);
                
                const parentObj = getPathObject(parentPath);
                
                if (!parentObj) {
                    printError(`mkdir: cannot create directory '${args[0]}': No such file or directory`);
                    return;
                }
                
                if (parentObj.type !== 'directory') {
                    printError(`mkdir: cannot create directory '${args[0]}': Not a directory`);
                    return;
                }
                
                if (!parentObj.children) {
                    parentObj.children = {};
                }
                
                if (parentObj.children[dirName]) {
                    printError(`mkdir: cannot create directory '${args[0]}': File exists`);
                    return;
                }
                
                parentObj.children[dirName] = {
                    type: 'directory',
                    children: {}
                };
            }
        },
        
        touch: {
            execute: (args) => {
                if (!args[0]) {
                    printError('touch: missing file operand');
                    return;
                }
                
                const targetPath = resolvePath(args[0]);
                const parentPath = getParentPath(targetPath);
                const fileName = getFileName(targetPath);
                
                const parentObj = getPathObject(parentPath);
                
                if (!parentObj) {
                    printError(`touch: cannot touch '${args[0]}': No such file or directory`);
                    return;
                }
                
                if (parentObj.type !== 'directory') {
                    printError(`touch: cannot touch '${args[0]}': Not a directory`);
                    return;
                }
                
                if (!parentObj.children) {
                    parentObj.children = {};
                }
                
                // If file already exists, touch just updates timestamp
                // Here we'll create it if it doesn't exist
                if (!parentObj.children[fileName]) {
                    parentObj.children[fileName] = {
                        type: 'file',
                        content: ''
                    };
                }
            }
        },
        
        cat: {
            execute: (args) => {
                if (!args[0]) {
                    printError('cat: missing file operand');
                    return;
                }
                
                const targetPath = resolvePath(args[0]);
                const targetObj = getPathObject(targetPath);
                
                if (!targetObj) {
                    printError(`cat: ${args[0]}: No such file or directory`);
                    return;
                }
                
                if (targetObj.type !== 'file') {
                    printError(`cat: ${args[0]}: Is a directory`);
                    return;
                }
                
                printOutput(targetObj.content || '');
            }
        },
        
        rm: {
            execute: (args) => {
                if (!args[0]) {
                    printError('rm: missing operand');
                    return;
                }
                
                const options = args.filter(arg => arg.startsWith('-'));
                const paths = args.filter(arg => !arg.startsWith('-'));
                
                const recursive = options.some(opt => opt === '-r' || opt === '-rf');
                
                if (!paths[0]) {
                    printError('rm: missing operand');
                    return;
                }
                
                const targetPath = resolvePath(paths[0]);
                const parentPath = getParentPath(targetPath);
                const fileName = getFileName(targetPath);
                
                const parentObj = getPathObject(parentPath);
                const targetObj = getPathObject(targetPath);
                
                if (!targetObj) {
                    printError(`rm: cannot remove '${paths[0]}': No such file or directory`);
                    return;
                }
                
                if (targetObj.type === 'directory' && !recursive) {
                    printError(`rm: cannot remove '${paths[0]}': Is a directory`);
                    return;
                }
                
                delete parentObj.children[fileName];
            }
        },
        
        echo: {
            execute: (args) => {
                const text = args.join(' ');
                printOutput(text);
            }
        },
        
        clear: {
            execute: (args) => {
                terminal.innerHTML = '';
            }
        },
        
        whoami: {
            execute: (args) => {
                printOutput(username);
            }
        },
        
        hostname: {
            execute: (args) => {
                printOutput(hostname);
            }
        },
        
        date: {
            execute: (args) => {
                const now = new Date();
                printOutput(now.toString());
            }
        },
        
        exit: {
            execute: (args) => {
                printOutput('Exiting terminal. Refresh the page to restart.');
                commandInput.contentEditable = false;
            }
        }
    };
    
    // Execute command
    function executeCommand(commandLine) {
        if (!commandLine.trim()) return;
        
        // Add to history
        commandHistory.push(commandLine);
        historyIndex = commandHistory.length;
        
        // Process command
        const parts = commandLine.trim().split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);
        
        if (command.startsWith('./')) {
            // Execute script
            const scriptPath = resolvePath(command.substring(2));
            const scriptObj = getPathObject(scriptPath);
            
            if (!scriptObj) {
                printError(`${command}: No such file or directory`);
            } else if (scriptObj.type !== 'file') {
                printError(`${command}: Is a directory`);
            } else if (!scriptObj.executable) {
                printError(`${command}: Permission denied`);
            } else {
                // Simple script execution - parse first command and execute
                const scriptLines = scriptObj.content.split('\n');
                for (const line of scriptLines) {
                    const scriptParts = line.trim().split(/\s+/);
                    const scriptCommand = scriptParts[0];
                    const scriptArgs = scriptParts.slice(1);
                    
                    if (commands[scriptCommand]) {
                        commands[scriptCommand].execute(scriptArgs);
                    }
                }
            }
        } else if (commands[command]) {
            commands[command].execute(args);
        } else {
            printError(`${command}: command not found`);
        }
    }
    
    // Initialize terminal
    updatePrompt();
    printOutput('Welcome to Linux Terminal Simulator');
    printOutput('Type "help" to see available commands.');
    printOutput('');
    
    // Handle input
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            const command = commandInput.textContent;
            printPromptWithCommand(command);
            executeCommand(command);
            
            commandInput.textContent = '';
            
            return false;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            
            if (historyIndex === commandHistory.length) {
                tempCommand = commandInput.textContent;
            }
            
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.textContent = commandHistory[historyIndex];
            }
            
            return false;
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.textContent = commandHistory[historyIndex];
            } else if (historyIndex === commandHistory.length - 1) {
                historyIndex++;
                commandInput.textContent = tempCommand;
            }
            
            return false;
        } else if (e.key === 'Tab') {
            e.preventDefault();
            
            // Simple tab completion
            const commandText = commandInput.textContent;
            const parts = commandText.split(/\s+/);
            
            if (parts.length === 1) {
                // Command completion
                const prefix = parts[0];
                const matchingCommands = Object.keys(commands).filter(cmd => cmd.startsWith(prefix));
                
                if (matchingCommands.length === 1) {
                    commandInput.textContent = matchingCommands[0] + ' ';
                }
            } else {
                // Path completion
                const lastPart = parts[parts.length - 1];
                
                // Check if the last part might be a path
                if (!lastPart.startsWith('-')) {
                    const lastSlashIndex = lastPart.lastIndexOf('/');
                    const searchPath = lastSlashIndex >= 0 
                        ? resolvePath(lastPart.substring(0, lastSlashIndex + 1))
                        : currentPath;
                    const searchPrefix = lastSlashIndex >= 0 
                        ? lastPart.substring(lastSlashIndex + 1)
                        : lastPart;
                    
                    const dirObj = getPathObject(searchPath);
                    
                    if (dirObj && dirObj.type === 'directory' && dirObj.children) {
                        const matches = Object.keys(dirObj.children)
                            .filter(name => name.startsWith(searchPrefix));
                        
                        if (matches.length === 1) {
                            const completion = matches[0];
                            const isDir = dirObj.children[completion].type === 'directory';
                            
                            const newLastPart = lastSlashIndex >= 0
                                ? lastPart.substring(0, lastSlashIndex + 1) + completion + (isDir ? '/' : '')
                                : completion + (isDir ? '/' : '');
                            
                            parts[parts.length - 1] = newLastPart;
                            commandInput.textContent = parts.join(' ');
                        }
                    }
                }
            }
            
            return false;
        }
    });
    
    // Focus input on terminal click
    document.getElementById('terminal').addEventListener('click', () => {
        if (commandInput.contentEditable === 'true') {
            commandInput.focus();
        }
    });
    
    // Initial focus
    commandInput.focus();
});