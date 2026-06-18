import express from 'express';
import session from 'express-session';
import path from 'path';
import { initSchema } from './db';
import { webRouter } from './routes/web';
import { apiRouter } from './routes/api';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Create tables on startup.
initSchema();

// View engine (server-rendered EJS + Bootstrap).
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing for HTML forms and JSON API.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static assets.
app.use('/static', express.static(path.join(__dirname, 'public')));

// Sessions for the UI (cookie-based).
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'local-dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 },
  })
);

// Make session info available to all views.
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? { username: req.session.username, fullName: req.session.fullName }
    : null;
  next();
});

// Health check — handy for CI to confirm the server is up.
// Registered before the web router so the login guard doesn't intercept it.
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// JSON API (token auth) and the HTML UI (session auth).
app.use('/api', apiRouter);
app.use('/', webRouter);

app.listen(PORT, () => {
  console.log(`HR app running at http://localhost:${PORT}`);
});
