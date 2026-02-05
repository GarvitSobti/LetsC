# Tech Stack & Deployment Strategy

## Recommended Tech Stack for Solution 1

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Browser Extension                  │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   Content   │  │ Popup UI │  │   Background  │  │
│  │   Script    │  │          │  │    Service    │  │
│  └─────────────┘  └──────────┘  └───────────────┘  │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (Vercel/Railway)           │
│  ┌──────────────────┐  ┌──────────────────────┐    │
│  │  FastAPI/Express │  │   AI Processing      │    │
│  │      Server      │  │   - OpenAI API       │    │
│  │                  │  │   - Custom Models    │    │
│  └──────────────────┘  └──────────────────────┘    │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│         Database (Supabase/MongoDB Atlas)           │
│         - User Preferences                          │
│         - Learned Patterns                          │
│         - Analytics                                 │
└─────────────────────────────────────────────────────┘
```

## Frontend Stack

### Browser Extension (Chrome/Edge/Firefox)

**Core Technology:**

- **Manifest V3** (latest Chrome extension standard)
- **React 18** (UI components for popup and settings)
- **TypeScript** (type safety for complex logic)
- **Tailwind CSS** (rapid UI development, built-in accessibility)

**Why This Stack:**

- React: Component reusability, state management
- TypeScript: Catch errors early, better IDE support
- Tailwind: Rapid styling with accessibility utilities
- Manifest V3: Future-proof, better security

**Extension Structure:**

```
extension/
├── manifest.json
├── src/
│   ├── content/
│   │   └── content.ts         # Page analysis & DOM manipulation
│   ├── popup/
│   │   └── Popup.tsx          # User controls
│   ├── background/
│   │   └── background.ts      # API calls, state management
│   ├── utils/
│   │   ├── accessibility.ts   # WCAG checks, contrast calc
│   │   ├── vision.ts          # Visual analysis
│   │   └── speech.ts          # TTS/STT integration
│   └── types/
│       └── index.ts
```

**Key Libraries:**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/chrome": "^0.0.260",
    "tailwindcss": "^3.4.0",
    "web-speech-api": "^0.0.1"
  }
}
```

### Alternative: Web App (If Extension Too Complex)

**Tech Stack:**

- **Next.js 14** (React framework with server components)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (accessible components out of the box)

**Why Next.js:**

- Server-side rendering for performance
- API routes (no separate backend needed)
- Built-in optimization
- Easy Vercel deployment

---

## Backend Stack

### Option 1: Next.js API Routes (RECOMMENDED FOR BEGINNERS)

**Deployment:** Vercel (free tier, zero config)

**Structure:**

```
pages/api/
├── analyze.ts           # Page analysis endpoint
├── simplify.ts          # Text simplification
├── preferences.ts       # Save/load user prefs
└── tts.ts              # Text-to-speech proxy
```

**Pros:**

- Same repo as frontend
- Zero deployment config
- Free hosting on Vercel
- TypeScript throughout

**Cons:**

- Serverless cold starts (1-2s delay)
- Limited to 10s execution on free tier

### Option 2: FastAPI + Railway/Render (FOR AI-HEAVY PROCESSING)

**Tech:** Python FastAPI
**Deployment:** Railway (free tier) or Render

**Why FastAPI:**

- Python ecosystem for AI/ML
- Fast async processing
- Auto-generated API docs
- Easy integration with ML models

**Structure:**

```python
backend/
├── main.py                    # FastAPI app
├── routers/
│   ├── analyze.py            # Vision analysis
│   ├── simplify.py           # NLP processing
│   └── preferences.py        # User data
├── models/
│   ├── vision_model.py       # CV logic
│   └── nlp_model.py          # Text processing
├── requirements.txt
└── Dockerfile
```

**Pros:**

- Better for heavy AI processing
- Can use custom ML models
- More control over resources

**Cons:**

- Separate repo/deployment
- Team needs Python knowledge
- Free tier has limits

### Recommended Approach

**Start with Next.js API Routes**, switch to FastAPI only if:

- AI processing takes >8s
- Need custom ML model training
- Team has strong Python skills

---

## AI/ML Stack

### OpenAI APIs (RECOMMENDED)

**Services to Use:**

1. **GPT-4 Vision** (or GPT-4o)
   - Use: Analyze page layout, identify accessibility issues
   - Endpoint: `chat/completions` with image input
   - Cost: ~$0.01 per image
   - Speed: 2-4s response time

2. **GPT-4 Turbo**
   - Use: Text simplification, content analysis
   - Endpoint: `chat/completions`
   - Cost: ~$0.01 per 1K tokens
   - Speed: 1-2s response time

3. **Whisper API**
   - Use: Voice command recognition
   - Endpoint: `audio/transcriptions`
   - Cost: $0.006 per minute
   - Speed: <1s for short commands

4. **TTS API**
   - Use: Text-to-speech for content
   - Endpoint: `audio/speech`
   - Cost: $15 per 1M characters
   - Speed: Real-time streaming

**Why OpenAI:**

- Production-ready APIs
- No model deployment needed
- Fast response times
- Generous free credits for hackathons

**Alternative:** Use Hugging Face models (free but slower)

### Browser Native APIs (FREE)

1. **Web Speech API**

   ```javascript
   // Text-to-Speech (built into browser)
   const utterance = new SpeechSynthesisUtterance(text);
   speechSynthesis.speak(utterance);

   // Speech-to-Text
   const recognition = new webkitSpeechRecognition();
   recognition.start();
   ```

   - Pros: Free, fast, no API calls
   - Cons: Limited voices, browser-dependent

2. **Contrast Ratio Calculation** (Pure JS)
   ```javascript
   // Calculate WCAG contrast ratio
   function getContrastRatio(fg, bg) {
     /* ... */
   }
   ```

**Recommended Mix:**

- Use **Browser APIs** for TTS/STT (free, instant)
- Use **OpenAI** for complex analysis (vision, simplification)
- Cache results to minimize API calls

---

## Database

### Option 1: Supabase (RECOMMENDED)

**Why Supabase:**

- PostgreSQL (reliable, powerful)
- Real-time subscriptions
- Built-in auth
- Generous free tier (500MB, 50K users)
- Easy Vercel integration

**Schema:**

```sql
-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id TEXT,
  font_size INTEGER DEFAULT 16,
  contrast_mode TEXT DEFAULT 'normal',
  simplification_level INTEGER DEFAULT 0,
  voice_enabled BOOLEAN DEFAULT false,
  learned_patterns JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Accessibility scores (analytics)
CREATE TABLE page_scores (
  id UUID PRIMARY KEY,
  url TEXT,
  complexity_score FLOAT,
  accessibility_score FLOAT,
  improvements_applied JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### Option 2: MongoDB Atlas (Alternative)

**Why MongoDB:**

- Flexible schema (good for evolving preferences)
- Free tier (512MB)
- Easy JSON storage

**When to Use:**

- Team familiar with NoSQL
- Preference structure will change frequently

### Option 3: LocalStorage (MVP Only)

**For Hackathon MVP:**

- Store preferences in browser localStorage
- No backend needed initially
- Migrate to Supabase later

**Pros:** Instant setup, no auth needed
**Cons:** Lost if browser cleared, no cross-device sync

**Recommended:** Start with localStorage, add Supabase if time permits

---

## Deployment Strategy

### Extension Deployment

**Development:**

```bash
# Build extension
npm run build

# Load unpacked in Chrome
# chrome://extensions → Developer mode → Load unpacked
```

**Hackathon Demo:**

- Load unpacked extension (instant)
- No need for Chrome Web Store (takes days to approve)

**Post-Hackathon:**

- Submit to Chrome Web Store
- Firefox Add-ons
- Edge Add-ons

### Backend Deployment

#### Option 1: Vercel (Next.js) - EASIEST

**Setup:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

**Environment Variables:**

```bash
# .env.local
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_KEY=...
```

**Pros:**

- Zero config deployment
- Free SSL
- Global CDN
- Preview deployments for PRs

**Limits:**

- 10s function timeout (free tier)
- 100GB bandwidth/month

#### Option 2: Railway - FOR HEAVY AI

**Setup:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Pros:**

- Longer timeouts (no limit)
- Better for AI processing
- $5 free credit monthly

**Cons:**

- Slightly more config than Vercel

#### Option 3: Render (Alternative)

**Setup:**

- Connect GitHub repo
- Auto-deploy on push
- Free tier available

### Recommended Deployment Path

**For Hackathon:**

1. **Day 1-2:** Develop locally
   - Use localhost for API
   - LocalStorage for data

2. **Day 3:** Deploy backend
   - Vercel for Next.js
   - OR Railway for FastAPI

3. **Day 4:** Integration
   - Connect extension to deployed API
   - Add Supabase if time permits

4. **Demo Day:**
   - Load unpacked extension on presentation laptop
   - Backend already deployed and stable

---

## Complete Tech Stack Summary

### Recommended Stack (Beginner-Friendly)

```
┌─────────────────────────────────────────┐
│   Frontend: Chrome Extension            │
│   - React 18 + TypeScript               │
│   - Tailwind CSS                        │
│   - Web Speech API                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Backend: Next.js 14                   │
│   - API Routes (TypeScript)             │
│   - Deployed on Vercel                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   AI: OpenAI APIs                       │
│   - GPT-4 Vision (page analysis)        │
│   - GPT-4 Turbo (text simplification)   │
│   - Browser TTS/STT                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Database: Supabase (PostgreSQL)       │
│   - User preferences                    │
│   - Analytics                           │
│   Alternative: LocalStorage for MVP     │
└─────────────────────────────────────────┘
```

### Alternative Stack (AI-Heavy)

```
Frontend: Same (Chrome Extension)
    ↓
Backend: FastAPI (Python)
    - Deployed on Railway
    - Uvicorn server
    ↓
AI: OpenAI + Hugging Face
    - GPT-4 Vision
    - Local models for speed
    ↓
Database: MongoDB Atlas
    - Flexible schema
```

---

## Cost Estimate (Hackathon)

**Free Tier Coverage:**

- Vercel: Free (100GB bandwidth)
- Supabase: Free (500MB DB)
- OpenAI: ~$5 for hackathon testing
- Railway: $5 free credit
- Domain: Not needed for demo

**Total Cost: $0-5** (only OpenAI if needed)

---

## Decision Matrix

| Aspect              | Next.js + Vercel | FastAPI + Railway |
| ------------------- | ---------------- | ----------------- |
| Setup Speed         | ⭐⭐⭐⭐⭐       | ⭐⭐⭐            |
| AI Integration      | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐        |
| Deployment          | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐          |
| Team Learning Curve | ⭐⭐⭐⭐         | ⭐⭐⭐            |
| Performance         | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐        |
| Cost (Free Tier)    | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐          |

**Recommendation: Start with Next.js + Vercel**

---

## Implementation Priority

### Phase 1: MVP (Days 1-2)

- Chrome extension shell
- Basic DOM manipulation (contrast, text size)
- Localhost API

### Phase 2: AI Integration (Days 3-4)

- OpenAI GPT-4 Vision for page analysis
- Text simplification
- Deploy to Vercel

### Phase 3: Polish (Day 5)

- TTS/STT integration
- User preferences (LocalStorage)
- UI refinements

### Phase 4: Demo Prep (Day 6)

- Test on multiple websites
- Prepare presentation
- Backup plans for live demo

---

**Next**: Create detailed implementation roadmap
