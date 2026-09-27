import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length === 0) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Convert image URL or DataURL to base64 inline part
async function resolveImagePart(imageUrl: string): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  try {
    if (imageUrl.startsWith('data:image/')) {
      const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const res = await fetch(imageUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const buffer = await res.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        return {
          inlineData: {
            mimeType: contentType.split(';')[0],
            data: base64Data,
          },
        };
      }
    }
  } catch (err) {
    console.warn('Could not fetch image for multimodal embedding:', err);
  }
  return null;
}

// ================= API ROUTES =================

// 1. Check Gemini Status
app.get('/api/gemini/status', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    ok: true,
    hasKey,
    model: 'gemini-3.8-flash',
    features: ['post-generation', 'viral-hooks', 'multimodal-visuals', 'post-polishing']
  });
});

// 2. Generate LinkedIn Post
app.post('/api/gemini/generate-post', async (req, res) => {
  try {
    const {
      topic,
      tone = 'Storytelling',
      length = 'medium',
      audience = 'Founders & C-Suite Execs',
      cta = 'What has been your experience? Drop your thoughts in the comments 👇',
      includeEmojis = true,
      includeHashtags = true,
      includeViralHook = true,
      imageUrl,
      imageCaption,
      temperature = 0.7,
    } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        ok: false,
        error: 'Gemini API key is not configured in environment',
        needsFallback: true
      });
    }

    const wordCountConstraint = length === 'short'
      ? 'under 150 words (tight, crisp, high-impact)'
      : length === 'medium'
      ? 'between 180 and 320 words (the exact LinkedIn sweet spot for mobile dwell)'
      : 'between 400 and 550 words (comprehensive executive deep-dive)';

    const imageInstruction = imageUrl
      ? `\nVisual Attachment Context: A visual diagram/infographic is attached to this post.${imageCaption ? ` Caption: "${imageCaption}".` : ''} Reference this visual naturally in the narrative (e.g. "Take a look at the breakdown below 👇" or "The diagram below maps this out:").`
      : '';

    const prompt = `You are a world-class LinkedIn thought leadership ghostwriter for Fortune 500 executives, top founders, and technical leaders.
Generate a high-converting, viral LinkedIn post based on these exact constraints:

Core Topic / Story: ${topic || 'Why most founders fail in their first 90 days'}
Tone & Voice: ${tone}
Target Audience: ${audience}
Target Length: ${wordCountConstraint}
Call To Action: ${cta}
Include Emojis: ${includeEmojis ? 'Yes, tasteful high-signal emojis used deliberately' : 'No emojis at all'}
Include Hashtags: ${includeHashtags ? 'Yes, 3-5 relevant niche hashtags at the bottom' : 'No hashtags'}
Include High-Dwell Viral Hook: ${includeViralHook ? 'Crucial: First 2-3 lines must be a high-tension cliffhanger that stops the scroll before LinkedIn "...see more" cutoff.' : 'Standard opening'}${imageInstruction}

LinkedIn Algorithm Optimization Rules:
1. First 3 lines must have intense tension, counter-intuitive contrast, or specific numbers to trigger the "...see more" tap.
2. Generous white space and line breaks. Maximum 1-2 sentences per paragraph to maximize dwell-time on mobile feeds.
3. Use bullet points or arrows for high scannability.
4. Bold key headings using mathematical unicode bold if appropriate.
5. End with the specified Call to Action.

Do NOT include any conversational preamble, intro quotes, or markdown explanations. Output ONLY the raw LinkedIn post text ready to copy-paste.`;

    let contents: any = prompt;

    if (imageUrl) {
      const imgPart = await resolveImagePart(imageUrl);
      if (imgPart) {
        contents = {
          parts: [
            imgPart,
            { text: prompt }
          ]
        };
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        temperature: Math.min(1.0, Math.max(0.1, Number(temperature) || 0.7)),
      }
    });

    const postText = response.text?.trim();
    if (!postText) {
      return res.status(502).json({ ok: false, error: 'Empty response from Gemini model', needsFallback: true });
    }

    res.json({ ok: true, post: postText });
  } catch (error: any) {
    console.error('Gemini post generation error:', error);
    res.status(500).json({
      ok: false,
      error: error?.message || 'Gemini post generation failed',
      needsFallback: true
    });
  }
});

// 3. Generate Viral Hooks
app.post('/api/gemini/generate-hooks', async (req, res) => {
  try {
    const { topic, angle = 'contrarian' } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        ok: false,
        error: 'Gemini API key is not configured in environment',
        needsFallback: true
      });
    }

    const prompt = `Generate 5 viral 3-line LinkedIn openers (hooks) optimized for mobile dwell-time and the "...see more" cutoff.
Topic: "${topic || 'B2B Growth, SaaS engineering, and founder leadership'}"
Psychological Angle: "${angle}"

Requirements:
- Each hook must have 2 to 3 lines.
- First line: High-tension cliffhanger, contrarian insight, or specific metric under 90 characters.
- Second/Third line: Intriguing setup that creates an irresistible curiosity gap before the fold.
- Output ONLY the 5 hooks separated strictly by '---'. Do not output numbers, preamble, or commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    const text = response.text || '';
    const rawSplits = text.split('---').map(s => s.trim()).filter(s => s.length > 20);

    res.json({
      ok: true,
      hooks: rawSplits.length >= 2 ? rawSplits.slice(0, 5) : [text.trim()]
    });
  } catch (error: any) {
    console.error('Gemini hooks generation error:', error);
    res.status(500).json({
      ok: false,
      error: error?.message || 'Gemini hook generation failed',
      needsFallback: true
    });
  }
});

// 4. Multimodal Image Analysis & Narrative Extraction
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { imageUrl, context = '' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ ok: false, error: 'imageUrl is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        ok: false,
        error: 'Gemini API key is not configured in environment',
        needsFallback: true
      });
    }

    const imgPart = await resolveImagePart(imageUrl);
    if (!imgPart) {
      return res.status(400).json({ ok: false, error: 'Could not parse image data for analysis' });
    }

    const prompt = `You are a high-level executive content strategist and LinkedIn ghostwriter.
Carefully analyze this visual diagram / infographic / graphic asset.${context ? ` User context: "${context}".` : ''}

Provide a comprehensive JSON object with:
1. "visualTitle": A compelling title for this visual framework.
2. "coreTakeaway": The single most counter-intuitive or powerful executive insight from this visual.
3. "keyPoints": An array of 3 to 4 concise bullet takeaways extracted directly from the graphic.
4. "suggestedHook": A scroll-stopping 3-line LinkedIn opener anchored to this image.
5. "suggestedPostDraft": A full, publish-ready LinkedIn post (180-260 words) that guides the audience through the framework with clear line breaks, bullet points, and an engagement CTA.

Output ONLY valid JSON with keys: "visualTitle", "coreTakeaway", "keyPoints", "suggestedHook", "suggestedPostDraft". No markdown code fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          imgPart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      }
    });

    const rawJson = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      // Clean possible wrapping
      const cleaned = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({ ok: true, data: parsed });
  } catch (error: any) {
    console.error('Gemini image analysis error:', error);
    res.status(500).json({
      ok: false,
      error: error?.message || 'Image analysis failed',
      needsFallback: true
    });
  }
});

// 5. Polish & Improve Existing Post
app.post('/api/gemini/improve-post', async (req, res) => {
  try {
    const { postContent, instruction = 'make it punchier and optimize for mobile dwell-time' } = req.body;

    if (!postContent || postContent.trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'postContent is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        ok: false,
        error: 'Gemini API key is not configured in environment',
        needsFallback: true
      });
    }

    const prompt = `You are a premier LinkedIn ghostwriter.
Please polish and elevate this existing LinkedIn draft according to this direction: "${instruction}".

Original Draft:
"""
${postContent}
"""

Rules:
- Keep the author's core story and facts intact.
- Enhance the hook friction in the first 3 lines so readers click "...see more".
- Optimize formatting: generous line breaks, 1-2 sentence paragraphs, punchy cadence.
- Preserve or improve the Call To Action.
- Output ONLY the polished post text ready to publish. No conversational wrapper or markdown quotes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const improved = response.text?.trim();
    res.json({ ok: true, improvedPost: improved || postContent });
  } catch (error: any) {
    console.error('Gemini post improvement error:', error);
    res.status(500).json({
      ok: false,
      error: error?.message || 'Improvement failed',
      needsFallback: true
    });
  }
});

// ================= FRONTEND / VITE SERVER SETUP =================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinkedIn Post Craft AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
