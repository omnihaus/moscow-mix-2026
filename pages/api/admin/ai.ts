import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI, { toFile } from 'openai';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '../../../lib/admin-session';

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

// GPT-5.4 mini is designed for fast, high-volume, well-defined writing tasks.
// A Vercel OPENAI_TEXT_MODEL value can override this later without a code change.
const textModel = process.env.OPENAI_TEXT_MODEL || 'gpt-5.4-mini';
const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';

function authorized(req: NextApiRequest) {
  const expected = process.env.ADMIN_AI_SECRET;
  const supplied = req.headers['x-admin-ai-secret'];
  const legacyCodeMatches = Boolean(expected && supplied && supplied === expected);
  return legacyCodeMatches || verifyAdminSession(req.cookies[ADMIN_SESSION_COOKIE], expected);
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

    if (operation === 'verify') {
      return res.status(200).json({ valid: true });
    }

    if (operation === 'image') {
      const referenceFiles = await Promise.all(images.slice(0, 4).map(async (image: string, index: number) => {
        const value = String(image);
        const match = value.match(/^data:([^;]+);base64,(.+)$/);
        const mimeType = match?.[1] || 'image/jpeg';
        const base64 = match?.[2] || value;
        const extension = mimeType.includes('png') ? 'png' : 'jpg';
        return toFile(Buffer.from(base64, 'base64'), `moscow-mix-reference-${index + 1}.${extension}`, { type: mimeType });
      }));

      const commonOptions = {
        model: imageModel,
        prompt: `${String(prompt)} STRICT PRODUCT IDENTITY LOCK: Reference image 1 is the authoritative Moscow Mix product and must be reproduced without redesign. Keep its exact silhouette, dimensions, proportions, count of pieces, material, surface finish, hammer pattern, rim profile, handle geometry, handle thickness, handle attachment points, base, openings, color, reflections, branding, and every visible construction detail. The remaining references show the same product from supporting angles. Change only the surrounding lifestyle scene, people, lighting, camera angle, and background. Do not create, substitute, merge, embellish, simplify, or hallucinate any copper product. If the exact Moscow Mix product cannot be retained, omit the product rather than showing an inaccurate one.`,
        size: '1536x1024' as const,
        quality: 'high' as const,
        output_format: 'jpeg' as const,
      };

      const result = referenceFiles.length > 0
        ? await openai.images.edit({ ...commonOptions, image: referenceFiles })
        : await openai.images.generate(commonOptions);
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
      reasoning: { effort: 'low' },
    });
    return res.status(200).json({ text: response.output_text });
  } catch (error: any) {
    console.error('OpenAI admin generation failed', error);
    const message = error?.message || 'OpenAI generation failed.';
    return res.status(error?.status || 500).json({ error: message });
  }
}
