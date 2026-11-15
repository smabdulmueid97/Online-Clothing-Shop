// Local dev entry point only. Vercel does NOT use this file —
// it uses api/index.js (see DEPLOY.md).
const app = require("./app");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Online Clothing Shop (Node starter) on http://localhost:${PORT}`);
});
