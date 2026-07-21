import { createUserClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'

type OnboardingPayload = {
  children?: Array<{
    avatar_url?: string
    birth_date: string
    grade?: number
    interests?: string[]
    name: string
  }>
  hiveName?: string
  pairs?: Array<{ child1_index: number; child2_index: number; relationship_type?: string }>
  assessment?: Record<string, unknown>
  settings?: Record<string, unknown>
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    const context = await resolveContext(request)
    if (context.role !== 'parent') {
      return Response.json({ error: 'Only a parent can create a hive.' }, { status: 403 })
    }

    const token = request.headers.get('authorization')!.slice('Bearer '.length)
    const payload = (await request.json()) as OnboardingPayload
    if (!payload.hiveName || !payload.children || !payload.pairs) {
      return Response.json({ error: 'Hive name, children, and sibling pairs are required.' }, { status: 400 })
    }

    const client = createUserClient(token)
    const { data, error } = await client.rpc('complete_hive_onboarding', {
      p_assessment: payload.assessment ?? {},
      p_children: payload.children,
      p_hive_name: payload.hiveName,
      p_pairs: payload.pairs,
      p_settings: payload.settings ?? {},
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    return unauthorized(error)
  }
}
