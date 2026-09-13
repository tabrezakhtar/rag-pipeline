require('dotenv').config();
const OpenAI = require('openai');
const readline = require('readline');

const { OPENROUTER_API_KEY } = process.env;

async function main() {
    if (!OPENROUTER_API_KEY) {
        throw new Error('Missing OPENROUTER_API_KEY in .env');
    }

    const terminal = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const prompt = await new Promise((resolve) => {
        terminal.question('You: ', resolve);
    });
    terminal.close();

    if (!prompt.trim()) {
        throw new Error('Please enter a prompt.');
    }

    const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: OPENROUTER_API_KEY,
    });

    const apiResponse = await client.chat.completions.create({
        model: 'openrouter/free',
        messages: [{
            role: 'user',
            content: prompt,
        }],
    });

    console.log(apiResponse.choices[0]?.message?.content ?? 'No response content returned.');
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
