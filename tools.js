// Tool Definitions with JSON Schema
window.ToolRegistry = {
    tools: [
        {
            name: "get_weather",
            description: "Get current weather for any city",
            parameters: {
                type: "object",
                properties: {
                    city: {
                        type: "string",
                        description: "City name"
                    }
                },
                required: ["city"]
            }
        },
        {
            name: "calculate",
            description: "Perform mathematical calculations",
            parameters: {
                type: "object",
                properties: {
                    expression: {
                        type: "string",
                        description: "Math expression like '25 * 4 + 10'"
                    }
                },
                required: ["expression"]
            }
        },
        {
            name: "get_stock_price",
            description: "Get current stock price for a symbol",
            parameters: {
                type: "object",
                properties: {
                    symbol: {
                        type: "string",
                        description: "Stock symbol (e.g., AAPL, GOOGL)"
                    }
                },
                required: ["symbol"]
            }
        },
        {
            name: "send_email",
            description: "Send an email",
            parameters: {
                type: "object",
                properties: {
                    to: { type: "string", description: "Recipient email" },
                    subject: { type: "string", description: "Email subject" },
                    body: { type: "string", description: "Email body" }
                },
                required: ["to", "subject", "body"]
            }
        },
        {
            name: "search_web",
            description: "Search the web for information",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Search query"
                    }
                },
                required: ["query"]
            }
        }
    ],

    // Tool Execution Functions
    execute: async function(toolCall) {
        const toolName = toolCall.name;
        const args = toolCall.arguments;
        
        try {
            switch(toolName) {
                case 'get_weather':
                    return await this.getWeather(args.city);
                case 'calculate':
                    return await this.calculate(args.expression);
                case 'get_stock_price':
                    return await this.getStockPrice(args.symbol);
                case 'send_email':
                    return await this.sendEmail(args);
                case 'search_web':
                    return await this.searchWeb(args.query);
                default:
                    throw new Error(`Unknown tool: ${toolName}`);
            }
        } catch (error) {
            throw new Error(`Tool execution failed: ${error.message}`);
        }
    },

    // Mock Tool Implementations
    async getWeather(city) {
        await this.delay(800);
        return {
            city,
            temperature: Math.floor(15 + Math.random() * 25),
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(40 + Math.random() * 40)
        };
    },

    async calculate(expression) {
        await this.delay(400);
        try {
            const result = Function('"use strict"; return (' + expression + ')')();
            return {
                expression,
                result: Number(result.toFixed(4)),
                unit: 'number'
            };
        } catch {
            throw new Error('Invalid math expression');
        }
    },

    async getStockPrice(symbol) {
        await this.delay(600);
        const prices = { AAPL: 175.32, GOOGL: 142.67, TSLA: 248.91, MSFT: 338.45 };
        const price = prices[symbol.toUpperCase()] || Math.floor(50 + Math.random() * 300);
        return {
            symbol: symbol.toUpperCase(),
            price,
            change: (Math.random() - 0.5) * 10,
            timestamp: new Date().toISOString()
        };
    },

    async sendEmail({to, subject, body}) {
        await this.delay(1200);
        return {
            success: true,
            to,
            subject,
            bodyLength: body.length,
            sentAt: new Date().toISOString()
        };
    },

    async searchWeb(query) {
        await this.delay(1000);
        const results = [
            { title: `Top result for "${query}"`, snippet: 'Detailed information found...', url: 'search.com/result' },
            { title: 'Related article', snippet: 'Additional context...', url: 'article.com' }
        ];
        return { query, results };
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};