import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { createServer } from 'vite'

let server
let client
let session
let resources
let opportunities
const originalFetch = globalThis.fetch
const stored = new Map()
const authResult = {
  userId: 'test-user', email: 'test@example.com', fullName: 'Test', role: 'Mentor',
  accessToken: 'fresh-token', refreshToken: 'fresh-refresh',
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status })

before(async () => {
  globalThis.localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
    removeItem: (key) => stored.delete(key),
  }
  server = await createServer({
    configFile: false, envDir: false,
    server: { middlewareMode: true, watch: null, ws: false },
  })
  session = await server.ssrLoadModule('/src/api/session.ts')
  client = await server.ssrLoadModule('/src/api/client.ts')
  resources = await server.ssrLoadModule('/src/api/resources.ts')
  opportunities = await server.ssrLoadModule('/src/api/opportunities.ts')
})

beforeEach(() => session.setSession({ ...authResult, accessToken: 'expired-token' }))

after(async () => {
  globalThis.fetch = originalFetch
  delete globalThis.localStorage
  await server?.close()
})

test('resources, notifications and opportunities share one refresh and retry with the new token', async () => {
  let refreshes = 0
  let retries = 0
  globalThis.fetch = async (url, init) => {
    if (url.endsWith('/api/auth/refresh')) {
      refreshes++
      await new Promise((resolve) => setTimeout(resolve, 10))
      return json(authResult)
    }
    if (init.headers.get('Authorization') === 'Bearer expired-token') return new Response(null, { status: 401 })
    assert.equal(init.headers.get('Authorization'), 'Bearer fresh-token')
    retries++
    return json(url.includes('opportunities') ? { data: { items: [], pagination: {} } } : [])
  }
  await Promise.all([resources.getResources(), resources.getNotifications(), opportunities.getOpportunities()])
  assert.equal(refreshes, 1)
  assert.equal(retries, 3)
  assert.equal(session.getSession().accessToken, 'fresh-token')
})

test('rejected refresh clears the session and does not loop', async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; return new Response(null, { status: 401 }) }
  await assert.rejects(resources.getResources(), (error) => error.status === 401)
  assert.equal(calls, 2)
  assert.equal(session.getSession(), null)
})

test('forbidden responses preserve the server explanation without refreshing', async () => {
  let calls = 0
  globalThis.fetch = async () => {
    calls++
    return new Response('Only mentors can create resources.', { status: 403 })
  }
  await assert.rejects(resources.createResource({ title: 'Test' }), {
    message: 'Only mentors can create resources.', status: 403,
  })
  assert.equal(calls, 1)
})

test('multipart applications retain their body and browser-generated boundary after refresh', async () => {
  const body = new FormData()
  body.append('document', new Blob(['test']), 'test.txt')
  globalThis.fetch = async (url, init) => {
    if (url.endsWith('/api/auth/refresh')) return json(authResult)
    assert.equal(init.body, body)
    assert.equal(init.headers.has('Content-Type'), false)
    return init.headers.get('Authorization') === 'Bearer expired-token'
      ? new Response(null, { status: 401 }) : json({ data: true })
  }
  assert.equal(await opportunities.applyToOpportunity('test', body), true)
})

test('resource deletion handles an empty 204 response', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 })
  assert.equal(await resources.deleteResource('test'), undefined)
})

test('missing refresh token does not prevent a later signed-in session from refreshing', async () => {
  session.setSession(null)
  globalThis.fetch = async (url, init) => {
    if (url.endsWith('/api/auth/refresh')) return json(authResult)
    return init.headers.get('Authorization') === 'Bearer fresh-token'
      ? json([]) : new Response(null, { status: 401 })
  }
  await assert.rejects(client.apiGet('/api/resources'))
  session.setSession({ ...authResult, accessToken: 'expired-token' })
  assert.deepEqual(await resources.getResources(), [])
})
