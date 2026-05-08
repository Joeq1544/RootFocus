import { GoogleGenerativeAI } from '@google/generative-ai'

const getClient = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set')
  return new GoogleGenerativeAI(apiKey)
}

/** Returns a Gemini generative model instance. Defaults to gemini-pro. */
export function getGeminiModel(modelName = 'gemini-pro') {
  return getClient().getGenerativeModel({ model: modelName })
}
