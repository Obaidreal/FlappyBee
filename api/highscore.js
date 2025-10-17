// api/highscore.js
import { put, get } from '@vercel/blob';

let highscore = { name: 'Anonymous', score: 0 }; // Fallback

export default async function handler(req, res) {
    const blobPath = 'highscores.json'; // File path in Blob store

    if (req.method === 'GET') {
        try {
            const blob = await get(blobPath);
            if (blob) {
                const data = await blob.text();
                highscore = JSON.parse(data);
            }
            res.status(200).json(highscore);
        } catch (e) {
            console.error('Error loading highscore:', e);
            res.status(200).json(highscore);
        }
    } else if (req.method === 'POST') {
        const { name, score } = req.body;
        if (!name || score === undefined) {
            res.status(400).json({ error: 'Invalid name or score' });
            return;
        }
        try {
            // Check current high score
            const blob = await get(blobPath);
            let currentHigh = 0;
            if (blob) {
                const data = await blob.text();
                const current = JSON.parse(data);
                currentHigh = current.score || 0;
            }
            if (score > currentHigh) {
                highscore = { name, score };
                await put(blobPath, JSON.stringify(highscore), { access: 'public' });
                res.status(200).json({ success: true, highscore });
            } else {
                res.status(200).json({ success: false, highscore });
            }
        } catch (e) {
            console.error('Error saving highscore:', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
