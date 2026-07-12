import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

const textModel = process.env.OPENAI_TEXT_MODEL || 'gpt-5.6';
const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';

function authorized(req: NextApiRequest) {
  const expected = process.env.ADMIN_AI_SECRET;
  const supplied = req.headers['x-admin-ai-secret'];
  return Boolean(expected && supplied && supplied === expected);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ configured: Boolean(process.env.OPENAI_API_KEY && process.env.ADMIN_AI_SECRET) });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'OpenAI is not configured in Vercel yet.' });
  if (!authorized(req)) return res.status(401).json({ error: 'The AI access code is missing or incorrect.' });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { operation, prompt, images = [] } = req.body || {};

    if (operation === 'image') {
      const result = await openai.images.generate({
        model: imageModel,
        prompt: String(prompt),
        size: '1536x1024',
        quality: 'medium',
        output_format: 'jpeg',
      });
      const base64 = result.data?.[0]?.b64_json;
      if (!base64) throw new Error('OpenAI returned no image.');
      return res.status(200).json({ image: `data:image/jpeg;base64,${base64}` });
    }

    const content: any[] = [{ type: 'input_text', text: String(prompt) }];
    for (const image of images.slice(0, 4)) {
      const url = String(image).startsWith('data:') ? String(image) : `data:image/jpeg;base64,${image}`;
      content.push({ type: 'input_image', image_url: url, detail: 'high' });
    }

    const response = await openai.responses.create({
      model: textModel,
      input: [{ role: 'user', content }],
    });
    return res.status(200).json({ text: response.output_text });
  } catch (error: any) {
    console.error('OpenAI admin generation failed', error);
    const message = error?.message || 'OpenAI generation failed.';
    return res.status(error?.status || 500).json({ error: message });
  }
}
