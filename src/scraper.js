/**
 * FullRemote-Jobs - Moteur d'Ingestion & Normalisation Multi-Sources
 * Sources : Remotive, Jobicy, Arbeitnow, RemoteOK, We Work Remotely, Hacker News
 */

const USER_AGENT = "FullRemoteJobsBot/1.0 (+https://fullremote-jobs.edounze.com)";

/**
 * Nettoie et extrait un texte propre à partir d'un fragment HTML ou XML
 */
export function stripHtml(html = "") {
  if (!html) return "";
  let clean = String(html);
  // 1. Décodage préventif des entités HTML (flux RSS encodant &lt;p&gt;)
  for (let i = 0; i < 3; i++) {
    clean = clean
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x2F;/gi, "/")
      .replace(/&amp;/gi, "&")
      .replace(/&nbsp;/gi, " ");
  }

  // 2. Suppression stricte des balises scripts, styles et HTML
  clean = clean
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ");

  // 3. Nettoyage des entités résiduelles et espaces multiples
  return clean
    .replace(/&[a-z0-9#]+;/gi, " ")
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
 * Patterns des technologies et langages majeurs (Top 50 TIOBE + Top 100 High-Demand Remote)
 */
export const TIOBE_TECH_PATTERNS = [
  // --- TOP 1 à 20 TIOBE ---
  // 1. Python & IA / Data (TIOBE #1)
  { tag: "Python", regex: /\b(python|python3|django|fastapi|flask|pytest|pandas|numpy|pytorch|tensorflow|scikit)\b/i },
  { tag: "Django", regex: /\b(django)\b/i },
  { tag: "FastAPI", regex: /\b(fastapi)\b/i },
  { tag: "AI & LLM", regex: /\b(ai|llm|machine learning|deep learning|genai|openai|langchain|rag|claude|agentic)\b/i },

  // 2. C / C++ (TIOBE #2, #3)
  { tag: "C++", regex: /\b(c\+\+|cpp)\b/i },
  { tag: "C", regex: /\b(c language|embedded c|c\/c\+\+)\b/i },

  // 3. Java & JVM (TIOBE #4)
  { tag: "Java", regex: /\b(java|java17|java21|spring|spring boot|hibernate|quarkus|micronaut)\b/i },

  // 4. C# & .NET (TIOBE #5)
  { tag: "C#", regex: /\b(c#|csharp|\.net|dotnet|asp\.net)\b/i },
  { tag: ".NET", regex: /\b(\.net|dotnet|asp\.net core)\b/i },

  // 5. JavaScript / TypeScript & Front / Fullstack (TIOBE #6, #44)
  { tag: "TypeScript", regex: /\b(typescript|ts)\b/i },
  { tag: "JavaScript", regex: /\b(javascript|js|es6)\b/i },
  { tag: "React", regex: /\b(react|react\.js|reactjs|next\.js|nextjs)\b/i },
  { tag: "Vue.js", regex: /\b(vue|vue\.js|vuejs|nuxt|nuxtjs)\b/i },
  { tag: "Angular", regex: /\b(angular|angularjs)\b/i },
  { tag: "Node.js", regex: /\b(node|node\.js|nodejs|express|nestjs)\b/i },

  // 6. SQL & Bases de données (TIOBE #8)
  { tag: "SQL", regex: /\b(sql|postgresql|postgres|mysql|mariadb|sqlite|mongodb|redis)\b/i },
  { tag: "PostgreSQL", regex: /\b(postgresql|postgres)\b/i },

  // 7. R & Data Science (TIOBE #9)
  { tag: "R", regex: /\b(r language|rstats|r-studio|r shiny)\b/i },

  // 8. Rust (TIOBE #10)
  { tag: "Rust", regex: /\b(rust|rustlang|tokio|actix|solana)\b/i },

  // 9. PHP & Frameworks (TIOBE #13)
  { tag: "PHP", regex: /\b(php|php8|php7)\b/i },
  { tag: "Laravel", regex: /\b(laravel|livewire|filament|blade)\b/i },
  { tag: "Symfony", regex: /\b(symfony|doctrine|twig|api platform)\b/i },
  { tag: "WordPress", regex: /\b(wordpress|woocommerce)\b/i },
  { tag: "Drupal", regex: /\b(drupal)\b/i },

  // 10. Go / Golang (TIOBE #14)
  { tag: "Go", regex: /\b(golang|go dev|go engineer|go backend)\b/i },

  // 11. Fortran (TIOBE #15)
  { tag: "Fortran", regex: /\b(fortran|fortran90|fortran77)\b/i },

  // 12. Ruby & Rails (TIOBE #16)
  { tag: "Ruby", regex: /\b(ruby|ruby on rails|rails)\b/i },

  // 13. Swift & Mobile (TIOBE #17)
  { tag: "Swift", regex: /\b(swift|swiftui|ios)\b/i },
  { tag: "Android", regex: /\b(android|kotlin mobile)\b/i },
  { tag: "Flutter", regex: /\b(flutter|dart)\b/i },
  { tag: "React Native", regex: /\b(react native)\b/i },

  // 14. Perl (TIOBE #18)
  { tag: "Perl", regex: /\b(perl|perl5|perl6)\b/i },

  // 15. COBOL (TIOBE #19)
  { tag: "COBOL", regex: /\b(cobol|mainframe)\b/i },

  // 16. Assembly (TIOBE #20)
  { tag: "Assembly", regex: /\b(assembly|x86 asm|arm asm)\b/i },

  // --- TOP 21 à 50 TIOBE ---
  // 17. Ada (TIOBE #21)
  { tag: "Ada", regex: /\b(ada language|ada 2012|ada programming)\b/i },

  // 18. Visual Basic / VBA (TIOBE #22, #42)
  { tag: "Visual Basic", regex: /\b(vba|visual basic|vb\.net|vbscript)\b/i },

  // 19. Objective-C (TIOBE #23)
  { tag: "Objective-C", regex: /\b(objective-c|objc)\b/i },

  // 20. SAS (TIOBE #24)
  { tag: "SAS", regex: /\b(sas programming|sas data|sas language)\b/i },

  // 21. MATLAB (TIOBE #25)
  { tag: "MATLAB", regex: /\b(matlab|simulink)\b/i },

  // 22. Julia (TIOBE #26)
  { tag: "Julia", regex: /\b(julia language|julialang)\b/i },

  // 23. PL/SQL (TIOBE #27)
  { tag: "PL/SQL", regex: /\b(pl\/sql|plsql|oracle sql)\b/i },

  // 24. Kotlin (TIOBE #28)
  { tag: "Kotlin", regex: /\b(kotlin|kmp|kotlin multiplatform)\b/i },

  // 25. OCaml / Caml (TIOBE #29, #33)
  { tag: "OCaml", regex: /\b(ocaml|caml|dune ocaml)\b/i },

  // 26. T-SQL / Transact-SQL (TIOBE #30)
  { tag: "T-SQL", regex: /\b(t-sql|transact-sql|sql server)\b/i },

  // 27. LabVIEW (TIOBE #31)
  { tag: "LabVIEW", regex: /\b(labview|ni labview)\b/i },

  // 28. Dart (TIOBE #32)
  { tag: "Dart", regex: /\b(dart|flutter)\b/i },

  // 29. Lua (TIOBE #34)
  { tag: "Lua", regex: /\b(lua|luajit|neovim lua)\b/i },

  // 30. VHDL / Verilog (TIOBE #36)
  { tag: "VHDL", regex: /\b(vhdl|verilog|fpga)\b/i },

  // 31. Prolog (TIOBE #37)
  { tag: "Prolog", regex: /\b(prolog|swi-prolog)\b/i },

  // 32. ABAP / SAP (TIOBE #38)
  { tag: "ABAP", regex: /\b(abap|sap abap|sap dev|sap consultant)\b/i },

  // 33. PowerShell (TIOBE #39)
  { tag: "PowerShell", regex: /\b(powershell|pwsh)\b/i },

  // 34. Lisp (TIOBE #40)
  { tag: "Lisp", regex: /\b(lisp|common lisp|clisp|racket)\b/i },

  // 35. Zig (TIOBE #41)
  { tag: "Zig", regex: /\b(zig language|ziglang)\b/i },

  // 36. Haskell (TIOBE #48)
  { tag: "Haskell", regex: /\b(haskell|ghc)\b/i },

  // 37. Scala (TIOBE #49)
  { tag: "Scala", regex: /\b(scala|akka|play framework|spark)\b/i },

  // --- TOP 51 à 100 & Écosystème Remote Moderne ---
  // 38. Elixir & Phoenix (#51-100)
  { tag: "Elixir", regex: /\b(elixir|phoenix framework|liveview)\b/i },

  // 39. Erlang (#51-100)
  { tag: "Erlang", regex: /\b(erlang|beam|otp)\b/i },

  // 40. Clojure (#51-100)
  { tag: "Clojure", regex: /\b(clojure|clojurescript)\b/i },

  // 41. Solidity / Web3 (#51-100)
  { tag: "Solidity", regex: /\b(solidity|smart contracts|web3|ethereum|hardhat|foundry)\b/i },

  // 42. Salesforce Apex (#51-100)
  { tag: "Apex", regex: /\b(apex|salesforce developer|salesforce apex)\b/i },

  // 43. F# (#51-100)
  { tag: "F#", regex: /\b(f#|fsharp)\b/i },

  // 44. Groovy (#51-100)
  { tag: "Groovy", regex: /\b(groovy|grails|jenkins pipeline)\b/i },

  // 45. Bash / Shell (#51-100)
  { tag: "Bash", regex: /\b(bash|shell script|zsh)\b/i },

  // --- DevOps, Cloud & Infra ---
  { tag: "DevOps", regex: /\b(devops|sre|ci\/cd|github actions|gitlab ci)\b/i },
  { tag: "Kubernetes", regex: /\b(kubernetes|k8s|helm)\b/i },
  { tag: "Docker", regex: /\b(docker|containerization)\b/i },
  { tag: "AWS", regex: /\b(aws|amazon web services)\b/i },
  { tag: "GCP", regex: /\b(gcp|google cloud)\b/i },
  { tag: "Azure", regex: /\b(azure|microsoft azure)\b/i },
  { tag: "Terraform", regex: /\b(terraform|iac|ansible)\b/i },
];

/**
 * Extraction intelligente et normalisation de la stack technologique
 */
export function extractTechStack(title = "", description = "", rawTags = []) {
  const combinedText = `${title} ${description.slice(0, 1500)} ${(rawTags || []).join(" ")}`;
  const detected = new Set();

  for (const t of rawTags || []) {
    if (typeof t === "string" && t.trim().length > 1 && t.trim().length < 25) {
      detected.add(t.trim());
    }
  }

  for (const item of TIOBE_TECH_PATTERNS) {
    if (item.regex.test(combinedText)) {
      detected.add(item.tag);
    }
  }

  // Relations hiérarchiques et d'écosystèmes
  if (detected.has("Laravel") || detected.has("Symfony") || detected.has("WordPress") || detected.has("Drupal")) {
    detected.add("PHP");
  }
  if (detected.has("Django") || detected.has("FastAPI")) {
    detected.add("Python");
  }
  if (detected.has("Flutter")) {
    detected.add("Dart");
  }
  if (detected.has("Phoenix")) {
    detected.add("Elixir");
  }
  if (detected.has("PL/SQL") || detected.has("T-SQL") || detected.has("PostgreSQL")) {
    detected.add("SQL");
  }

  return Array.from(detected).slice(0, 7);
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
    const res = await fetchWithTimeout("https://remotive.com/api/remote-jobs?limit=150");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.jobs || [])
      .filter((j) => isStrictlyRemote(j.title, j.description))
      .map((j) => {
        const rawTags = Array.isArray(j.tags) ? j.tags : [];
        const tags = extractTechStack(j.title, j.description, rawTags);
        const region = detectRegion(j.candidate_required_location, j.title, tags);
        const lang = detectLanguage(j.title, j.description, tags);
        const category = categorizeJob(j.title, j.category, tags);
        const contract = detectContractType(j.title, j.job_type, j.description, tags);
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
          tags,
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
 * 2. Collecteur Jobicy (Multi-Tags TIOBE & Langages)
 */
async function scrapeJobicy() {
  try {
    const urls = [
      "https://jobicy.com/api/v2/remote-jobs?count=100",
      "https://jobicy.com/api/v2/remote-jobs?count=40&tag=php",
      "https://jobicy.com/api/v2/remote-jobs?count=40&tag=laravel",
      "https://jobicy.com/api/v2/remote-jobs?count=40&tag=python",
      "https://jobicy.com/api/v2/remote-jobs?count=40&tag=java",
      "https://jobicy.com/api/v2/remote-jobs?count=40&tag=golang",
      "https://jobicy.com/api/v2/remote-jobs?count=40&tag=rust",
      "https://jobicy.com/api/v2/remote-jobs?count=40&tag=ruby",
    ];

    const responses = await Promise.allSettled(
      urls.map((u) => fetchWithTimeout(u, {}, 5000).then((r) => (r.ok ? r.json() : { jobs: [] })))
    );

    const allJobs = [];
    responses.forEach((r) => {
      if (r.status === "fulfilled" && Array.isArray(r.value.jobs)) {
        allJobs.push(...r.value.jobs);
      }
    });

    const seenIds = new Set();
    const unique = [];
    for (const j of allJobs) {
      if (!seenIds.has(j.id)) {
        seenIds.add(j.id);
        unique.push(j);
      }
    }

    return unique
      .filter((j) => isStrictlyRemote(j.jobTitle, j.jobExcerpt || j.jobDescription))
      .map((j) => {
        const rawTags = Array.isArray(j.jobIndustry) ? j.jobIndustry : [j.jobIndustry].filter(Boolean);
        const rawJobType = Array.isArray(j.jobType) ? j.jobType.join(", ") : j.jobType || "";
        const tags = extractTechStack(j.jobTitle, j.jobExcerpt || j.jobDescription, rawTags);
        const region = detectRegion(j.jobGeo, j.jobTitle, tags);
        const lang = detectLanguage(j.jobTitle, j.jobExcerpt || j.jobDescription, tags);
        const category = categorizeJob(j.jobTitle, rawTags[0] || "", tags);
        const contract = detectContractType(j.jobTitle, rawJobType, j.jobExcerpt || j.jobDescription, tags);
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
          tags,
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
      .slice(0, 100)
      .map((j) => {
        const rawTags = j.tags || [];
        const rawJobType = (j.job_types && j.job_types[0]) || "";
        const loc = j.location ? `${j.location} (100% Remote)` : "Europe / Remote";
        const tags = extractTechStack(j.title, j.description, rawTags);
        const region = detectRegion(loc, j.title, tags);
        const lang = detectLanguage(j.title, j.description, tags);
        const category = categorizeJob(j.title, rawTags[0] || "", tags);
        const contract = detectContractType(j.title, rawJobType, j.description, tags);
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
          tags,
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
      .slice(0, 120)
      .map((j) => {
        const rawTags = Array.isArray(j.tags) ? j.tags : [];
        const tags = extractTechStack(j.position, j.description, rawTags);
        const region = detectRegion(j.location || "Worldwide", j.position, tags);
        const lang = detectLanguage(j.position, j.description, tags);
        const category = categorizeJob(j.position, rawTags[0] || "", tags);
        const contract = detectContractType(j.position, "", j.description, tags);
        
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
          tags,
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
 * 5. Collecteur We Work Remotely (Multi-Catégories)
 */
async function scrapeWeWorkRemotely() {
  const feeds = [
    "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
    "https://weworkremotely.com/categories/remote-product-jobs.rss",
    "https://weworkremotely.com/categories/remote-design-jobs.rss",
    "https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss",
    "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
    "https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss",
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
      const tags = extractTechStack(item.title, item.description, []);
      const region = detectRegion(item.region, item.title, tags);
      const lang = detectLanguage(item.title, item.description, tags);
      const category = categorizeJob(item.title, "", tags);
      const contract = detectContractType(item.title, "", item.description, tags);
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
        tags,
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
      const tags = extractTechStack(title, clean, []);

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
        tags,
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
 * Source 7 : Himalayas API (Emplois full remote mondiaux vérifiés)
 */
export async function scrapeHimalayas() {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=50", {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn(`Source Himalayas HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.jobs)) return [];

    return data.jobs
      .filter((j) => isStrictlyRemote(j.title, j.description || j.excerpt))
      .map((j) => {
        const title = j.title || "Poste Remote";
        const company = j.companyName || "Entreprise";
        const rawCats = Array.isArray(j.categories) ? j.categories.map((c) => c.replace(/-/g, " ")) : [];
        const tags = extractTechStack(title, j.description || j.excerpt || "", rawCats);
        const locationStr = Array.isArray(j.locationRestrictions) ? j.locationRestrictions.join(", ") : "Worldwide";
        const category = categorizeJob(title, tags.join(" "), tags);
        const region = detectRegion(locationStr, title, tags);
        const contract = detectContractType(title, j.employmentType || "", j.description || j.excerpt || "", tags);
        const lang = detectLanguage(title, j.description || j.excerpt);

        let rawSalary = "";
        if (j.minSalary && j.maxSalary) {
          rawSalary = `${j.minSalary.toLocaleString("en-US")} - ${j.maxSalary.toLocaleString("en-US")} $ / an`;
        } else if (j.minSalary) {
          rawSalary = `À partir de ${j.minSalary.toLocaleString("en-US")} $ / an`;
        }
        const salaryObj = parseSalaryDetails(rawSalary);

        const id = `himalayas-${(j.companySlug || "co")}-${title}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 80);

        return {
          id,
          title,
          company,
          company_logo: j.companyLogo || "",
          url: j.applicationLink || j.guid || "https://himalayas.app",
          category: category.label,
          categoryId: category.id,
          categoryIcon: category.icon,
          contractType: contract.label,
          contractTypeId: contract.id,
          contractIcon: contract.icon,
          tags,
          job_type: contract.label,
          location: locationStr,
          region: region.label,
          regionId: region.id,
          regionFlag: region.flag,
          salary: salaryObj.raw,
          salary_min_eur: salaryObj.min_eur,
          salary_max_eur: salaryObj.max_eur,
          salary_min_usd: salaryObj.min_usd,
          salary_max_usd: salaryObj.max_usd,
          currency: salaryObj.currency,
          published_at: j.pubDate ? new Date(j.pubDate * 1000).toISOString() : new Date().toISOString(),
          description_snippet: stripHtml(j.excerpt || j.description || "").slice(0, 280) + "...",
          source: "Himalayas",
          language: lang,
          is_verified: 1,
        };
      });
  } catch (err) {
    console.warn("Source Himalayas erreur:", err.message);
    return [];
  }
}

/**
 * Source 8 : NoDesk RSS (Sélection d'offres télétravail international)
 */
export async function scrapeNoDesk() {
  try {
    const res = await fetch("https://nodesk.co/remote-jobs/index.xml", {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn(`Source NoDesk HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const matches = [...xml.matchAll(itemRegex)];
    const jobs = [];

    for (const match of matches.slice(0, 60)) {
      const item = match[1];
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/);

      const fullTitle = titleMatch ? titleMatch[1] : "";
      const url = linkMatch ? linkMatch[1] : "";
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();
      const desc = descMatch ? stripHtml(descMatch[1]) : "";

      let title = fullTitle;
      let company = "Entreprise Remote";
      if (fullTitle.includes(" at ")) {
        const parts = fullTitle.split(" at ");
        title = parts[0].trim();
        company = parts[1].trim();
      }

      if (!isStrictlyRemote(title, desc)) continue;

      const tags = extractTechStack(title, desc, []);
      const category = categorizeJob(title, "", tags);
      const region = detectRegion("Worldwide", title, tags);
      const contract = detectContractType(title, "", desc, tags);
      const salaryObj = parseSalaryDetails(desc);
      const lang = detectLanguage(title, desc, tags);

      const id = `nodesk-${company}-${title}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);

      jobs.push({
        id,
        title,
        company,
        company_logo: "",
        url,
        category: category.label,
        categoryId: category.id,
        categoryIcon: category.icon,
        contractType: contract.label,
        contractTypeId: contract.id,
        contractIcon: contract.icon,
        tags,
        job_type: contract.label,
        location: "Worldwide",
        region: region.label,
        regionId: region.id,
        regionFlag: region.flag,
        salary: salaryObj.raw,
        salary_min_eur: salaryObj.min_eur,
        salary_max_eur: salaryObj.max_eur,
        salary_min_usd: salaryObj.min_usd,
        salary_max_usd: salaryObj.max_usd,
        currency: salaryObj.currency,
        published_at: pubDate,
        description_snippet: desc.slice(0, 280) + "...",
        source: "NoDesk",
        language: lang,
        is_verified: 1,
      });
    }

    return jobs;
  } catch (err) {
    console.warn("Source NoDesk erreur:", err.message);
    return [];
  }
}

/**
 * Source 9 : Jobicy France Remote (Offres 100% télétravail éligibles France)
 */
export async function scrapeJobicyFrance() {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=60&geo=france", {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.jobs)) return [];

    return data.jobs
      .filter((j) => isStrictlyRemote(j.jobTitle, j.jobDescription))
      .map((j) => {
        const title = j.jobTitle || "Poste Remote";
        const company = j.companyName || "Entreprise";
        const rawTags = Array.isArray(j.jobCategories) ? j.jobCategories : [];
        const tags = extractTechStack(title, j.jobDescription || j.jobExcerpt || "", rawTags);
        const category = categorizeJob(title, j.jobCategory || "", tags);
        const region = detectRegion("France", title, tags);
        const contract = detectContractType(title, j.jobType || "", j.jobDescription || "", tags);
        const salaryObj = parseSalaryDetails(j.annualSalaryMin ? `${j.annualSalaryMin} - ${j.annualSalaryMax} EUR` : "");
        const lang = detectLanguage(title, j.jobDescription, tags);

        const id = `jobicy-fr-${j.id || Math.random().toString(36).substring(2, 8)}`;

        return {
          id,
          title,
          company,
          company_logo: j.companyLogo || "",
          url: j.url || "https://jobicy.com",
          category: category.label,
          categoryId: category.id,
          categoryIcon: category.icon,
          contractType: contract.label,
          contractTypeId: contract.id,
          contractIcon: contract.icon,
          tags,
          job_type: contract.label,
          location: "France & Francophonie",
          region: "France & Francophonie",
          regionId: "france",
          regionFlag: "🇫🇷",
          salary: salaryObj.raw,
          salary_min_eur: salaryObj.min_eur,
          salary_max_eur: salaryObj.max_eur,
          salary_min_usd: salaryObj.min_usd,
          salary_max_usd: salaryObj.max_usd,
          currency: salaryObj.currency,
          published_at: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
          description_snippet: stripHtml(j.jobExcerpt || j.jobDescription || "").slice(0, 280) + "...",
          source: "JobicyFR",
          language: lang,
          is_verified: 1,
        };
      });
  } catch (err) {
    console.warn("Source JobicyFR erreur:", err.message);
    return [];
  }
}

/**
 * Source 10 : Welcome to the Jungle (100% Full Remote France & Europe + Multi-Techs TIOBE)
 */
export async function scrapeWelcomeToTheJungle() {
  try {
    const queries = ["", "php", "symfony", "laravel", "python", "java", "c#", "rust", "golang", "ruby"];
    const results = await Promise.allSettled(
      queries.map((q) =>
        fetch("https://csekhvms53-dsn.algolia.net/1/indexes/wk_cms_jobs_production/query", {
          method: "POST",
          headers: {
            "X-Algolia-Application-Id": "CSEKHVMS53",
            "X-Algolia-Api-Key": "4bd8f6215d0cc52b26430765769e65a0",
            "Referer": "https://www.welcometothejungle.com/",
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
          },
          body: JSON.stringify({
            query: q,
            filters: "remote:fulltime",
            hitsPerPage: q === "" ? 100 : 25,
          }),
          signal: AbortSignal.timeout(6000),
        }).then((r) => (r.ok ? r.json() : { hits: [] }))
      )
    );

    const allHits = [];
    results.forEach((r) => {
      if (r.status === "fulfilled" && Array.isArray(r.value.hits)) {
        allHits.push(...r.value.hits);
      }
    });

    const seenIds = new Set();
    const uniqueHits = [];
    for (const h of allHits) {
      const id = h.objectID || h.slug;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        uniqueHits.push(h);
      }
    }

    return uniqueHits
      .filter((j) => isStrictlyRemote(j.name, j.profile || ""))
      .map((j) => {
        const org = j.organization || {};
        const title = j.name || "Poste Remote";
        const company = org.name || "Entreprise";
        const orgSlug = org.slug || "company";
        const jobUrl = `https://www.welcometothejungle.com/fr/companies/${orgSlug}/jobs/${j.slug}`;
        const logo = (org.logo && org.logo.url) || "";
        const rawContract = (j.contract_type_names && j.contract_type_names.fr) || j.contract_type || "";
        const sectorNames = (j.sectors || []).map((s) => (s.name && (s.name.fr || s.name.en)) || "").filter(Boolean);
        const tags = extractTechStack(title, j.profile || "", sectorNames);
        const contract = detectContractType(title, rawContract, "", tags);
        const rawCountry = (j.office && j.office.country) || "France";
        const region = detectRegion(rawCountry, title, tags);
        const category = categorizeJob(title, "", tags);

        let salaryStr = "";
        if (j.salary_yearly_minimum && j.salary_maximum) {
          salaryStr = `${Math.round(j.salary_yearly_minimum / 1000)}k - ${Math.round(j.salary_maximum / 1000)}k € / an`;
        } else if (j.salary_yearly_minimum) {
          salaryStr = `À partir de ${Math.round(j.salary_yearly_minimum / 1000)}k € / an`;
        }
        const salaryObj = parseSalaryDetails(salaryStr);
        const lang = j.language === "fr" ? "fr" : detectLanguage(title, "", tags);

        return {
          id: `wttj-${j.objectID || j.slug}`,
          title,
          company,
          company_logo: logo,
          url: jobUrl,
          category: category.label,
          categoryId: category.id,
          categoryIcon: category.icon,
          contractType: contract.label,
          contractTypeId: contract.id,
          contractIcon: contract.icon,
          tags,
          job_type: contract.label,
          location: j.office && j.office.city ? `${j.office.city} (100% Remote)` : "France & Europe",
          region: region.label,
          regionId: region.id,
          regionFlag: region.flag,
          salary: salaryObj.raw,
          salary_min_eur: salaryObj.min_eur,
          salary_max_eur: salaryObj.max_eur,
          salary_min_usd: salaryObj.min_usd,
          salary_max_usd: salaryObj.max_usd,
          currency: salaryObj.currency,
          published_at: j.published_at || new Date().toISOString(),
          description_snippet: stripHtml(j.profile || title).slice(0, 280) + "...",
          source: "WelcomeToTheJungle",
          language: lang,
          is_verified: 1,
        };
      });
  } catch (err) {
    console.warn("Source WTTJ erreur:", err.message);
    return [];
  }
}

/**
 * Source 11 : Free-Work / Freelance-Info (Missions et CDI 100% Télétravail FR)
 */
export async function scrapeFreeWork() {
  try {
    const res = await fetch("https://api.free-work.com/job_postings?remote=full&page=1", {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const jobs = data["hydra:member"] || [];

    return jobs.map((j) => {
      const comp = j.company ? j.company.name : "Entreprise Tech";
      const title = j.title || "Mission Remote";
      const url = j.slug ? `https://www.free-work.com/fr/tech-it/jobs/${j.slug}` : `https://www.free-work.com/fr/tech-it/${j.id}`;
      const isContractor = j.contracts && j.contracts.includes("contractor");
      const contract = isContractor
        ? { id: "freelance_contract", label: "Freelance / Contract", icon: "⚡" }
        : { id: "cdi_fulltime", label: "CDI / Full-time", icon: "💼" };

      const salaryText = j.dailySalary ? `TJM : ${j.dailySalary}` : (j.annualSalary ? `${j.annualSalary} / an` : "");
      const salaryObj = parseSalaryDetails(salaryText);
      const skillNames = (j.skills || []).map((s) => s.name).filter(Boolean);
      const tags = extractTechStack(title, "", skillNames);
      const category = categorizeJob(title, "", tags);
      const region = detectRegion("France", title, tags);

      return {
        id: `freework-${j.id}`,
        title,
        company: comp,
        company_logo: (j.company && j.company.logo && j.company.logo.medium) || "",
        url,
        category: category.label,
        categoryId: category.id,
        categoryIcon: category.icon,
        contractType: contract.label,
        contractTypeId: contract.id,
        contractIcon: contract.icon,
        tags,
        job_type: contract.label,
        location: "France (100% Télétravail)",
        region: region.label,
        regionId: region.id,
        regionFlag: region.flag,
        salary: salaryObj.raw,
        salary_min_eur: salaryObj.min_eur,
        salary_max_eur: salaryObj.max_eur,
        salary_min_usd: salaryObj.min_usd,
        salary_max_usd: salaryObj.max_usd,
        currency: salaryObj.currency,
        published_at: j.publishedAt || new Date().toISOString(),
        description_snippet: stripHtml(title).slice(0, 280) + "...",
        source: "Free-Work",
        language: "fr",
        is_verified: 1,
      };
    });
  } catch (err) {
    console.warn("Source Free-Work erreur:", err.message);
    return [];
  }
}

/**
 * Source 12 : Greenhouse Public Boards (Licornes & Scale-ups Remote-First)
 */
export async function scrapeGreenhouseRemote() {
  const companies = [
    { slug: "platformsh", name: "Platform.sh" },
    { slug: "algolia", name: "Algolia" },
    { slug: "dashlane", name: "Dashlane" },
    { slug: "dataiku", name: "Dataiku" },
    { slug: "openclassrooms", name: "OpenClassrooms" },
    { slug: "strapi", name: "Strapi" },
    { slug: "ledger", name: "Ledger" },
    { slug: "frontapp", name: "Front" },
    { slug: "qonto", name: "Qonto" },
  ];

  const results = await Promise.allSettled(
    companies.map(async ({ slug, name }) => {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const jobs = data.jobs || [];

      return jobs
        .filter((j) => {
          const loc = (j.location && j.location.name) || "";
          return (
            loc.toLowerCase().includes("remote") ||
            loc.toLowerCase().includes("télétravail") ||
            loc.toLowerCase().includes("anywhere") ||
            loc.toLowerCase().includes("france")
          );
        })
        .map((j) => {
          const title = j.title || "Poste Remote";
          const loc = (j.location && j.location.name) || "Worldwide";
          const tags = extractTechStack(title, "", []);
          const category = categorizeJob(title, "", tags);
          const region = detectRegion(loc, title, tags);
          const contract = detectContractType(title, "", "", tags);

          return {
            id: `gh-${slug}-${j.id}`,
            title,
            company: name,
            company_logo: "",
            url: j.absolute_url || `https://boards.greenhouse.io/${slug}/jobs/${j.id}`,
            category: category.label,
            categoryId: category.id,
            categoryIcon: category.icon,
            contractType: contract.label,
            contractTypeId: contract.id,
            contractIcon: contract.icon,
            tags,
            job_type: contract.label,
            location: loc,
            region: region.label,
            regionId: region.id,
            regionFlag: region.flag,
            salary: "",
            salary_min_eur: 0,
            salary_max_eur: 0,
            salary_min_usd: 0,
            salary_max_usd: 0,
            currency: "EUR",
            published_at: j.updated_at || new Date().toISOString(),
            description_snippet: `${title} chez ${name} (100% Remote / ${loc}).`,
            source: name,
            language: detectLanguage(title, "", tags),
            is_verified: 1,
          };
        });
    })
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);
}

/**
 * Source 13 : LaraJobs (100% Laravel, PHP, Livewire, Vue & Symfony)
 */
export async function scrapeLaraJobs() {
  try {
    const res = await fetchWithTimeout("https://larajobs.com/feed", {}, 6000);
    if (!res.ok) return [];
    const xml = await res.text();
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

    return itemMatches
      .map((itemXml) => {
        const titleMatch =
          itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        const creatorMatch =
          itemXml.match(/<dc:creator><!\[CDATA\[([\s\S]*?)\]\]><\/dc:creator>/i) ||
          itemXml.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/i);
        const locMatch =
          itemXml.match(/<job:location><!\[CDATA\[([\s\S]*?)\]\]><\/job:location>/i) ||
          itemXml.match(/<job:location>([\s\S]*?)<\/job:location>/i);
        const descMatch =
          itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
          itemXml.match(/<description>([\s\S]*?)<\/description>/i);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

        const title = titleMatch ? titleMatch[1].trim() : "Laravel / PHP Developer";
        const company = creatorMatch ? creatorMatch[1].trim() : "Laravel Co";
        const url = linkMatch ? linkMatch[1].trim() : "https://larajobs.com";
        const location = locMatch ? locMatch[1].trim() : "Worldwide (100% Remote)";
        const desc = descMatch ? descMatch[1] : "";
        const tags = extractTechStack(title, desc, ["Laravel", "PHP"]);
        const region = detectRegion(location, title, tags);
        const category = categorizeJob(title, "Engineering", tags);
        const contract = detectContractType(title, "", desc, tags);

        return {
          id: `larajobs-${url.split("/").pop() || Math.random().toString(36).slice(2, 8)}`,
          title,
          company,
          company_logo: "",
          url,
          category: category.name || category.label,
          categoryId: category.id,
          categoryIcon: category.icon,
          contractType: contract.label,
          contractTypeId: contract.id,
          contractIcon: contract.icon,
          tags,
          job_type: contract.label,
          location,
          region: region.label,
          regionId: region.id,
          regionFlag: region.flag,
          salary: "",
          salary_min_eur: 0,
          salary_max_eur: 0,
          salary_min_usd: 0,
          salary_max_usd: 0,
          currency: "USD",
          published_at: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          description_snippet: stripHtml(desc).slice(0, 280) + "...",
          source: "LaraJobs",
          language: "en",
          is_verified: 1,
        };
      })
      .filter((j) => isStrictlyRemote(j.title, j.description_snippet));
  } catch (err) {
    console.warn("Source LaraJobs erreur:", err.message);
    return [];
  }
}

/**
 * Pipeline d'agrégation globale avec purge des offres obsolètes (> 30 jours / 1 mois)
 */
export async function scrapeAllJobs() {
  const tasks = [
    scrapeRemotive(),
    scrapeJobicy(),
    scrapeJobicyFrance(),
    scrapeArbeitnow(),
    scrapeRemoteOk(),
    scrapeWeWorkRemotely(),
    scrapeHackerNews(),
    scrapeHimalayas(),
    scrapeNoDesk(),
    scrapeWelcomeToTheJungle(),
    scrapeFreeWork(),
    scrapeGreenhouseRemote(),
    scrapeLaraJobs(),
  ];

  const results = await Promise.allSettled(tasks);
  const combined = [];

  results.forEach((r) => {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      combined.push(...r.value);
    }
  });

  const nowMs = Date.now();
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 jours max (< 1 mois)

  const seen = new Set();
  const uniqueJobs = [];

  for (const job of combined) {
    if (!job.title || !job.company) continue;

    // Purge des annonces de plus de 30 jours (fraîcheur garantie)
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
