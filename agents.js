class ToolCallingAgent {
    constructor() {
        this.toolCalls = 0;
        this.successfulCalls = 0;
        this.callTimes = [];
        this.conversationHistory = [];
    }

    async processMessage(userMessage) {
        this.conversationHistory.push({ role: 'user', content: userMessage });
        
        // Simulate AI reasoning to decide which tools to call
        const toolCalls = await this.decideTools(userMessage);
        
        const results = [];
        for (const toolCall of toolCalls) {
            const startTime = performance.now();
            try {
                const result = await window.ToolRegistry.execute(toolCall);
                const executionTime = performance.now() - startTime;
                
                this.successfulCalls++;
                this.callTimes.push(executionTime);
                
                results.push({
                    tool: toolCall.name,
                    arguments: toolCall.arguments,
                    result,
                    executionTime: Math.round(executionTime)
                });
            } catch (error) {
                results.push({
                    tool: toolCall.name,
                    arguments: toolCall.arguments,
                    error: error.message,
                    executionTime: 0
                });
            }
            this.toolCalls++;
        }

        // Generate final JSON response
        const response = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userMessage,
            toolCalls: toolCalls.length,
            results,
            successRate: Math.round((this.successfulCalls / this.toolCalls) * 100) || 100,
            avgExecutionTime: Math.round(this.callTimes.reduce((a,b)=>a+b,0)/this.callTimes.length) || 0,
            finalAnswer: this.generateFinalAnswer(results)
        };

        this.conversationHistory.push({ 
            role: 'assistant', 
            content: JSON.stringify(response, null, 2),
            tools: results 
        });

        return response;
    }

    async decideTools(message) {
        const lowerMessage = message.toLowerCase();
        const toolCalls = [];

        // Intelligent tool selection based on intent
        if (lowerMessage.includes('weather') || lowerMessage.includes('temperature')) {
            const cityMatch = message.match(/in\s+([A-Za-z\s]+)/i);
            toolCalls.push({
                name: 'get_weather',
                arguments: { city: cityMatch ? cityMatch[1].trim() : 'Delhi' }
            });
        }

        if (lowerMessage.includes('calculate') || lowerMessage.includes('%') || /\d+\s*[\+\-\*\/]\s*\d+/.test(message)) {
            const exprMatch = message.match(/calculate\s+(.+)/i) || message.match(/(\d+(?:\.\d+)?\s*[\+\-\*\/%]\s*\d+(?:\.\d+)?)/);
            toolCalls.push({
                name: 'calculate',
                arguments: { expression: exprMatch ? exprMatch[1] : '0' }
            });
        }

        if (lowerMessage.includes('stock') || lowerMessage.includes('price') || lowerMessage.match(/(AAPL|GOOGL|TSLA|MSFT)/i)) {
            const symbolMatch = message.match(/(AAPL|GOOGL|TSLA|MSFT|[A-Z]{2,5})/i);
            toolCalls.push({
                name: 'get_stock_price',
                arguments: { symbol: symbolMatch ? symbolMatch[1] : 'AAPL' }
            });
        }

        if (lowerMessage.includes('email') || lowerMessage.includes('send')) {
            toolCalls.push({
                name: 'send_email',
                arguments: {
                    to: 'team@company.com',
                    subject: `Update: ${message}`,
                    body: `Automated message regarding: ${message}`
                }
            });
        }

        if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
            const queryMatch = message.match(/search|find\s+(.+)/i);
            toolCalls.push({
                name: 'search_web',
                arguments: { query: queryMatch ? queryMatch[1] : message }
            });
        }

        // Default fallback
        if (toolCalls.length === 0) {
            toolCalls.push({
                name: 'search_web',
                arguments: { query: message }
            });
        }

        return toolCalls;
    }

    generateFinalAnswer(results) {
        if (results.length === 0) return "No tools were called.";
        
        const successResults = results.filter(r => r.result);
        if (successResults.length === 0) {
            return "All tool calls failed. Please check your request.";
        }

        // Intelligent summary
        let summary = `✅ Successfully executed ${successResults.length}/${results.length} tools:\n\n`;
        
        successResults.forEach((result, i) => {
            const toolResult = result.result;
            if (result.tool === 'get_weather') {
                summary += `🌤️ ${toolResult.city}: ${toolResult.temperature}°C, ${toolResult.condition}\n`;
            } else if (result.tool === 'calculate') {
                summary += `🧮 ${toolResult.expression} = ${toolResult.result}\n`;
            } else if (result.tool === 'get_stock_price') {
                summary += `📈 ${toolResult.symbol}: $${toolResult.price} (${toolResult.change > 0 ? '+' : ''}${toolResult.change.toFixed(2)})\n`;
            } else {
                summary += `✅ ${result.tool}: Success (${result.executionTime}ms)\n`;
            }
        });

        return summary;
    }

    getStats() {
        return {
            toolCalls: this.toolCalls,
            successRate: this.toolCalls > 0 ? Math.round((this.successfulCalls / this.toolCalls) * 100) : 100,
            avgTime: Math.round(this.callTimes.reduce((a,b)=>a+b,0)/this.callTimes.length) || 0
        };
    }
}

// Global Agent Instance
window.ToolAgent = new ToolCallingAgent();