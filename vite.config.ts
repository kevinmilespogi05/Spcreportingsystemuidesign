import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// ─── Figma Asset Resolver ─────────────────────────────────────────────────────

function figmaAssetResolver(): Plugin {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// ─── Backend API Plugin ───────────────────────────────────────────────────────
//
// Creates a real server-side endpoint:  GET /api/complaints/stats
//
// Uses SUPABASE_SERVICE_ROLE_KEY (no VITE_ prefix = never bundled into client JS)
// Bypasses RLS safely (server-side only via Vite dev-server middleware)
// Returns ONLY aggregated numbers — no raw rows ever exposed
// Keeps RLS policies intact (important for capstone)
//
// env is populated by loadEnv(mode, cwd, '') which reads ALL .env vars,
// including non-VITE_ ones. This is the canonical Vite pattern for secrets.

function complaintsStatsApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'complaints-stats-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/complaints/stats' || req.method !== 'GET') {
          return next()
        }

        const SUPABASE_URL = env['VITE_SUPABASE_URL']
        const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

        if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === 'your-service-role-key-here') {
          console.warn(
            '[/api/complaints/stats] SUPABASE_SERVICE_ROLE_KEY is missing in .env — returning zeros.'
          )
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ total: 0, in_progress: 0, resolved: 0, _warning: 'service role key not configured' }))
          return
        }

        try {
          const { createClient } = await import('@supabase/supabase-js')
          const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
          })

          const [totalRes, inProgressRes, resolvedRes] = await Promise.all([
            admin.from('complaints').select('*', { count: 'exact', head: true }),
            admin.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'In Progress'),
            admin.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Resolved'),
          ])

          if (totalRes.error) throw new Error(totalRes.error.message)
          if (inProgressRes.error) throw new Error(inProgressRes.error.message)
          if (resolvedRes.error) throw new Error(resolvedRes.error.message)

          const payload = {
            total: totalRes.count ?? 0,
            in_progress: inProgressRes.count ?? 0,
            resolved: resolvedRes.count ?? 0,
          }

          console.log('[/api/complaints/stats] OK', payload)
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
          res.end(JSON.stringify(payload))
        } catch (err) {
          console.error('[/api/complaints/stats] Error:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Failed to fetch complaint stats' }))
        }
      })
    },
  }
}

// ─── Vite Config ─────────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => {
  // loadEnv with prefix='' reads ALL vars from .env — including SUPABASE_SERVICE_ROLE_KEY
  // (vars without a VITE_ prefix are blocked from the browser bundle by Vite's design,
  //  so this is the correct way to access server-side secrets in a Vite plugin).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      figmaAssetResolver(),
      complaintsStatsApiPlugin(env),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
