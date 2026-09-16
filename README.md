# GANSH RAM AI — Vercel Deployment

This is the Vercel-ready version of the original Streamlit + LangChain + Ollama chatbot.

## Important change

The original application uses `ChatOllama`, which requires a running local Ollama server. A Vercel deployment cannot use Ollama running on your personal Windows PC.

This version keeps the chatbot UI and behavior but uses:
- HTML/CSS/JavaScript for the frontend
- Vercel serverless API at `/api/chat`
- Groq API for cloud inference
- `openai/gpt-oss-20b` as the model

## Files

- `index.html` — chatbot UI
- `style.css` — design
- `script.js` — chat logic
- `api/chat.js` — secure server-side Groq call
- `vercel.json` — Vercel configuration
- `package.json` — project metadata

## Deploy

1. Create a GitHub repository.
2. Upload all files from this folder.
3. Import the repository into Vercel.
4. In Vercel Project Settings → Environment Variables, add:
   - Name: `GROQ_API_KEY`
   - Value: your Groq API key
5. Redeploy.
6. Open the generated `.vercel.app` URL.

Never put the Groq API key inside `script.js`, `index.html`, or any public file.

## Local test

You can also deploy with Vercel CLI after installing Node.js:

```bash
npm install -g vercel
vercel
```

For production:

```bash
vercel --prod
```
