# Lead Sheet AI App Plan (Piano, Guitar, Drums)

## 1) Goal
Build a musician-facing app that converts **any song** into a practical lead sheet for:
- Piano
- Guitar
- Drums

Users can provide input by:
1. Uploading an audio file (mp3/wav/m4a/flac)
2. Entering song title + artist

Primary UX target: a lead sheet generated in under 30 seconds for common songs, with editable results and confidence indicators.

---

## 2) Reality Constraints (to avoid “without error” claims)
A strict “zero-error instantly for any song” promise is not technically realistic today. Instead:
- Return fast **draft** lead sheets with confidence scoring.
- Highlight low-confidence bars and suggest manual correction.
- Let users regenerate with alternate analysis models.

This gives near-instant value while preserving trust.

---

## 3) Core Features (MVP)

### Input
- **Upload flow**: drag/drop audio file.
- **Catalog flow**: title + artist search (YouTube/Spotify preview or licensed catalog).
- Pre-processing: normalization, downmix, tempo stabilization.

### Analysis
- Key detection + modulation tracking.
- Tempo and meter detection.
- Chord recognition (bar-level + beat-level where possible).
- Structure segmentation (intro/verse/chorus/bridge/outro).
- Drum pattern extraction (kick/snare/hat/tom/cymbal events with groove labels).
- Optional melody contour extraction for top-line hints.

### Lead Sheet Output
- **Unified chart** with:
  - Song metadata
  - Key, tempo, meter
  - Section map
  - Chord symbols with repeats, slash chords, Nashville option
- **Instrument-specific views**:
  - Piano: voicing suggestions + rhythmic comping patterns
  - Guitar: chord grids/capo suggestions + strumming patterns
  - Drums: groove notation + section fills + dynamics cues
- Export:
  - PDF
  - MusicXML
  - MIDI

### Editor
- Click-to-edit chords, bars, sections, tempo markings.
- Transpose instantly.
- Save versions and compare revisions.

---

## 4) System Architecture

### Frontend
- React + Next.js
- Chart rendering: VexFlow / OpenSheetMusicDisplay
- State: Zustand or Redux Toolkit

### Backend API
- Python FastAPI (or Node + NestJS)
- Async job orchestration via Redis queue (RQ/Celery/BullMQ)
- WebSocket/SSE for progress updates

### Audio/ML Pipeline
- Source separation: Demucs/Spleeter (optional acceleration)
- Beat/downbeat: madmom/Essentia/librosa models
- Chords: transformer-based chord estimation model + HMM smoothing
- Structure segmentation: embeddings + boundary detector
- Drum transcription: onset + class model (CNN/transformer)
- Post-processor:
  - Harmonic sanity rules
  - Meter alignment
  - Repetition simplification for readable charts

### Data + Storage
- PostgreSQL for users/projects/charts
- Object storage (S3-compatible) for uploads/artifacts
- Cache layer for repeated song requests

---

## 5) API Sketch

### `POST /v1/analyze/upload`
Upload file and create analysis job.

### `POST /v1/analyze/catalog`
Provide `{ title, artist }`; resolve source and queue analysis.

### `GET /v1/jobs/{jobId}`
Return status, progress, partial results.

### `GET /v1/charts/{chartId}`
Get generated lead sheet JSON.

### `PATCH /v1/charts/{chartId}`
Apply user edits.

### `POST /v1/charts/{chartId}/export`
Export to PDF/MusicXML/MIDI.

---

## 6) Lead Sheet Data Model (simplified)

```json
{
  "song": {"title": "", "artist": "", "key": "G", "tempo": 124, "meter": "4/4"},
  "sections": [
    {
      "name": "Verse",
      "bars": [
        {"bar": 1, "chord": "G", "beats": ["G", "G", "C", "D"], "confidence": 0.92}
      ]
    }
  ],
  "drums": {
    "grooves": [{"section": "Verse", "pattern": "8th rock", "confidence": 0.88}],
    "fills": [{"bar": 16, "length": "1 bar"}]
  },
  "instrumentHints": {
    "piano": [{"bar": 1, "voicing": "G(add9) rootless"}],
    "guitar": [{"bar": 1, "shape": "320033", "capo": 0}]
  }
}
```

---

## 7) Accuracy & Quality Strategy
- Build a benchmark set (multi-genre, live/studio, varying mix quality).
- Metrics:
  - Chord symbol accuracy (bar and beat)
  - Structural boundary F1
  - Tempo/key error rates
  - Drum event F1
- Human-in-the-loop QA: pro musicians review sampled outputs weekly.
- Continuous retraining on corrected user edits (opt-in).

---

## 8) Performance Plan
- Two-pass generation:
  1. **Fast pass (5–15s):** chord skeleton + rough sections
  2. **Refinement pass (15–45s):** detailed drum and arrangement hints
- Stream progressive results in UI.
- GPU inference where available; CPU fallback for smaller models.

---

## 9) Legal/Licensing Requirements
- Do not store or redistribute full copyrighted audio without rights.
- For title/artist flow, integrate only licensed preview/full-track providers.
- Provide clear terms for user-uploaded content ownership and deletion.

---

## 10) Security & Reliability
- File validation + malware scanning.
- Rate limits and abuse detection.
- Idempotent jobs and retry policy.
- Observability: tracing + per-stage latency and error dashboards.

---

## 11) Milestones

### Phase 0 (1–2 weeks)
- Product spec, wireframes, architecture, model selection.

### Phase 1 MVP (4–6 weeks)
- Upload input
- Key/tempo/chord/sections
- Editable lead sheet + PDF export
- Piano/guitar/drum basic hints

### Phase 2 (4 weeks)
- Catalog input by title/artist
- Better drum transcription
- MusicXML + MIDI export
- Collaboration/sharing

### Phase 3 (ongoing)
- Personal style presets
- Reharmonization suggestions
- Setlist mode and live performance view

---

## 12) Suggested Tech Stack
- Frontend: Next.js + TypeScript + Tailwind
- Backend: FastAPI + Python
- ML Serving: PyTorch + ONNX Runtime
- Queue: Redis + Celery
- DB: PostgreSQL
- Storage: S3-compatible bucket
- Infra: Docker + Kubernetes (or ECS)

---

## 13) First Build Tasks (next 10 tickets)
1. Project scaffolding (web + api + worker)
2. File upload endpoint + storage
3. Async job queue + status endpoint
4. BPM/key baseline detector
5. Chord timeline baseline model
6. Section segmentation baseline
7. Lead sheet JSON schema + renderer
8. Chord editor + transpose UI
9. PDF export service
10. Basic QA dataset + score report
