import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper: Check if host is private or loopback (SSRF protection)
function isDisallowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower === '0.0.0.0' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower === 'metadata.google.internal' ||
    lower === '169.254.169.254'
  ) {
    return true;
  }

  // IPv4 Private Range checks
  const ipParts = lower.split('.').map((p) => parseInt(p, 10));
  if (ipParts.length === 4 && ipParts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    // 10.0.0.0/8
    if (ipParts[0] === 10) return true;
    // 172.16.0.0/12
    if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return true;
    // 192.168.0.0/16
    if (ipParts[0] === 192 && ipParts[1] === 168) return true;
    // 127.0.0.0/8
    if (ipParts[0] === 127) return true;
    // 169.254.0.0/16 (Link local)
    if (ipParts[0] === 169 && ipParts[1] === 254) return true;
    // 0.0.0.0/8
    if (ipParts[0] === 0) return true;
  }

  return false;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'Tamimmate',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// SSRF-Protected Media URL Inspector
app.post('/api/media/inspect', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Malformed URL provided' });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'Only HTTP and HTTPS protocols are permitted' });
    }

    if (isDisallowedHost(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'Access to private or local network resources is blocked for security' });
    }

    // Perform HEAD request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let headResponse: globalThis.Response;
    try {
      headResponse = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Tamimmate-Media-Agent/1.0',
          'Accept': '*/*',
        },
      });
    } catch {
      // If HEAD fails (some servers reject HEAD), fallback to GET with small byte range
      headResponse = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Tamimmate-Media-Agent/1.0',
          'Range': 'bytes=0-1024',
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const contentType = headResponse.headers.get('content-type') || 'application/octet-stream';
    const contentLength = headResponse.headers.get('content-length')
      ? parseInt(headResponse.headers.get('content-length')!, 10)
      : null;
    const acceptRanges = headResponse.headers.get('accept-ranges') === 'bytes';

    // Extract filename from URL or Content-Disposition
    const contentDisposition = headResponse.headers.get('content-disposition');
    let filename = '';
    if (contentDisposition && contentDisposition.includes('filename=')) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }
    if (!filename) {
      const pathname = parsedUrl.pathname;
      const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
      filename = lastPart || 'media-download';
    }

    // Determine category
    let category: 'video' | 'audio' | 'image' | 'document' | 'archive' | 'other' = 'other';
    const lowerType = contentType.toLowerCase();
    const lowerName = filename.toLowerCase();

    if (lowerType.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi|flv|wmv|m4v)$/i.test(lowerName)) {
      category = 'video';
    } else if (lowerType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|weba)$/i.test(lowerName)) {
      category = 'audio';
    } else if (lowerType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(lowerName)) {
      category = 'image';
    } else if (lowerType.includes('pdf') || /\.(pdf|doc|docx|txt|xls|xlsx|ppt|pptx|csv)$/i.test(lowerName)) {
      category = 'document';
    } else if (lowerType.includes('zip') || lowerType.includes('tar') || /\.(zip|rar|7z|tar|gz)$/i.test(lowerName)) {
      category = 'archive';
    }

    res.json({
      success: true,
      url,
      filename,
      contentType,
      contentLength,
      acceptRanges,
      category,
      statusCode: headResponse.status,
      isDownloadable: headResponse.ok,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to inspect media resource';
    res.status(500).json({ error: errorMsg });
  }
});

// Gemini AI Assistant Chat Proxy
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, language = 'en' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API Key is not configured on the server. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
        fallbackReply: language === 'bn'
          ? 'দুঃখিত, সার্ভারে জেমিনাই এআই কনফিগার করা নেই। তবে আমি তামিমমেট-এর অন্তর্নির্মিত মিডিয়া প্লেয়ার, ফাইল ম্যানেজার ও ডাউনলোডার নির্দেশিকা দিতে পারি!'
          : 'Gemini AI is currently not configured on this server. However, you can freely use all of Tamimmate\'s built-in tools, media players, downloader, and offline file utilities!',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are Tamimmate AI, the intelligent, friendly, and expert assistant built into the "Tamimmate" Universal Web Application (Tagline: "Everything You Need, All in One Place").
Tamimmate is a high-performance web platform featuring:
1. Home Dashboard: media URL analyzer, activity feed, quick launch tools.
2. Discover: unified search across video, music, movies, apps, games, and local files.
3. Built-in Browser: tabbed web browser simulator with bookmarks, security checks, and media extractor.
4. Video Player: custom HTML5 player with speed control, resolutions, watch history, and public domain catalog.
5. Music & Audio: background audio player dock, playlist manager, audio visualizer, local audio upload.
6. Movies: entertainment directory featuring public-domain cinema classics, synopsis, cast, genres.
7. Apps & Games: interactive playable browser games (2048, Snake, Memory Match, Space Dodger) & productivity utilities.
8. Downloader & Download Manager: direct media downloads with progress tracking, pause/resume, and safe filename handling.
9. Universal File Manager: preview, organize, convert image formats, sanitize filenames, and manage local storage files.
10. Settings: dark charcoal & light mode, English & Bengali (বাংলা) language toggles, PWA offline management.

Instructions:
- Respond in the language requested by the user: if the user speaks Bengali or language is 'bn', answer in polite, clear Bengali (বাংলা). Otherwise, answer in concise, helpful English.
- Help users with troubleshooting media playback, explaining video/audio codecs (e.g. MP4 H.264 vs WebM VP9), safe downloading best practices, PWA installation on mobile (iOS Safari / Android Chrome), and utilizing Tamimmate features.
- Never claim to violate copyright or download DRM-protected streaming services. Tamimmate is designed for authorized media, public-domain content, and user-owned files.
- Keep answers structured with short bullet points and clear steps.`;

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const h of history) {
        if (h && typeof h.text === 'string' && (h.role === 'user' || h.role === 'model')) {
          contents.push({
            role: h.role,
            parts: [{ text: h.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({
      reply: response.text || 'I processed your request, but received an empty response.',
      success: true,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'AI service error';
    console.warn('Gemini API call returned an error, activating assistant knowledge fallback:', errorMsg);

    const q = (req.body?.message || '').toLowerCase();
    const isBn = req.body?.language === 'bn';

    let fallbackReply = '';
    if (q.includes('mp4') || q.includes('webm') || q.includes('codec') || q.includes('format')) {
      fallbackReply = isBn
        ? `**মিডিয়া ফরম্যাট তুলনা (MP4 বনাম WebM):**\n\n• **MP4 (H.264/AAC):** সবচেয়ে জনপ্রিয় ও সর্বজনীন ফরম্যাট। প্রায় সকল ডিভাইস ও ব্রাউজারে (iPhone, Android, Windows, Mac) সরাসরি প্লেব্যাক সমর্থন করে।\n• **WebM (VP9/Opus):** গুগলের আধুনিক উন্মুক্ত ওয়েব ভিডিও ফরম্যাট। ফাইলের আকার ছোট হলেও ব্রাউজারে দুর্দান্ত ভিজ্যুয়াল কোয়ালিটি দেয়।\n• **পরামর্শ:** মোবাইল বা সকল প্ল্যাটফর্মে সর্বোচ্চ সামঞ্জস্যের জন্য MP4 ডাউনলোড করুন; আধুনিক ওয়েব স্ট্রিমিং ও ব্যান্ডউইথ সাশ্রয়ের জন্য WebM বেছে নিন।`
        : `**Media Formats Comparison (MP4 vs WebM):**\n\n• **MP4 (H.264 / AAC):** The most universally compatible container. Works seamlessly on iOS Safari, Android Chrome, smart TVs, and desktop OS without extra codecs.\n• **WebM (VP9 / Opus):** An open, royalty-free format optimized for the modern web. Delivers higher compression efficiency with small file sizes at identical visual fidelity.\n• **Recommendation:** Choose MP4 for maximum cross-device sharing, and WebM for fast bandwidth-optimized web streaming.`;
    } else if (q.includes('ios') || q.includes('iphone') || q.includes('pwa') || q.includes('install')) {
      fallbackReply = isBn
        ? `**আইফোন বা আইপ্যাডে তামিমমেট ইনস্টল করার নিয়ম (PWA):**\n\n1. Safari ব্রাউজারে তামিমমেট খুলুন।\n2. নিচে থাকা **Share** বাটনে (তীরচিহ্ন সংবলিত বাক্স) ট্যাপ করুন।\n3. তালিকা থেকে **Add to Home Screen** নির্বাচন করুন।\n4. উপরে ডানে **Add** বাটনে চাপ দিন। তামিমমেট আপনার হোম স্ক্রিনে চলে আসবে এবং অফলাইনেও চলবে!`
        : `**How to install Tamimmate as a PWA on iOS (iPhone / iPad):**\n\n1. Open Tamimmate in Apple Safari.\n2. Tap the **Share** button in Safari's bottom toolbar (square with upward arrow).\n3. Scroll down and tap **"Add to Home Screen"**.\n4. Tap **Add** in the top right corner. The app will launch with standalone fullscreen experience and offline cached shell!`;
    } else if (q.includes('play') || q.includes('troubleshoot') || q.includes('error') || q.includes('সমস্যা')) {
      fallbackReply = isBn
        ? `**ভিডিও বা অডিও না চলার সমস্যা সমাধান:**\n\n• **কোর্স (CORS) ও পারমিশন:** বাহ্যিক সার্ভার যদি ব্রাউজারে স্ট্রিমিং ব্লক করে, তবে সরাসরি তামিমমেট ডাউনলোডার দিয়ে ফাইলটি ডাউনলোড করে নিন।\n• **ভিডিও কোডেক:** ব্রাউজার সাধারণত H.264 ও VP9 সহজে প্লে করে। HEVC (H.265) কিছু সাধারণ ব্রাউজারে নাও চলতে পারে।\n• **নেটওয়ার্ক:** আপনার ইন্টারনেট সংযোগ ও URL এর বৈধতা নিশ্চিত করুন।`
        : `**Media Playback Troubleshooting Guide:**\n\n• **CORS Policy Restrictions:** Some third-party hosts restrict direct browser video streaming. In such cases, use Tamimmate Downloader to download the file directly, then play it in our File Manager.\n• **Codec Support:** Most browsers natively decode H.264 (AVC) and VP9/VP8, but may fail on HEVC/H.265 or high-profile MKV without hardware decoders.\n• **SSL / Mixed Content:** Ensure your direct stream link starts with 'https://' to prevent browser mixed-content blocks.`;
    } else {
      fallbackReply = isBn
        ? `আমি তামিমমেট এআই সহকারী! আপনি আমাকে মিডিয়া ডাউনলোডিং, অডিও/ভিডিও প্লেব্যাক, ফাইল ফরম্যাট কনভার্সন অথবা তামিমমেট সেটিংস সম্পর্কে জিজ্ঞাসা করতে পারেন। আপনার কী সাহায্য প্রয়োজন?`
        : `I am Tamimmate AI Assistant! I can help you with video/audio codecs, direct media downloading, offline PWA capabilities, and troubleshooting. Feel free to ask about any feature!`;
    }

    res.json({
      reply: fallbackReply,
      success: true,
      errorDetail: errorMsg,
    });
  }
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tamimmate full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
