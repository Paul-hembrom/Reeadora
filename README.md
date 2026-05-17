# Readora Schools Gateway

This is the multi-school onboarding and gateway Next.js application that sits in front of the existing Readora platform. It allows schools to self-onboard, admins to create classes (organizations), and provides a password-gated entry point for students and teachers. Be sure to use the exact same Supabase project!

## Deployment & Setup Instructions

1. **Environment Variables**
   Configure your environment by duplicating `.env.example` into `.env` and filling in:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="YOUR_EXISTING_SUPABASE_URL"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_EXISTING_SUPABASE_ANON_KEY"
   SUPABASE_SERVICE_ROLE_KEY="YOUR_EXISTING_SUPABASE_SERVICE_ROLE_KEY"
   
   JWT_SECRET="MUST_MATCH_READORA_JWT_SECRET"
   NEXT_PUBLIC_READORA_URL="https://redora.alphanexoraai.com"
   ```

2. **Supabase Auth Configuration**
   In the Supabase console, go to **Authentication > URL Configuration** and add this Gateway app's URL (e.g. `https://schools.readora.app`) to your Site URL or additional redirect URLs.
   Also ensure Google OAuth is configured and enabled.

3. **Deploy the Gateway**
   You can deploy this Next.js app to Vercel, Cloud Run, or any hosting provider. Make sure to set the environment variables in the host!

## Required Addition to Main Readora App

To make the seamless authentication work, you must add the following tiny, non-destructive route to the **existing Readora Express.js server**. This must be placed *before* any authentication middleware.

```javascript
// Add this route in the main Readora server (before any auth middleware)
app.get('/auth/token-exchange', (req, res) => {
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
});
```

That's it! No other changes to the Readora codebase are required. The gateway seamlessly handles assigning users to organisations, managing passwords, and handing off the correct JWT to the main application.
