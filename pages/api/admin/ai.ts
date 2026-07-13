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
        prompt: `${String(prompt)} STRICT PRODUCT AND HUMAN QUALITY LOCK: Reference image 1 is the authoritative Moscow Mix product. Use it as an exact visual identity guide, not as a pasted cut-out, sticker, product-card, pedestal display, or picture-in-picture layer. Recreate that exact product naturally inside one coherent, photorealistic lifestyle photograph: preserve its exact category, silhouette, dimensions, proportions, piece count, material, finish, hammer pattern, rim, handle or cap geometry, attachment points, base, openings, color, branding, and every visible construction detail. Other references are supporting angles of the same product. Never invent, merge, substitute, enlarge, or redesign a copper object. Show only the referenced Moscow Mix product.

The product must be used naturally and plausibly for its actual purpose in the scene. For example, a Moscow Mule mug should be the vessel receiving or holding the cocktail, a copper bottle should be carried, poured from, or used for drinking, and a pitcher should be used to pour. If a person interacts with it, show one anatomically correct hand using the true handle, cap, or body in a physically believable way; do not use a generic glass vessel while the Moscow Mix product sits unused. Keep the product at realistic scale, correctly lit, with contact shadows and perspective consistent with the room. It must belong in the scene, never dominate the foreground like a catalog cut-out and never sit alone on a pedestal.

If people appear, keep fully natural faces, eyes, mouths, hands, fingers, and limbs. No surreal anatomy, duplicate body parts, fused objects, distorted faces, novelty shapes, text, packaging copy, or invented logos. Change only the lifestyle setting, lighting, camera composition, and natural use context. If the exact product cannot be preserved and integrated convincingly, omit the product rather than showing an inaccurate or pasted-looking version.`,
        // High-quality web resolution keeps the response safely below Vercel's
        // transport limit while retaining enough detail for journal layouts.
        size: '1280x832' as const,
        quality: 'high' as const,
        output_format: 'jpeg' as const,
        output_compression: 86,
      };

      const result = referenceFiles.length > 0
        ? await openai.images.edit({ ...commonOptions, image: referenceFiles })
        : await openai.images.generate(commonOptions);
      const base64 = result.data?.[0]?.b64_json;
      if (!base64) throw new Error('OpenAI returned no image.');
      return res.status(200).json({ image: `data:image/jpeg;base64,${base64}`, requestId: (result as any)._request_id || null });
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
    console.error('OpenAI admin generation failed', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      requestId: error?.request_id,
    });
    const message = error?.message || 'OpenAI generation failed.';
    return res.status(error?.status || 500).json({ error: message });
  }
}
