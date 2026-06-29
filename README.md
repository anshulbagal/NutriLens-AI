# NutriLens AI

A full-stack GenAI application that analyzes food labels from uploaded images, extracting ingredients and nutrition facts using OCR, retrieving trusted knowledge through Retrieval-Augmented Generation (RAG), and leveraging an LLM to generate evidence-based insights.

## Project Vision

NutriLens AI transforms complex food label information into clear, understandable insights for health-conscious consumers, helping them make informed dietary choices.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Axios, React Router  
**Backend:** FastAPI (Python)  
**OCR:** PaddleOCR  
**LLM:** Google Gemini API  
**RAG Framework:** LangChain  
**Vector Database:** ChromaDB  
**Database:** MongoDB Atlas  
**Authentication:** JWT + bcrypt  
**Deployment:** Vercel (Frontend), Render (Backend), MongoDB Atlas

## Project Structure

```
NutriLens-AI/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/               # FastAPI
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── services/      # Business logic
│   │   ├── rag/           # RAG pipeline
│   │   ├── ocr/           # OCR processing
│   │   ├── models/        # DB models
│   │   ├── database/      # DB connection
│   │   ├── prompts/       # LLM prompts
│   │   └── main.py
│   └── requirements.txt
├── knowledge_base/        # Knowledge documents
├── vector_db/            # ChromaDB vectors
└── README.md
```

## Core Features

- ✅ Upload and analyze single food product labels
- ✅ Compare two products side-by-side
- ✅ OCR extraction of ingredients and nutrition facts
- ✅ Ingredient explanations with RAG
- ✅ Nutrition analysis and health scoring
- ✅ Allergen detection
- ✅ AI-generated summaries
- ✅ Conversational AI chat
- ✅ Scan history with authentication
- ✅ User authentication (JWT)

## REST APIs

```
POST   /signup                 # User registration
POST   /login                  # User login
POST   /upload                 # Upload image
POST   /analyze                # Analyze single product
POST   /compare                # Compare two products
POST   /chat                   # Chat with AI
GET    /history                # Get scan history
DELETE /history/{id}           # Delete history entry
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- MongoDB Atlas account
- Google Gemini API key

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python -m app.main
```

## Development Roadmap

1. ✅ **Phase 1:** OCR + Single Product Analysis
2. ✅ **Phase 2:** RAG + Ingredient Explanations
3. ✅ **Phase 3:** Nutrition Analysis + AI Chat
4. ✅ **Phase 4:** Product Comparison
5. ✅ **Phase 5:** Authentication + History
6. ✅ **Phase 6:** Deployment & Polish

## Knowledge Base Setup (required for RAG)

Drop reference PDFs (ingredient glossaries, FDA/WHO guidance, allergen sheets) into
`knowledge_base/`, then build the vector store once:

```bash
curl -X POST http://localhost:8000/admin/build-knowledge-base
```

Re-run this any time you add or update documents in `knowledge_base/`.

## Environment Variables

Create `.env` files in both frontend and backend:

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

## License

MIT

## Author

Built with ❤️ for health-conscious consumers
