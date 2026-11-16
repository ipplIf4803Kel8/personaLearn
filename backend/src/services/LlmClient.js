const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const TIMEOUT_MS = 20000
const MAX_OUTPUT_TOKENS = 500

const SAFETY_SETTINGS = ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT'].map(
  (category) => ({ category, threshold: 'BLOCK_MEDIUM_AND_ABOVE' }),
)

// Error terkontrol: hanya pesan ringkas tanpa kunci, URL, atau isi percakapan.
export class LlmError extends Error {
  constructor(message, { status = null, blocked = false } = {}) {
    super(message)
    this.name = 'LlmError'
    this.status = status
    this.blocked = blocked
  }
}

// Model Gemini 3 memakai thinkingLevel, Gemini 2.5 memakai thinkingBudget; lainnya tanpa konfigurasi.
const thinkingConfig = (model) => {
  if (/^gemini-3/.test(model)) return { thinkingLevel: 'minimal' }
  if (/^gemini-2\.5/.test(model)) return { thinkingBudget: 0 }
  return undefined
}

// Klien tipis untuk Gemini generateContent. Dibuat class terpisah supaya mudah diganti atau di-mock.
export class LlmClient {
  #apiKey
  #model
  #fetch

  constructor({ apiKey = process.env.AI_API_KEY, model = process.env.AI_MODEL, fetchFn = fetch } = {}) {
    this.#apiKey = apiKey
    this.#model = model || 'gemini-3.1-flash-lite'
    this.#fetch = fetchFn
  }

  get configured() {
    return Boolean(this.#apiKey)
  }

  // messages: [{ role: 'user' | 'assistant', content }]. Mengembalikan teks balasan, atau melempar LlmError.
  async complete({ system, messages }) {
    if (!this.configured) throw new LlmError('AI_API_KEY belum diatur')
    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.5, thinkingConfig: thinkingConfig(this.#model) },
      safetySettings: SAFETY_SETTINGS,
    }
    let res
    try {
      res = await this.#fetch(`${BASE_URL}/${encodeURIComponent(this.#model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': this.#apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (err) {
      // Pesan error fetch bisa memuat URL; jangan diteruskan.
      throw new LlmError(err?.name === 'TimeoutError' ? 'API LLM timeout' : 'API LLM tidak terjangkau')
    }
    if (!res.ok) throw new LlmError(`API LLM membalas ${res.status}`, { status: res.status })
    return this.#parse(await res.json().catch(() => ({})))
  }

  #parse(data) {
    if (data.promptFeedback?.blockReason) throw new LlmError('Permintaan diblokir LLM', { blocked: true })
    const candidate = data.candidates?.[0]
    if (['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION'].includes(candidate?.finishReason)) {
      throw new LlmError('Balasan diblokir LLM', { blocked: true })
    }
    const text = (candidate?.content?.parts ?? [])
      .filter((p) => typeof p.text === 'string' && !p.thought)
      .map((p) => p.text)
      .join('')
      .trim()
    if (!text) throw new LlmError('Balasan API LLM kosong')
    return text
  }
}
