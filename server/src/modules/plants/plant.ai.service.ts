import { env } from '../../config/env'

export const PLANT_TYPES = [
    'Flowering', 'Fruit', 'Vegetable', 'Succulent',
    'Herb', 'Tree Sapling', 'Indoor', 'Seeds', 'Other',
] as const

export interface AnalyzedPlant {
    title: string
    description: string
    plantType: (typeof PLANT_TYPES)[number]
    confidence: 'high' | 'medium' | 'low'
}

// Free-tier Gemini model — good enough for a quick vision → JSON task like this.
const GEMINI_MODEL = 'gemini-3-flash-preview'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const httpError = (message: string, statusCode: number): Error => {
    const err = new Error(message) as Error & { statusCode: number }
    err.statusCode = statusCode
    return err
}

const buildPrompt = () => `You are helping a user in Bangladesh fill out a "Give Away a Plant" listing on a community plant-sharing site, based on a single photo they uploaded.

Look at the photo and respond with ONLY a raw JSON object (no markdown fences, no extra text) in exactly this shape:
{"title": string, "description": string, "plantType": string, "confidence": "high" | "medium" | "low"}

Rules:
- "title": short and specific, 4-8 words, e.g. "3 Money Plant Cuttings" or "Healthy Aloe Vera Pups". Do not include quotes inside it.
- "description": 2-4 friendly sentences (at least 20 characters) describing what's visible — the plant, its apparent size/condition — and a brief, generic care tip. Do not invent an exact quantity or exact age unless visibly countable.
- "plantType": must be EXACTLY one of: ${PLANT_TYPES.join(', ')}.
- "confidence": "high" if you can clearly identify a real plant/seedling/cutting/seeds in the photo, "medium" if likely but not certain, "low" if the image does not clearly show a plant at all.
- Never wrap the JSON in backticks. Output nothing except the JSON object.`

export async function analyzePlantImage(buffer: Buffer, mimeType: string): Promise<AnalyzedPlant> {
    if (!env.GEMINI_API_KEY) {
        throw httpError('AI photo analysis is not configured on the server (missing GEMINI_API_KEY).', 503)
    }

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: buildPrompt() },
                    { inline_data: { mime_type: mimeType, data: buffer.toString('base64') } },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
        },
    }

    let res: Response
    try {
        res = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
    } catch (err) {
        console.error('Gemini request failed:', err)
        throw httpError('Could not reach the AI service. Please try again.', 502)
    }

    if (!res.ok) {
        const errText = await res.text().catch(() => '')
        console.error('Gemini API error:', res.status, errText)
        throw httpError('AI analysis failed. Please try again or fill the details manually.', 502)
    }

    const data = await res.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
        throw httpError('AI did not return a result. Please try a clearer photo.', 502)
    }

    let parsed: Record<string, unknown>
    try {
        parsed = JSON.parse(text)
    } catch (err) {
        console.error('Failed to parse Gemini JSON:', text)
        throw httpError('Could not understand the AI response. Please fill the details manually.', 502)
    }

    const plantType = PLANT_TYPES.includes(parsed.plantType as (typeof PLANT_TYPES)[number])
        ? (parsed.plantType as (typeof PLANT_TYPES)[number])
        : 'Other'

    const confidence = ['high', 'medium', 'low'].includes(parsed.confidence as string)
        ? (parsed.confidence as AnalyzedPlant['confidence'])
        : 'medium'

    return {
        title: String(parsed.title ?? '').trim().slice(0, 100),
        description: String(parsed.description ?? '').trim().slice(0, 1000),
        plantType,
        confidence,
    }
}