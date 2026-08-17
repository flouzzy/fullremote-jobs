/**
 * FullRemote-Jobs - Moteur d'Ingestion & Normalisation Multi-Sources
 * Sources : Remotive, Jobicy, Arbeitnow, RemoteOK, We Work Remotely, Hacker News
 */

const USER_AGENT = "FullRemoteJobsBot/1.0 (+https://fullremote-jobs.edounze.com; contact@edounze.com)";

/**
 * Nettoie et extrait un texte propre à partir d'un fragment HTML ou XML
 */
export function stripHtml(html = "") {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalisation avancée des salaires (€ et $)
 */
export function parseSalaryDetails(rawSalary = "") {
  if (!rawSalary) {
    return {
      raw: "",
      min_eur: 0,
      max_eur: 0,
      min_usd: 0,
      max_usd: 0,
      currency: "EUR",
    };
  }

  const clean = rawSalary.replace(/\s+/g, " ").trim();
  const isHourly = /\b(hour|hr|heure|h|tjm|jour|day)\b/i.test(clean);
  const isEur = /€|\beur\b/i.test(clean);
  const isUsd = /\$|\busd\b/i.test(clean);
  const isGbp = /£|\bgbp\b/i.test(clean);

  // Extraction des montants numériques
  const numbers = (clean.match(/\d+[\d\s,.]*/g) || [])
    .map((n) => parseInt(n.replace(/[\s,.]/g, ""), 10))
    .filter((n) => !isNaN(n) && n > 0);

  if (numbers.length === 0) {
    return {
      raw: clean,
      min_eur: 0,
      max_eur: 0,
      min_usd: 0,
      max_usd: 0,
      currency: isEur ? "EUR" : "USD",
    };
  }

  let min = numbers[0];
  let max = numbers.length > 1 ? numbers[1] : min;

  // Conversion taux horaire / journalier vers équivalent annuel indicatif (~1900h / an)
  if (isHourly && min < 1000) {
    min = min * 1900;
    max = max * 1900;
  }

  let min_eur = min;
  let max_eur = max;
  let min_usd = min;
  let max_usd = max;
  let currency = "EUR";

  if (isEur) {
    currency = "EUR";
    min_eur = min;
    max_eur = max;
    min_usd = Math.round(min * 1.08);
    max_usd = Math.round(max * 1.08);
  } else if (isGbp) {
    currency = "GBP";
    min_eur = Math.round(min * 1.17);
    max_eur = Math.round(max * 1.17);
    min_usd = Math.round(min * 1.27);
    max_usd = Math.round(max * 1.27);
  } else {
    currency = "USD";
    min_usd = min;
    max_usd = max;
    min_eur = Math.round(min / 1.08);
    max_eur = Math.round(max / 1.08);
  }

  return { raw: clean, min_eur, max_eur, min_usd, max_usd, currency };
}

/**
 * Filtre anti-faux remote (élimine les annonces avec présence obligatoire sur site)
 */
export function isStrictlyRemote(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  const antiRemoteKeywords = [
    "hybrid schedule",
    "days in office",
    "days a week in office",
    "must be located in",
    "must relocate",
    "présence obligatoire",
    "jours de présence",
    "télétravail partiel",
  ];
  return !antiRemoteKeywords.some((k) => text.includes(k));
}

/**
 * Détection précise de la zone géographique
 */
export function detectRegion(location = "", title = "", tags = []) {
  const text = `${location} ${title} ${tags.join(" ")}`.toLowerCase();

  // 1. France & Francophonie
  if (
    /\b(france|paris|french|francophone|lyon|bordeaux|toulouse|nantes|lille|marseille|montpellier|strasbourg|rennes|grenoble|belgique|belgium|bruxelles|brussels|suisse|switzerland|geneva|gen[eè]ve|lausanne|montr[eé]al|qu[eé]bec)\b/i.test(
      text
    )
  ) {
    return {
      id: "france",
      label: "France & Francophonie",
      flag: "🇫🇷",
    };
  }

  // 2. Amériques
  if (
    /\b(usa|us|united states|north america|canada|latam|latin america|brazil|brasil|mexico|colombia|argentina|chile|americas|san francisco|new york|austin|seattle|chicago)\b/i.test(
      text
    )
  ) {
    return {
      id: "americas",
      label: "Amériques",
      flag: "🇺🇸",
    };
  }

  // 3. Europe & UK
  if (
    /\b(europe|eu|emea|uk|united kingdom|london|germany|deutschland|berlin|munich|hamburg|spain|españa|madrid|barcelona|italy|italia|milan|rome|poland|polska|warsaw|netherlands|amsterdam|rotterdam|portugal|lisbon|porto|ireland|dublin|sweden|stockholm|norway|oslo|finland|helsinki|denmark|copenhagen|austria|vienna|estonia|tallinn|czech|prague|romania|bucharest)\b/i.test(
      text
    )
  ) {
    return {
      id: "europe",
      label: "Europe",
      flag: "🇪🇺",
    };
  }

  // 4. Asie, Pacifique, Moyen-Orient & Afrique
  if (
    /\b(asia|apac|singapore|japan|tokyo|india|bangalore|delhi|mumbai|australia|sydney|melbourne|new zealand|auckland|middle east|mea|africa|israel|tel aviv|dubai|uae|south africa|cape town|nairobi|lagos)\b/i.test(
      text
    )
  ) {
    return {
      id: "apac_mea",
      label: "Asie & MEA",
      flag: "🌏",
    };
  }

  // 5. Par défaut : Worldwide
  return {
    id: "worldwide",
    label: "Worldwide",
    flag: "🌍",
  };
}

/**
 * Détection du type de contrat (CDI, Freelance, CDD, Stage)
 */
export function detectContractType(title = "", rawJobType = "", description = "", tags = []) {
  const text = `${title} ${rawJobType} ${tags.join(" ")} ${description.slice(0, 600)}`.toLowerCase();

  if (/\b(stage|alternance|internship|intern|apprenticeship|trainee|student job|working student)\b/i.test(text)) {
    return { id: "internship", label: "Stage / Alternance", icon: "🎓", badge: "Stage / Intern" };
  }

  if (
    /\b(freelance|contract|contractor|contractuel|ind[eé]pendant|b2b|subcontract|hourly|per hour|\/hour|\/hr|mission|consultant|freelancing)\b/i.test(
      text
    )
  ) {
    return { id: "freelance_contract", label: "Freelance / Contract", icon: "⚡", badge: "Freelance / Contract" };
  }

  if (/\b(cdd|part-time|part time|temps partiel|temporary|temp|dur[eé]e d[eé]termin[eé]e|int[eé]rim)\b/i.test(text)) {
    return { id: "cdd_parttime", label: "CDD / Part-time", icon: "⏱️", badge: "CDD / Part-time" };
  }

  return { id: "cdi_fulltime", label: "CDI / Full-time", icon: "💼", badge: "CDI / Full-time" };
}

/**
 * Détection de la langue de l'annonce
 */
export function detectLanguage(title = "", description = "", tags = []) {
  const text = `${title} ${description.slice(0, 800)} ${tags.join(" ")}`.toLowerCase();
  const frCount = (
    text.match(
      /\b(développeur|développeuse|ingénieur|ingénieure|chef de projet|télétravail|francophone|français|française|stage|alternance|cdi|cdd|poste|missions|profil|avec|pour|notre|nous|vous|dans|expérience|équipe|recherchons|compétences|société|client)\b/gi
    ) || []
  ).length;

  return frCount >= 2 ? "fr" : "en";
}

/**
 * Catégorisation standardisée du métier
 */
export function categorizeJob(title = "", rawCategory = "", tags = []) {
  const text = `${title} ${rawCategory} ${tags.join(" ")}`.toLowerCase();

  if (
    /\b(devops|sre|cloud|kubernetes|aws|gcp|azure|infrastructure|sysadmin|security|cybersecurity|secops|platform engineer)\b/i.test(
      text
    )
  ) {
    return { id: "devops", name: "DevOps & Cloud", icon: "☁️" };
  }

  if (
    /\b(ai|ml|machine learning|data engineer|data scientist|deep learning|llm|nlp|data analyst|bi|analytics|rag)\b/i.test(
      text
    )
  ) {
    return { id: "data_ai", name: "Data & IA", icon: "🧠" };
  }

  if (
    /\b(frontend|backend|fullstack|software|developer|engineer|react|node|python|golang|rust|java|php|typescript|javascript|ruby|c\+\+|ios|android|mobile|web|lead dev|tech lead)\b/i.test(
      text
    )
  ) {
    return { id: "tech", name: "Tech & Dev", icon: "💻" };
  }

  if (
    /\b(design|designer|ui|ux|product design|figma|brand|graphic|illustrator|creative)\b/i.test(
      text
    )
  ) {
    return { id: "design", name: "Design & UX", icon: "🎨" };
  }

  if (
    /\b(product manager|product owner|project manager|scrum|program manager|cpo|head of product)\b/i.test(
      text
    )
  ) {
    return { id: "product", name: "Product & Management", icon: "🚀" };
  }

  if (
    /\b(marketing|seo|growth|content|sales|account executive|business development|copywriter|community|customer success)\b/i.test(
      text
    )
  ) {
    return { id: "marketing_sales", name: "Marketing & Sales", icon: "📈" };
  }

  return { id: "other", name: "Autres & Support", icon: "💼" };
}

/**
 * Fetch HTTP sécurisé avec timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json, application/rss+xml, text/xml, text/plain, */*",
        ...(options.headers || {}),
      },
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Parseur XML ultra-léger pour flux RSS
 */
function parseRssItems(xmlText = "") {
  const items = [];
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const itemXml of itemMatches) {
    const titleMatch =
      itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ||
      itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const descMatch =
      itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
      itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const regionMatch = itemXml.match(/<region>([\s\S]*?)<\/region>/i);

    const rawTitle = titleMatch ? titleMatch[1].trim() : "";
    const parts = rawTitle.split(":");
    let company = "Entreprise";
    let title = rawTitle;
    if (parts.length > 1) {
      company = parts[0].trim();
      title = parts.slice(1).join(":").trim();
    }

    if (title && linkMatch) {
      items.push({
        title,
        company,
        url: linkMatch[1].trim(),
        description: descMatch ? descMatch[1] : "",
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
        region: regionMatch ? regionMatch[1].trim() : "Worldwide",
      });
    }
  }
  return items;
}

/**
 * 1. Collecteur Remotive
 */
async function scrapeRemotive() {
  try {
    const res = await fetchWithTimeout("https://remotive.com/api/remote-jobs?limit=70");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.jobs || [])
      .filter((j) => isStrictlyRemote(j.title, j.description))
      .map((j) => {
        const region = detectRegion(j.candidate_required_location, j.title, j.tags || []);
        const lang = detectLanguage(j.title, j.description, j.tags || []);
        const category = categorizeJob(j.title, j.category, j.tags || []);
        const contract = detectContractType(j.title, j.job_type, j.description, j.tags || []);
        const salaryObj = parseSalaryDetails(j.salary || "");

        return {
          id: `remotive-${j.id}`,
          title: j.title,
          company: j.company_name,
          company_logo: j.company_logo || j.company_logo_url || "",
          url: j.url,
          category: category.name,
          categoryId: category.id,
          categoryIcon: category.icon,
          contractType: contract.label,
          contractTypeId: contract.id,
          contractIcon: contract.icon,
          tags: Array.isArray(j.tags) ? j.tags.slice(0, 6) : [],
          job_type: j.job_type || contract.label,
          location: j.candidate_required_location || "Worldwide",
          region: region.label,
          regionId: region.id,
          regionFlag: region.flag,
          salary: salaryObj.raw,
          salary_min_eur: salaryObj.min_eur,
          salary_max_eur: salaryObj.max_eur,
          salary_min_usd: salaryObj.min_usd,
          salary_max_usd: salaryObj.max_usd,
          currency: salaryObj.currency,
          published_at: j.publication_date || new Date().toISOString(),
          description_snippet: stripHtml(j.description).slice(0, 280) + "...",
          source: "Remotive",
          language: lang,
          is_verified: 1,
        };
      });
  } catch (err) {
    console.warn("Source Remotive erreur:", err.message);
    return [];
  }
}

/**
 * 2. Collecteur Jobicy
 */
async function scrapeJobicy() {
  try {
    const res = await fetchWithTimeout("https://jobicy.com/api/v2/remote-jobs?count=60");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.jobs || [])
      .filter((j) => isStrictlyRemote(j.jobTitle, j.jobExcerpt || j.jobDescription))
      .map((j) => {
        const rawTags = Array.isArray(j.jobIndustry) ? j.jobIndustry : [j.jobIndustry].filter(Boolean);
        const rawJobType = Array.isArray(j.jobType) ? j.jobType.join(", ") : j.jobType || "";
        const region = detectRegion(j.jobGeo, j.jobTitle, rawTags);
        const lang = detectLanguage(j.jobTitle, j.jobExcerpt || j.jobDescription, rawTags);
        const category = categorizeJob(j.jobTitle, rawTags[0] || "", rawTags);
        const contract = detectContractType(j.jobTitle, rawJobType, j.jobExcerpt || j.jobDescription, rawTags);
        const salaryObj = parseSalaryDetails("");

        return {
          id: `jobicy-${j.id}`,
          title: j.jobTitle,
          company: j.companyName,
          company_logo: j.companyLogo || "",
          url: j.url,
          category: category.name,
          categoryId: category.id,
          categoryIcon: category.icon,
          contractType: contract.label,
          contractTypeId: contract.id,
          contractIcon: contract.icon,
          tags: rawTags.slice(0, 6),
          job_type: rawJobType || contract.label,
          location: j.jobGeo || "Worldwide",
          region: region.label,
          regionId: region.id,
          regionFlag: region.flag,
          salary: salaryObj.raw,
          salary_min_eur: salaryObj.min_eur,
          salary_max_eur: salaryObj.max_eur,
          salary_min_usd: salaryObj.min_usd,
          salary_max_usd: salaryObj.max_usd,
          currency: salaryObj.currency,
          published_at: j.pubDate || new Date().toISOString(),
          description_snippet: stripHtml(j.jobExcerpt || j.jobDescription).slice(0, 280) + "...",
          source: "Jobicy",
          language: lang,
          is_verified: 1,
        };
      });
  } catch (err) {
    console.warn("Source Jobicy erreur:", err.message);
    return [];
  }
}

/**
 * 3. Collecteur Arbeitnow
 */
async function scrapeArbeitnow() {
  try {
    const res = await fetchWithTimeout("https://www.arbeitnow.com/api/job-board-api");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.data || [])
      .filter((j) => (j.remote === true || (j.tags && j.tags.some((t) => t.toLowerCase().includes("remote")))) && isStrictlyRemote(j.title, j.description))
      .slice(0, 40)
      .map((j) => {
        const rawTags = j.tags || [];
        const rawJobType = (j.job_types && j.job_types[0]) || "";
        const loc = j.location ? `${j.location} (100% Remote)` : "Europe / Remote";
        const region = detectRegion(loc, j.title, rawTags);
        const lang = detectLanguage(j.title, j.description, rawTags);
        const category = categorizeJob(j.title, rawTags[0] || "", rawTags);
        const contract = detectContractType(j.title, rawJobType, j.description, rawTags);
        const salaryObj = parseSalaryDetails("");

        return {
          id: `arbeitnow-${j.slug}`,
          title: j.title,
          company: j.company_name,
          company_logo: "",
          url: j.url,
          category: category.name,
          categoryId: category.id,
          categoryIcon: category.icon,
          contractType: contract.label,
          contractTypeId: contract.id,
          contractIcon: contract.icon,
          tags: rawTags.slice(0, 6),
          job_type: rawJobType || contract.label,
          location: loc,
          region: region.label,
          regionId: region.id,
          regionFlag: region.flag,
          salary: salaryObj.raw,
          salary_min_eur: salaryObj.min_eur,
          salary_max_eur: salaryObj.max_eur,
          salary_min_usd: salaryObj.min_usd,
          salary_max_usd: salaryObj.max_usd,
          currency: salaryObj.currency,
          published_at: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
          description_snippet: stripHtml(j.description).slice(0, 280) + "...",
          source: "Arbeitnow",
          language: lang,
          is_verified: 1,
        };
      });
  } catch (err) {
    console.warn("Source Arbeitnow erreur:", err.message);
    return [];
  }
}

/**
 * 4. Collecteur RemoteOK
 */
async function scrapeRemoteOk() {
  try {
    const res = await fetchWithTimeout("https://remoteok.com/api");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const jobsList = Array.isArray(data) ? data.filter((j) => j.id && j.position) : [];
    return jobsList
      .filter((j) => isStrictlyRemote(j.position, j.description))
      .slice(0, 50)
      .map((j) => {
        const rawTags = Array.isArray(j.tags) ? j.tags : [];
        const region = detectRegion(j.location || "Worldwide", j.position, rawTags);
        const lang = detectLanguage(j.position, j.description, rawTags);
        const category = categorizeJob(j.position, rawTags[0] || "", rawTags);
        const contract = detectContractType(j.position, "", j.description, rawTags);
        
        let salaryText = "";
        if (j.salary_min && j.salary_max) {
          salaryText = `$${j.salary_min.toLocaleString()} - $${j.salary_max.toLocaleString()} / an`;
        } else if (j.salary_min) {
          salaryText = `À partir de $${j.salary_min.toLocaleString()} / an`;
        }
        const salaryObj = parseSalaryDetails(salaryText);

        return {
          id: `remoteok-${j.id}`,
          title: j.position,
          company: j.company,
          company_logo: j.logo || "",
          url: j.url || j.apply_url || `https://remoteok.com/remote-jobs/${j.id}`,
          category: category.name,
          categoryId: category.id,
          categoryIcon: category.icon,
          contractType: contract.label,
          contractTypeId: contract.id,
          contractIcon: contract.icon,
          tags: rawTags.slice(0, 6),
          job_type: contract.label,
          location: j.location || "Worldwide",
          region: region.label,
          regionId: region.id,
          regionFlag: region.flag,
          salary: salaryObj.raw,
          salary_min_eur: salaryObj.min_eur,
          salary_max_eur: salaryObj.max_eur,
          salary_min_usd: salaryObj.min_usd,
          salary_max_usd: salaryObj.max_usd,
          currency: salaryObj.currency,
          published_at: j.date ? new Date(j.date).toISOString() : new Date().toISOString(),
          description_snippet: stripHtml(j.description).slice(0, 280) + "...",
          source: "RemoteOK",
          language: lang,
          is_verified: 1,
        };
      });
  } catch (err) {
    console.warn("Source RemoteOK erreur:", err.message);
    return [];
  }
}

/**
 * 5. Collecteur We Work Remotely
 */
async function scrapeWeWorkRemotely() {
  const feeds = [
    "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
    "https://weworkremotely.com/categories/remote-product-jobs.rss",
  ];

  const results = await Promise.allSettled(
    feeds.map(async (url) => {
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return parseRssItems(text);
    })
  );

  const allItems = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  return allItems
    .filter((item) => isStrictlyRemote(item.title, item.description))
    .map((item) => {
      const region = detectRegion(item.region, item.title, []);
      const lang = detectLanguage(item.title, item.description, []);
      const category = categorizeJob(item.title, "", []);
      const contract = detectContractType(item.title, "", item.description, []);
      const idHash = (item.title + item.company).replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 25);
      const salaryObj = parseSalaryDetails("");

      return {
        id: `wwr-${idHash}`,
        title: item.title,
        company: item.company,
        company_logo: "",
        url: item.url,
        category: category.name,
        categoryId: category.id,
        categoryIcon: category.icon,
        contractType: contract.label,
        contractTypeId: contract.id,
        contractIcon: contract.icon,
        tags: ["Remote", category.name],
        job_type: contract.label,
        location: item.region || "Worldwide",
        region: region.label,
        regionId: region.id,
        regionFlag: region.flag,
        salary: salaryObj.raw,
        salary_min_eur: salaryObj.min_eur,
        salary_max_eur: salaryObj.max_eur,
        salary_min_usd: salaryObj.min_usd,
        salary_max_usd: salaryObj.max_usd,
        currency: salaryObj.currency,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        description_snippet: stripHtml(item.description).slice(0, 280) + "...",
        source: "WeWorkRemotely",
        language: lang,
        is_verified: 1,
      };
    });
}

/**
 * 6. Collecteur Hacker News "Who is Hiring"
 */
async function scrapeHackerNews() {
  try {
    const userRes = await fetchWithTimeout("https://hacker-news.firebaseio.com/v0/user/whoishiring.json", {}, 5000);
    if (!userRes.ok) return [];
    const user = await userRes.json();
    if (!user.submitted || user.submitted.length === 0) return [];

    const threadId = user.submitted[0];
    const threadRes = await fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${threadId}.json`, {}, 5000);
    if (!threadRes.ok) return [];
    const thread = await threadRes.json();
    const commentIds = (thread.kids || []).slice(0, 30);

    const commentTasks = commentIds.map((cid) =>
      fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${cid}.json`, {}, 3000)
        .then((r) => r.json())
        .catch(() => null)
    );

    const comments = await Promise.all(commentTasks);
    const remotePosts = [];

    for (const c of comments) {
      if (!c || !c.text || c.deleted || c.dead) continue;
      const clean = stripHtml(c.text);
      if (!/\bremote\b/i.test(clean) || !isStrictlyRemote("", clean)) continue;

      const lines = clean.split("\n").filter(Boolean);
      const firstLine = lines[0] || "";
      const parts = firstLine.split("|").map((p) => p.trim());

      const company = parts[0] || "Startup Tech (HN)";
      const title = parts[parts.length - 1] || parts[1] || "Senior Engineer";
      const region = detectRegion(firstLine, title, []);
      const lang = detectLanguage(title, clean, []);
      const category = categorizeJob(title, "", []);
      const contract = detectContractType(title, firstLine, clean, []);
      const salaryObj = parseSalaryDetails("");

      remotePosts.push({
        id: `hn-${c.id}`,
        title: title.length > 80 ? title.slice(0, 80) + "..." : title,
        company: company.length > 40 ? company.slice(0, 40) : company,
        company_logo: "",
        url: `https://news.ycombinator.com/item?id=${c.id}`,
        category: category.name,
        categoryId: category.id,
        categoryIcon: category.icon,
        contractType: contract.label,
        contractTypeId: contract.id,
        contractIcon: contract.icon,
        tags: ["HackerNews", "YC", "Direct Contact"],
        job_type: contract.label,
        location: "Worldwide / Remote",
        region: region.label,
        regionId: region.id,
        regionFlag: region.flag,
        salary: salaryObj.raw,
        salary_min_eur: salaryObj.min_eur,
        salary_max_eur: salaryObj.max_eur,
        salary_min_usd: salaryObj.min_usd,
        salary_max_usd: salaryObj.max_usd,
        currency: salaryObj.currency,
        published_at: c.time ? new Date(c.time * 1000).toISOString() : new Date().toISOString(),
        description_snippet: clean.slice(0, 280) + "...",
        source: "HackerNews",
        language: lang,
        is_verified: 1,
      });
    }

    return remotePosts;
  } catch (err) {
    console.warn("Source HackerNews erreur:", err.message);
    return [];
  }
}

/**
 * Pipeline d'agrégation globale avec purge des offres obsolètes (> 35 jours)
 */
export async function scrapeAllJobs() {
  const tasks = [
    scrapeRemotive(),
    scrapeJobicy(),
    scrapeArbeitnow(),
    scrapeRemoteOk(),
    scrapeWeWorkRemotely(),
    scrapeHackerNews(),
  ];

  const results = await Promise.allSettled(tasks);
  const combined = [];

  results.forEach((r) => {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      combined.push(...r.value);
    }
  });

  const nowMs = Date.now();
  const maxAgeMs = 35 * 24 * 60 * 60 * 1000; // 35 jours max

  const seen = new Set();
  const uniqueJobs = [];

  for (const job of combined) {
    if (!job.title || !job.company) continue;

    // Purge des annonces de plus de 35 jours
    const pubMs = new Date(job.published_at).getTime();
    if (!isNaN(pubMs) && nowMs - pubMs > maxAgeMs) continue;

    const cleanTitle = job.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
    const cleanCompany = job.company.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    const key = `${cleanTitle}_${cleanCompany}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(job);
    }
  }

  // Tri antéchronologique
  uniqueJobs.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return uniqueJobs;
}
