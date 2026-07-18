// Single dispatcher for every scheduled job, routed by ?job=<name>.
// Vite (unbundled) projects are capped at 12 Vercel Functions per deployment
// on the Hobby plan — one function per api/*.js file, no auto-bundling like
// Next.js gets. HUB already had 11 routes; registering each of these 6 jobs
// as its own cron target would have pushed that to 17 and broken every route
// in the deployment. This keeps the count at 12 while still running all 6.
//
// The job handlers themselves (api/_jobs/*.js) are untouched — each already
// does its own `Authorization: Bearer CRON_SECRET` check and takes (req, res)
// directly, so this just forwards the same request through.

const JOBS = {
  'daily-briefing':    () => import('../_jobs/daily-briefing.js'),
  'process-queue':     () => import('../_jobs/process-queue.js'),
  'check-alerts':      () => import('../_jobs/check-alerts.js'),
  'sync-all-accounts': () => import('../_jobs/sync-all-accounts.js'),
  'release-expired':   () => import('../_jobs/release-expired.js'),
  'weekly-report':     () => import('../_jobs/weekly-report.js'),
};

export default async function handler(req, res) {
  const job = req.query?.job;
  const loader = JOBS[job];
  if (!loader) return res.status(400).json({ error: `Unknown job: ${job}` });

  const mod = await loader();
  return mod.default(req, res);
}
