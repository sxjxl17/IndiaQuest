
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const crypto = require("crypto");
 
const app = express();
const PORT = process.env.PORT || 4000;
 
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
 
   
 
const destinations = [
  { id: "maheshwar", name: "Maheshwar", state: "Madhya Pradesh", lat: 22.1786, lng: 75.6119, categories: ["heritage", "riverside"], hiddenGem: true },
  { id: "mandu", name: "Mandu", state: "Madhya Pradesh", lat: 22.3676, lng: 75.3833, categories: ["heritage"], hiddenGem: true },
  { id: "hampi", name: "Hampi", state: "Karnataka", lat: 15.335, lng: 76.46, categories: ["heritage", "unesco"], hiddenGem: false },
  { id: "majuli", name: "Majuli", state: "Assam", lat: 26.952, lng: 94.174, categories: ["nature", "culture"], hiddenGem: true },
  { id: "ziro", name: "Ziro Valley", state: "Arunachal Pradesh", lat: 27.5486, lng: 93.832, categories: ["nature", "offbeat"], hiddenGem: true },
  { id: "gokarna", name: "Gokarna", state: "Karnataka", lat: 14.549, lng: 74.319, categories: ["beach", "spiritual"], hiddenGem: true },
  { id: "spiti", name: "Spiti Valley", state: "Himachal Pradesh", lat: 32.246, lng: 78.017, categories: ["mountains", "offbeat"], hiddenGem: true },
  { id: "bundi", name: "Bundi", state: "Rajasthan", lat: 25.4305, lng: 75.6499, categories: ["heritage"], hiddenGem: true },
  { id: "munnar", name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595, categories: ["mountains", "nature"], hiddenGem: false },
  { id: "kanyakumari", name: "Kanyakumari", state: "Tamil Nadu", lat: 8.0883, lng: 77.5385, categories: ["spiritual", "beach"], hiddenGem: false },
  { id: "rishikesh", name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676, categories: ["spiritual", "adventure"], hiddenGem: false },
  { id: "leh", name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, categories: ["mountains", "adventure"], hiddenGem: false },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, categories: ["spiritual", "heritage"], hiddenGem: false },
  { id: "darjeeling", name: "Darjeeling", state: "West Bengal", lat: 27.041, lng: 88.2663, categories: ["mountains"], hiddenGem: false },
  { id: "amritsar", name: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723, categories: ["spiritual", "heritage"], hiddenGem: false },
  { id: "rann-of-kutch", name: "Rann of Kutch", state: "Gujarat", lat: 23.83, lng: 69.86, categories: ["nature", "culture"], hiddenGem: true },
  { id: "puri", name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312, categories: ["spiritual", "beach"], hiddenGem: false },
  { id: "araku-valley", name: "Araku Valley", state: "Andhra Pradesh", lat: 18.3273, lng: 82.877, categories: ["nature", "offbeat"], hiddenGem: true },
  { id: "gangtok", name: "Gangtok", state: "Sikkim", lat: 27.3389, lng: 88.6065, categories: ["mountains"], hiddenGem: false },
];
 
const services = [
  { id: "svc-1", type: "guide", name: "Ravi Kumar", destination: "hampi", verified: true, fairPriceINR: 800, rating: 4.8 },
  { id: "svc-2", type: "homestay", name: "Riverside Homestay", destination: "maheshwar", verified: true, fairPriceINR: 1500, rating: 4.6 },
  { id: "svc-3", type: "driver", name: "Suresh Travels", destination: "leh", verified: true, fairPriceINR: 3500, rating: 4.7 },
  { id: "svc-4", type: "guide", name: "Tenzin Norbu", destination: "gangtok", verified: false, fairPriceINR: 1000, rating: 4.2 },
  { id: "svc-5", type: "restaurant", name: "Ganga View Cafe", destination: "rishikesh", verified: true, fairPriceINR: 400, rating: 4.5 },
];
 
// Crowdsourced issue reports, e.g. cleanliness / overcharging / safety / infra
const reports = [
  { id: "rep-1", destination: "hampi", category: "overcharging", note: "Auto fare double the fair-price guide", createdAt: "2026-09-10T10:00:00Z", status: "open" },
  { id: "rep-2", destination: "varanasi", category: "cleanliness", note: "Litter near the main ghat steps", createdAt: "2026-09-14T08:30:00Z", status: "resolved" },
  { id: "rep-3", destination: "leh", category: "infrastructure", note: "Signage missing at the main junction", createdAt: "2026-09-16T14:15:00Z", status: "open" },
];
 
// Demo users (passwords are salted+hashed with Node's built-in crypto; no
// external auth dependency needed for this prototype)
const users = [];
 
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}
 
function verifyPassword(password, salt, hash) {
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(check), Buffer.from(hash));
}
 
function issueToken(username) {
  // Lightweight signed token for demo purposes (swap for JWT in production)
  const payload = Buffer.from(JSON.stringify({ username, iat: Date.now() })).toString("base64url");
  const signature = crypto.createHmac("sha256", "indiaquest-demo-secret").update(payload).digest("hex");
  return `${payload}.${signature}`;
}
 
/* ============================================================
   DESTINATIONS
   ============================================================ */
 
app.get("/api/destinations", (req, res) => {
  const { category, hiddenGem } = req.query;
  let result = destinations;
  if (category) result = result.filter((d) => d.categories.includes(category));
  if (hiddenGem === "true") result = result.filter((d) => d.hiddenGem);
  res.json({ count: result.length, destinations: result });
});
 
app.get("/api/destinations/:id", (req, res) => {
  const dest = destinations.find((d) => d.id === req.params.id);
  if (!dest) return res.status(404).json({ error: "Destination not found" });
  res.json(dest);
});
 
/* ============================================================
   ITINERARY PLANNER
   ------------------------------------------------------------
   Simple rule-based day-by-day planner: spreads chosen destinations
   across the requested number of days and tags each day with a pace
   hint. A production version swaps this for the ML personalisation
   layer described in the pitch deck.
   ============================================================ */
 
app.post("/api/itinerary", (req, res) => {
  const { destinationIds = [], days = 3, pace = "moderate", budgetINR } = req.body;
 
  const chosen = destinations.filter((d) => destinationIds.includes(d.id));
  if (chosen.length === 0) {
    return res.status(400).json({ error: "Provide at least one valid destinationId" });
  }
 
  const plan = Array.from({ length: Number(days) }, (_, i) => {
    const stop = chosen[i % chosen.length];
    return {
      day: i + 1,
      destination: stop.name,
      state: stop.state,
      suggestedPace: pace,
      estimatedSpendINR: budgetINR ? Math.round(budgetINR / days) : undefined,
      tips: [`Explore ${stop.categories.join(" & ")} highlights`, "Check verified guides for this stop"],
    };
  });
 
  res.json({ days: Number(days), pace, itinerary: plan });
});
 
/* ============================================================
   VERIFIED SERVICES (guides / homestays / drivers / restaurants)
   ============================================================ */
 
app.get("/api/services", (req, res) => {
  const { destination, type, verifiedOnly } = req.query;
  let result = services;
  if (destination) result = result.filter((s) => s.destination === destination);
  if (type) result = result.filter((s) => s.type === type);
  if (verifiedOnly === "true") result = result.filter((s) => s.verified);
  res.json({ count: result.length, services: result });
});
 
/* ============================================================
   CROWDSOURCED REPORTS (feeds the Tourist Experience Index)
   ============================================================ */
 
app.get("/api/reports", (req, res) => {
  const { destination, status } = req.query;
  let result = reports;
  if (destination) result = result.filter((r) => r.destination === destination);
  if (status) result = result.filter((r) => r.status === status);
  res.json({ count: result.length, reports: result });
});
 
app.post("/api/reports", (req, res) => {
  const { destination, category, note } = req.body;
  if (!destination || !category) {
    return res.status(400).json({ error: "destination and category are required" });
  }
  const report = {
    id: `rep-${reports.length + 1}`,
    destination,
    category,
    note: note || "",
    createdAt: new Date().toISOString(),
    status: "open",
  };
  reports.push(report);
  res.status(201).json(report);
});
 
/* ============================================================
   INTELLIGENCE DASHBOARD (authorities / business view)
   ============================================================ */
 
app.get("/api/dashboard/stats", (req, res) => {
  const openReports = reports.filter((r) => r.status === "open").length;
  const resolvedReports = reports.filter((r) => r.status === "resolved").length;
 
  const reportsByCategory = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
 
  // Toy "Tourist Experience Index": starts at 100, docked for open issues
  const touristExperienceIndex = Math.max(0, 100 - openReports * 5);
 
  res.json({
    totalDestinations: destinations.length,
    hiddenGemDestinations: destinations.filter((d) => d.hiddenGem).length,
    verifiedServices: services.filter((s) => s.verified).length,
    openReports,
    resolvedReports,
    reportsByCategory,
    touristExperienceIndex,
  });
});
 
/* ============================================================
   AUTH (demo only \u2014 not for production use)
   ============================================================ */
 
app.post("/api/auth/signup", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email and password are required" });
  }
  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ error: "Username already taken" });
  }
  const { salt, hash } = hashPassword(password);
  users.push({ username, email, salt, hash });
  res.status(201).json({ token: issueToken(username) });
});
 
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json({ token: issueToken(username) });
});
 
/* ============================================================
   HEALTH CHECK + ROOT
   ============================================================ */
 
app.get("/", (req, res) => {
  res.json({
    name: "IndiaQuest API",
    status: "ok",
    endpoints: [
      "GET  /api/destinations",
      "GET  /api/destinations/:id",
      "POST /api/itinerary",
      "GET  /api/services",
      "GET  /api/reports",
      "POST /api/reports",
      "GET  /api/dashboard/stats",
      "POST /api/auth/signup",
      "POST /api/auth/login",
    ],
  });
});
 
app.listen(PORT, () => {
  console.log(`IndiaQuest backend running at http://localhost:${PORT}`);
});
 