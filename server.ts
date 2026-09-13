import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DATA_DIR = path.join(process.cwd(), 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'student_submissions.json');
const STATE_FILE = path.join(DATA_DIR, 'hostel_state.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([]), 'utf-8');
    }
    if (!fs.existsSync(STATE_FILE)) {
      fs.writeFileSync(STATE_FILE, JSON.stringify({}), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring data directory:', err);
  }
}

function getHostelState(): Record<string, any> {
  ensureDataDir();
  try {
    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(content) || {};
  } catch (err) {
    return {};
  }
}

function saveHostelState(data: Record<string, any>) {
  ensureDataDir();
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing state file:', err);
  }
}

function getSubmissions(): any[] {
  ensureDataDir();
  try {
    const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading submissions file:', err);
    return [];
  }
}

function saveSubmissions(list: any[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing submissions file:', err);
  }
}

async function startServer() {
  ensureDataDir();
  const app = express();
  const PORT = 3000;

  // Enable JSON and URL-encoded body parsing with generous payload limit for photos
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API routes first
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: process.env.NODE_ENV, submissionsCount: getSubmissions().length });
  });

  // Complete hostel data state backup & sync (100% Free, zero Firebase quota needed)
  app.get('/api/state', (req, res) => {
    try {
      const state = getHostelState();
      res.json({ success: true, state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/state', (req, res) => {
    try {
      const incoming = req.body;
      if (typeof incoming === 'object' && incoming !== null) {
        const current = getHostelState();
        const updated = { ...current, ...incoming };
        saveHostelState(updated);
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: 'Invalid state body' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get all saved online submissions
  app.get('/api/submissions', (req, res) => {
    try {
      const submissions = getSubmissions();
      res.json({ success: true, count: submissions.length, submissions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // Save new online student submission from mobile/web form
  app.post('/api/submissions', (req, res) => {
    try {
      const newStudent = req.body;
      if (!newStudent || !newStudent.name) {
        return res.status(400).json({ success: false, error: 'Student name is required' });
      }

      const existing = getSubmissions();
      const studentId = newStudent.id || Date.now();
      newStudent.id = studentId;
      newStudent.submittedAt = newStudent.submittedAt || new Date().toISOString();

      // Check if already exists by id or same mobile + name
      const index = existing.findIndex(
        (s) => s.id === studentId || (s.mobile && s.mobile === newStudent.mobile && s.name === newStudent.name)
      );

      if (index >= 0) {
        existing[index] = { ...existing[index], ...newStudent };
      } else {
        existing.unshift(newStudent);
      }

      saveSubmissions(existing);
      console.log(`[Hostel Server] Successfully recorded submission for: ${newStudent.name} (${newStudent.mobile || 'no-phone'})`);
      res.json({ success: true, student: newStudent, totalSaved: existing.length });
    } catch (err: any) {
      console.error('[Hostel Server] Error saving submission:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // Delete submission once approved or if removed
  app.delete('/api/submissions/:id', (req, res) => {
    try {
      const id = req.params.id;
      const existing = getSubmissions();
      const filtered = existing.filter((s) => String(s.id) !== String(id));
      saveSubmissions(filtered);
      res.json({ success: true, count: filtered.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Explicit static file serving with MIME type overrides
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else if (filePath.endsWith('.svg')) {
          res.setHeader('Content-Type', 'image/svg+xml');
        } else if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/jpeg');
        }
      }
    }));
    
    app.get('*', (req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
