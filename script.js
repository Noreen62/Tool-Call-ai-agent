document.addEventListener('DOMContentLoaded', function() {
    initInterface();
    loadToolsUI();
    updateStats();
});

function initInterface() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-message');

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !sendBtn.disabled) {
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    // Tool modal
    document.querySelector('.tools-panel h3').addEventListener('click', () => {
        document.getElementById('tools-modal').style.display = 'block';
    });

    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('tools-modal').style.display = 'none';
    });
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    const sendBtn = document.getElementById('send-message');
    const statusEl = document.getElementById('agent-status');

    // Add user message
    addMessage('user', message);
    input.value = '';

    // Disable input
    sendBtn.disabled = true;
    input.disabled = true;
    statusEl.innerHTML = '<i class="fas fa-cogs fa-spin"></i> Calling tools...';

    try {
        const response = await window.ToolAgent.processMessage(message);
        addMessage('agent', response.finalAnswer);
        
        // Update JSON response
        document.getElementById('json-response').textContent = 
            JSON.stringify(response, null, 2);
        
        // Log execution
        logExecution(response);
        
        // Update stats
        updateStats();
        
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Tools executed successfully';
        
    } catch (error) {
        addMessage('agent', `❌ Error: ${error.message}`);
        logExecution({ error: error.message });
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error occurred';
    } finally {
        sendBtn.disabled = false;
        input.disabled = false;
        setTimeout(() => {
            statusEl.innerHTML = '<i class="fas fa-circle"></i> Ready to call tools';
        }, 2000);
    }
}

function addMessage(sender, content) {
    const messages = document.getElementById('chat-messages');
    const messageClass = sender === 'user' ? 'user' : 'agent';
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageClass}`;
    messageDiv.innerHTML = content;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function logExecution(response) {
    const logContainer = document.getElementById('execution-log');
    const logEntry = document.createElement('div');
    
    if (response.results) {
        logEntry.className = 'log-entry tool-call';
        logEntry.innerHTML = `
            <strong>🔌 Tool Calls:</strong> ${response.toolCalls}<br>
            <strong>⏱️ Avg Time:</strong> ${response.avgExecutionTime}ms<br>
            <strong>✅ Success:</strong> ${response.successRate}%
        `;
    } else {
        logEntry.className = 'log-entry error';
        logEntry.innerHTML = `<strong>❌ Error:</strong> ${response.error}`;
    }
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function loadToolsUI() {
    const toolsList = document.getElementById('tools-list');
    toolsList.innerHTML = window.ToolRegistry.tools.map(tool => `
        <div class="tool-item" onclick="testTool('${tool.name}')">
            <i class="fas fa-${getToolIcon(tool.name)} tool-icon"></i>
            <div class="tool-name">${tool.name}</div>
            <div class="tool-desc">${tool.description}</div>
        </div>
    `).join('');

    // Load schema in modal
    document.getElementById('tools-schema').textContent = 
        JSON.stringify(window.ToolRegistry.tools, null, 2);
}

function getToolIcon(toolName) {
    const icons = {
        'get_weather': 'cloud-sun',
        'calculate': 'calculator',
        'get_stock_price': 'chart-line',
        'send_email': 'envelope',
        'search_web': 'search'
    };
    return icons[toolName] || 'cogs';
}

window.testTool = function(toolName) {
    const testInputs = {
        'get_weather': 'Get weather in Mumbai',
        'calculate': 'Calculate 25% of 400',
        'get_stock_price': 'Get AAPL stock price',
        'send_email': 'Send email about project update',
        'search_web': 'Search for AI trends 2024'
    };
    
    document.getElementById('user-input').value = testInputs[toolName] || 'Test tool';
    sendMessage();
};

function updateStats() {
    const stats = window.ToolAgent.getStats();
    document.getElementById('tool-calls').textContent = stats.toolCalls;
    document.getElementById('success-rate').textContent = stats.successRate;
    document.getElementById('avg-time').textContent = stats.avgTime + 'ms';
}

// Initialize
updateStats();
loadToolsUI();