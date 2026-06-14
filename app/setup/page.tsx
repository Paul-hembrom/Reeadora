import fs from 'fs';
import path from 'path';

export default function SetupInstructions() {
  return (
    <div className="max-w-3xl mx-auto prose prose-blue prose-p:text-gray-600 prose-headings:text-gray-900 bg-white p-8 rounded-xl border border-gray-200 mt-8">
      <h1>Readora Integration Instructions</h1>
      
      <h3>1. Environment Configuration</h3>
      <p>Ensure the following are set in the Gateway app&apos;s environment:</p>
      <ul>
        <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
        <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
        <li><code>SUPABASE_SERVICE_ROLE_KEY</code></li>
        <li><code>JWT_SECRET</code> (Must perfectly match the Readora app secret)</li>
      </ul>

      <h3>2. Readora Express Server Snippet</h3>
      <p>This is the required token exchange route for the main Readora app API. Place this before any authentication middleware blocks in the main app to finalize the seamless handoff.</p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`app.get('/auth/token-exchange', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Missing token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token is valid; set cookie (same as existing login does)
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    // Redirect to the main app (workspace will load organisation automatically)
    res.redirect('/');
  } catch (err) {
    res.status(401).send('Invalid token');
  }
});`}
      </pre>

      <p className="mt-8 text-sm text-gray-500">For the complete codebase and structure, check the generated Next.js application files.</p>
    </div>
  );
}
