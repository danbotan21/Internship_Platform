import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function recordingsDevPlugin(): Plugin {
  return {
    name: 'recordings-dev-plugin',
    configureServer(server) {
      const handleRecordingUpload = async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const recordingsDir = path.resolve(__dirname, '../recorded-sessions')
            if (!fs.existsSync(recordingsDir)) {
              fs.mkdirSync(recordingsDir, { recursive: true })
            }

            const contentType = (req.headers['content-type'] as string) || ''
            let filename = `quiz_session_${Date.now()}.webm`
            let metadataStr: string | null = null
            let videoBuffer: Buffer | null = null

            if (contentType.includes('multipart/form-data')) {
              const fullBuffer = Buffer.concat(chunks)
              const webReq = new Request('http://localhost' + (req.url || ''), {
                method: 'POST',
                headers: {
                  'content-type': contentType,
                },
                body: fullBuffer,
                duplex: 'half',
              } as RequestInit)

              const formData = await webReq.formData()
              const videoField = formData.get('video')
              const formFilename = formData.get('filename') as string | null
              const formMetadata = formData.get('metadata') as string | null

              if (formFilename) {
                filename = formFilename
              } else if (videoField && typeof videoField === 'object' && 'name' in videoField && videoField.name) {
                filename = videoField.name
              }

              if (formMetadata) {
                metadataStr = formMetadata
              }

              if (videoField && typeof videoField === 'object' && 'arrayBuffer' in videoField) {
                const arrayBuffer = await (videoField as Blob).arrayBuffer()
                if (arrayBuffer.byteLength > 0) {
                  videoBuffer = Buffer.from(arrayBuffer)
                }
              }
            } else if (contentType.includes('application/json')) {
              // Legacy JSON Base64 support
              const rawBody = Buffer.concat(chunks).toString('utf-8')
              const body = JSON.parse(rawBody)
              if (body.filename) filename = body.filename
              if (body.metadata) {
                metadataStr = typeof body.metadata === 'string' ? body.metadata : JSON.stringify(body.metadata, null, 2)
              }
              if (body.videoBase64) {
                videoBuffer = Buffer.from(body.videoBase64, 'base64')
              }
            }

            const cleanFileName = path.basename(filename)
            const ext = path.extname(cleanFileName) || '.webm'
            const baseName = cleanFileName.replace(/\.[^/.]+$/, '')

            let savedVideoPath: string | null = null
            if (videoBuffer && videoBuffer.length > 0) {
              const videoPath = path.join(recordingsDir, `${baseName}${ext}`)
              fs.writeFileSync(videoPath, videoBuffer)
              savedVideoPath = `recorded-sessions/${baseName}${ext}`
              console.log(`[DevServer] Successfully wrote binary video file: ${savedVideoPath} (${videoBuffer.length} bytes)`)
            } else {
              console.warn(`[DevServer] No video bytes received for ${cleanFileName}`)
            }

            let savedMetaPath: string | null = null
            if (metadataStr) {
              const metaFileName = `${baseName}_meta.json`
              const metaPath = path.join(recordingsDir, metaFileName)
              let formattedMeta = metadataStr
              try {
                formattedMeta = JSON.stringify(JSON.parse(metadataStr), null, 2)
              } catch {
                // keep as is
              }
              fs.writeFileSync(metaPath, formattedMeta)
              savedMetaPath = `recorded-sessions/${metaFileName}`
              console.log(`[DevServer] Successfully saved session metadata: ${savedMetaPath}`)
            }

            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(
              JSON.stringify({
                success: true,
                message: 'Recording saved to repository successfully.',
                videoPath: savedVideoPath,
                metadataPath: savedMetaPath,
                fileName: `${baseName}${ext}`,
              })
            )
          } catch (err: unknown) {
            const error = err as Error
            console.error('[DevServer] Error saving recording:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                success: false,
                error: error.message || 'Failed to save recording in dev server',
              })
            )
          }
        })
      }

      const handleQuizResults = async (req: any, res: any) => {
        const resultsFilePath = path.resolve(__dirname, '../recorded-sessions/quiz_results.json')
        const recordingsDir = path.dirname(resultsFilePath)
        if (!fs.existsSync(recordingsDir)) {
          fs.mkdirSync(recordingsDir, { recursive: true })
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          if (fs.existsSync(resultsFilePath)) {
            try {
              const data = fs.readFileSync(resultsFilePath, 'utf-8')
              res.statusCode = 200
              res.end(data || '[]')
              return
            } catch (err) {
              console.error('[DevServer] Error reading quiz_results.json:', err)
            }
          }
          res.statusCode = 200
          res.end('[]')
          return
        }

        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => chunks.push(chunk))
          req.on('end', () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf-8')
              const newAttempt = JSON.parse(rawBody)

              let existing: any[] = []
              if (fs.existsSync(resultsFilePath)) {
                try {
                  const data = fs.readFileSync(resultsFilePath, 'utf-8')
                  if (data) existing = JSON.parse(data)
                } catch {
                  existing = []
                }
              }

              const updated = [newAttempt, ...existing.filter((a: any) => a.id !== newAttempt.id)]
              fs.writeFileSync(resultsFilePath, JSON.stringify(updated, null, 2))
              console.log(`[DevServer] Saved user quiz attempt to database: ${newAttempt.userName} - ${newAttempt.quizTitle} (${newAttempt.percentage}%)`)

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, count: updated.length, attempt: newAttempt }))
            } catch (err: any) {
              console.error('[DevServer] Error saving quiz result:', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: err.message }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end('Method Not Allowed')
      }

      server.middlewares.use('/api/recordings/upload', handleRecordingUpload)
      server.middlewares.use('/api/save-recording', handleRecordingUpload)
      server.middlewares.use('/api/quiz-results', handleQuizResults)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), recordingsDevPlugin()],
})
