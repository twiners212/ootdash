import app from './app.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Only listen on port when not running in Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 OOTDash Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Dashboard:    GET http://localhost:${PORT}/api/dashboard?lat=X&lon=Y\n`);
  });
}

export default app;
