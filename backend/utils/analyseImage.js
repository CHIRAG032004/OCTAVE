const FALLBACK_RESULT = { category: 'Other', title: 'Unknown Issue' };

async function analyzeImage(imageUrl) {
    if (!process.env.OPENROUTER_API_KEY) {
        return FALLBACK_RESULT;
    }

    const prompt = `
Analyze the uploaded image and classify it into one of the following fixed civic categories:

1. Roads & Transport
2. Street Lighting
3. Garbage & Sanitation
4. Water Supply & Drainage
5. Electricity
6. Public Safety
7. Other

Return the result in structured JSON format:
{
  "category": "<one of the fixed categories above>",
  "title": "<a concise title, max 10 words>"
}
Only respond with the raw JSON object. Do not use Markdown formatting or triple backticks.
`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-small-3.2-24b-instruct:free',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl }
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter request failed with status ${response.status}`);
        }

        const res = await response.json();
        const message = res?.choices?.[0]?.message?.content;
        if (!message) {
            return FALLBACK_RESULT;
        }

        const result = JSON.parse(message);
        return {
            category: result.category || FALLBACK_RESULT.category,
            title: result.title || FALLBACK_RESULT.title,
        };
    } catch (error) {
        console.error('Error analyzing image:', error.message);
        return FALLBACK_RESULT;
    }
}

module.exports = analyzeImage;
