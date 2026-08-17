/**
 * FullRemote-Jobs - Data Normalizer & Scraper Engine
 * Supporte : Remotive, Jobicy, Arbeitnow
 */

const USER_AGENT = "FullRemoteJobsBot/1.0 (+https://fullremote-jobs.edounze.com; contact@edounze.com)";

/**
 * Nettoie et extrait un texte propre à partir d'un fragment HTML
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
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
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
      priority: 1,
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
      priority: 3,
    };
  }

  // 3. Europe
  if (
    /\b(europe|eu|emea|uk|united kingdom|london|germany|deutschland|berlin|munich|hamburg|spain|españa|madrid|barcelona|italy|italia|milan|rome|poland|polska|warsaw|netherlands|amsterdam|rotterdam|portugal|lisbon|porto|ireland|dublin|sweden|stockholm|norway|oslo|finland|helsinki|denmark|copenhagen|austria|vienna|estonia|tallinn|czech|prague|romania|bucharest)\b/i.test(
      text
    )
  ) {
    return {
      id: "europe",
      label: "Europe",
      flag: "🇪🇺",
      priority: 2,
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
      priority: 4,
    };
  }

  // 5. Par défaut : Worldwide
  return {
    id: "worldwide",
    label: "Worldwide",
    flag: "🌍",
    priority: 0,
  };
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
    /\b(devops|sre|cloud|kubernetes|aws|gcp|azure|infrastructure|sysadmin|security|cybersecurity|secops)\b/i.test(
      text
    )
  ) {
    return { id: "devops", name: "DevOps & Cloud", icon: "☁️" };
  }

  if (
    /\b(ai|ml|machine learning|data engineer|data scientist|deep learning|llm|nlp|data analyst|bi|analytics)\b/i.test(
      text
    )
  ) {
    return { id: "data_ai", name: "Data & IA", icon: "🧠" };
  }

  if (
    /\b(frontend|backend|fullstack|software|developer|engineer|react|node|python|golang|rust|java|php|typescript|javascript|ruby|c\+\+|ios|android|mobile|web)\b/i.test(
      text
    )
  ) {
    return { id: "tech", name: "Tech & Dev", icon: "💻" };
  }

  if (
    /\b(design|designer|ui|ux|product design|figma|brand|graphic|illustrator)\b/i.test(
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
    /\b(marketing|seo|growth|content|sales|account executive|business development|copywriter|community)\b/i.test(
      text
    )
  ) {
    return { id: "marketing_sales", name: "Marketing & Sales", icon: "📈" };
  }

  return { id: "other", name: "Autres / Support", icon: "💼" };
}

/**
 * Fetch avec timeout
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
        Accept: "application/json",
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
 * Collecte et normalise les offres depuis les 3 APIs
 */
export async function scrapeAllJobs() {
  const tasks = [
    // 1. Remotive API
    (async () => {
      try {
        const res = await fetchWithTimeout(
          "https://remotive.com/api/remote-jobs?limit=60"
        );
        if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`);
        const data = await res.json();
        return (data.jobs || []).map((j) => {
          const region = detectRegion(
            j.candidate_required_location,
            j.title,
            j.tags || []
          );
          const lang = detectLanguage(j.title, j.description, j.tags || []);
          const category = categorizeJob(j.title, j.category, j.tags || []);
          return {
            id: `remotive-${j.id}`,
            title: j.title,
            company: j.company_name,
            company_logo: j.company_logo || j.company_logo_url || "",
            url: j.url,
            category: category.name,
            categoryId: category.id,
            categoryIcon: category.icon,
            tags: Array.isArray(j.tags) ? j.tags.slice(0, 6) : [],
            job_type: j.job_type || "Full-time",
            location: j.candidate_required_location || "Worldwide",
            region: region.label,
            regionId: region.id,
            regionFlag: region.flag,
            salary: j.salary || "",
            published_at: j.publication_date || new Date().toISOString(),
            description_snippet: stripHtml(j.description).slice(0, 240) + "...",
            source: "Remotive",
            language: lang,
          };
        });
      } catch (err) {
        console.warn("Erreur scraping Remotive:", err.message);
        return [];
      }
    })(),

    // 2. Jobicy API
    (async () => {
      try {
        const res = await fetchWithTimeout(
          "https://jobicy.com/api/v2/remote-jobs?count=50"
        );
        if (!res.ok) throw new Error(`Jobicy HTTP ${res.status}`);
        const data = await res.json();
        return (data.jobs || []).map((j) => {
          const rawTags = Array.isArray(j.jobIndustry) ? j.jobIndustry : [j.jobIndustry].filter(Boolean);
          const region = detectRegion(j.jobGeo, j.jobTitle, rawTags);
          const lang = detectLanguage(j.jobTitle, j.jobExcerpt || j.jobDescription, rawTags);
          const category = categorizeJob(j.jobTitle, rawTags[0] || "", rawTags);
          return {
            id: `jobicy-${j.id}`,
            title: j.jobTitle,
            company: j.companyName,
            company_logo: j.companyLogo || "",
            url: j.url,
            category: category.name,
            categoryId: category.id,
            categoryIcon: category.icon,
            tags: rawTags.slice(0, 6),
            job_type: Array.isArray(j.jobType) ? j.jobType.join(", ") : (j.jobType || "Full-time"),
            location: j.jobGeo || "Worldwide",
            region: region.label,
            regionId: region.id,
            regionFlag: region.flag,
            salary: "",
            published_at: j.pubDate || new Date().toISOString(),
            description_snippet: stripHtml(j.jobExcerpt || j.jobDescription).slice(0, 240) + "...",
            source: "Jobicy",
            language: lang,
          };
        });
      } catch (err) {
        console.warn("Erreur scraping Jobicy:", err.message);
        return [];
      }
    })(),

    // 3. Arbeitnow API
    (async () => {
      try {
        const res = await fetchWithTimeout(
          "https://www.arbeitnow.com/api/job-board-api"
        );
        if (!res.ok) throw new Error(`Arbeitnow HTTP ${res.status}`);
        const data = await res.json();
        return (data.data || [])
          .filter(
            (j) =>
              j.remote === true ||
              (j.tags && j.tags.some((t) => t.toLowerCase().includes("remote")))
          )
          .slice(0, 40)
          .map((j) => {
            const rawTags = j.tags || [];
            const loc = j.location ? `${j.location} (100% Remote)` : "Europe / Remote";
            const region = detectRegion(loc, j.title, rawTags);
            const lang = detectLanguage(j.title, j.description, rawTags);
            const category = categorizeJob(j.title, rawTags[0] || "", rawTags);
            return {
              id: `arbeitnow-${j.slug}`,
              title: j.title,
              company: j.company_name,
              company_logo: "",
              url: j.url,
              category: category.name,
              categoryId: category.id,
              categoryIcon: category.icon,
              tags: rawTags.slice(0, 6),
              job_type: (j.job_types && j.job_types[0]) || "Full-time",
              location: loc,
              region: region.label,
              regionId: region.id,
              regionFlag: region.flag,
              salary: "",
              published_at: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
              description_snippet: stripHtml(j.description).slice(0, 240) + "...",
              source: "Arbeitnow",
              language: lang,
            };
          });
      } catch (err) {
        console.warn("Erreur scraping Arbeitnow:", err.message);
        return [];
      }
    })(),
  ];

  const results = await Promise.all(tasks);
  const combined = results.flat();

  // Dédoublonnage par clé unique (titre normalisé + entreprise)
  const seen = new Set();
  const uniqueJobs = [];

  for (const job of combined) {
    const key = `${job.title.toLowerCase().trim()}_${job.company.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(job);
    }
  }

  // Tri antéchronologique (les plus récents en premier)
  uniqueJobs.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return uniqueJobs;
}
