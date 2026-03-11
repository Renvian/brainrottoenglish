const Groq = require("groq-sdk");

// Read API key securely from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Basic in-memory rate limiting map
// (Note: Since Vercel uses serverless functions, this will only track limits
// per server-instance. True global rate limiting would require a database, 
// but this helps prevent rapid-fire clicks from one user)
const rateLimitMap = new Map();

async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Simple IP-based Rate Limiting (Max 10 per minute per IP instance)
    const ip = req.headers['x-forwarded-for'] || 'anonymous';
    const currentTime = Date.now();
    const minute = 60 * 1000;

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, firstRequest: currentTime });
    } else {
        const userLimit = rateLimitMap.get(ip);
        if (currentTime - userLimit.firstRequest < minute) {
            if (userLimit.count >= 10) {
                return res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute.' });
            }
            userLimit.count += 1;
        } else {
            // Reset after a minute
            rateLimitMap.set(ip, { count: 1, firstRequest: currentTime });
        }
    }

    const { text } = req.body;

    // Input Validation
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid input' });
    }
    if (text.length > 1000) {
        return res.status(400).json({ error: 'Input exceeds 1000 characters' });
    }

    const systemPrompt = `
You are a distinguished linguistics professor and expert translator specializing in converting contemporary internet vernacular ("brainrot" slang) into the most exquisitely formal, Victorian-era English prose imaginable.

Your task is to take Gen Z brainrot slang and transform it into extremely formal, eloquent English while preserving the original meaning.
Use:
- Grandiose vocabulary
- Elaborate sentence structures  
- Formal titles and honorifics
- Victorian-era expressions
- Academic and scholarly tone
- Proper etiquette language

Translation guide:
- "no cap" -> "I speak with the utmost veracity"
- "skibidi" -> "of peculiar and noteworthy comportment"
- "rizz" -> "charismatic magnetism and romantic prowess"
- "sigma" -> "a gentleman of distinguished independence"
- "gyatt" -> "an expression of profound admiration"
- "ohio" -> "a locale of most unusual occurrences"
- "bussin" -> "of exceptional quality and merit"
- "slay" -> "to execute with remarkable excellence"
- "fr fr" -> "with the most sincere earnestness"
- "lowkey" -> "with subtle discretion"
- "highkey" -> "with pronounced emphasis"
- "based" -> "possessing admirable conviction"
- "mid" -> "of unremarkable mediocrity"
- "L" -> "a most unfortunate circumstance"
- "W" -> "a triumphant victory"
- "ong" -> "upon my sacred honor"
- "bruh" -> "my esteemed colleague"
- "fanum tax" -> "the customary levy upon one's provisions"
- "mewing" -> "the practice of proper tongue posture for facial refinement"
- "ratio" -> "to be publicly surpassed in popular approval"

Translate the brainrot into formal English. Be creative and dramatic. Only output the formal translation, nothing else.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.8,
            max_tokens: 500,
        });

        // Send back the translation
        res.status(200).json({ translation: chatCompletion.choices[0].message.content });
        
    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: 'Failed to communicate with the professor (API Error)' });
    }
}

module.exports = handler;
