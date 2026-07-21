import OpenAI from 'openai'

export type ActivityDraft = {
  category: 'honey_making' | 'pollen_gathering' | 'pollination' | 'hive_heart' | 'honeycomb_treasure'
  description: string
  difficulty: 1 | 2 | 3
  durationMinutes: number
  instructions: string
  nectarReward: number
  title: string
}

export type PromptDraft = {
  category: 'fun' | 'deep' | 'gratitude' | 'sibling' | 'future'
  questionText: string
}

export const shouldAutoApprove = (confidence: number | null | undefined) =>
  typeof confidence === 'number' && confidence > 80

export const fallbackActivity: ActivityDraft = {
  category: 'honey_making',
  description: 'Create a small kindness plan together and carry out one part today.',
  difficulty: 1,
  durationMinutes: 15,
  instructions: 'Each sibling names one helpful action. Choose one action, do it together, then share one thing that felt good.',
  nectarReward: 20,
  title: 'Kindness Crew',
}

export const fallbackPrompt: PromptDraft = {
  category: 'gratitude',
  questionText: 'What is one small thing your sibling did recently that you appreciated?',
}

const activitySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'instructions', 'category', 'difficulty', 'durationMinutes', 'nectarReward'],
  properties: {
    title: { type: 'string' }, description: { type: 'string' }, instructions: { type: 'string' },
    category: { type: 'string', enum: ['honey_making', 'pollen_gathering', 'pollination', 'hive_heart', 'honeycomb_treasure'] },
    difficulty: { type: 'integer', enum: [1, 2, 3] }, durationMinutes: { type: 'integer', minimum: 5, maximum: 120 },
    nectarReward: { type: 'integer', minimum: 1, maximum: 500 },
  },
}

const promptSchema = {
  type: 'object', additionalProperties: false, required: ['category', 'questionText'],
  properties: { category: { type: 'string', enum: ['fun', 'deep', 'gratitude', 'sibling', 'future'] }, questionText: { type: 'string' } },
}

const parseJson = <T>(value: string): T => JSON.parse(value) as T

const client = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI is not configured.')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export const generateActivity = async (input: { ages: number[]; interests: string[]; previousTitle?: string }) => {
  const response = await client().responses.create({
    model: process.env.OPENAI_TERRA_MODEL ?? 'gpt-5.6-terra',
    store: false,
    instructions: 'Create one inclusive, low-risk, family-only sibling activity. Do not request identifying information, medical advice, secrets, or unsafe physical tasks. Return only the requested JSON.',
    input: `Sibling ages: ${input.ages.join(', ')}. Interests: ${input.interests.join(', ') || 'not provided'}. Avoid repeating: ${input.previousTitle ?? 'none'}.`,
    text: { format: { type: 'json_schema', name: 'sibhive_activity', strict: true, schema: activitySchema } },
  })
  return parseJson<ActivityDraft>(response.output_text)
}

export const generatePrompt = async (input: { ages: number[]; interests: string[] }) => {
  const response = await client().responses.create({
    model: process.env.OPENAI_TERRA_MODEL ?? 'gpt-5.6-terra',
    store: false,
    instructions: 'Write one short, positive sibling reflection prompt. Do not ask for identifying information, secrets, distressing disclosures, or mature topics. Return only the requested JSON.',
    input: `Sibling ages: ${input.ages.join(', ')}. Interests: ${input.interests.join(', ') || 'not provided'}.`,
    text: { format: { type: 'json_schema', name: 'sibhive_daily_prompt', strict: true, schema: promptSchema } },
  })
  return parseJson<PromptDraft>(response.output_text)
}

export const verifyImageCompletion = async (imageUrl: string, instructions: string) => {
  const response = await client().responses.create({
    model: process.env.OPENAI_VISION_MODEL ?? process.env.OPENAI_TERRA_MODEL ?? 'gpt-5.6-terra',
    store: false,
    instructions: 'Assess whether the image is plausible evidence that the stated family activity was completed. Never identify people or infer sensitive traits. Return only a number from 0 to 100 representing confidence.',
    input: [{ role: 'user', content: [{ type: 'input_text', text: `Activity instructions: ${instructions}` }, { type: 'input_image', image_url: imageUrl, detail: 'low' }] }],
  })
  const confidence = Number.parseFloat(response.output_text)
  return Number.isFinite(confidence) ? Math.max(0, Math.min(100, confidence)) : 0
}
