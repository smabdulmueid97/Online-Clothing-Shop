// Vercel serverless entry point: export the Express app as a function.
// Vercel's Node runtime calls this for every request rewritten to /api/*
// (see vercel.json). Do NOT call app.listen() here — there is no long-lived
// server on Vercel; each invocation is stateless, which is also why the
// cart lives in the browser (localStorage), not on the server.
const app = require("../app");

module.exports = app;
