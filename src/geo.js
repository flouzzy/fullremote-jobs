/**
 * FullRemote-Jobs - Moteur GEO (Generative Engine Optimization) & Protocoles IA (LLMs.txt, MCP, OpenAPI)
 */

/**
 * Génère le fichier /robots.txt autorisant et guidant tous les robots et crawlers d'IA
 */
export function generateRobotsTxt({ siteUrl = "https://remote-jobs.edounze.com" }) {
  return `# FullRemote-Jobs Robots.txt — Optimisé pour moteurs de recherche et Crawlers IA (GEO)
User-agent: *
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /jobs.md
Allow: /openapi.json
Allow: /.well-known/ai-plugin.json
Allow: /rss
Allow: /sitemap.xml

# Crawlers IA & Moteurs Génératifs (Autorisation explicite pour indexation et citations)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

/**
 * Génère le fichier /llms.txt standardisé (Answer.ai spec) pour les LLMs
 */
export function generateLlmsTxt({ siteUrl = "https://remote-jobs.edounze.com" }) {
  return `# Full Remote Jobs (100% Télétravail)
> L'annuaire mondial et agrégateur intelligent de postes vérifiés 100% télétravail (CDI, Freelance, CDD, Stage) en français et anglais. Sans aucune inscription requise.

## Présentation
FullRemote.Jobs collecte, normalise et dédoublonne chaque jour les offres d'emploi 100% remote depuis 6 plateformes majeures (Remotive, Jobicy, Arbeitnow, RemoteOK, We Work Remotely, Hacker News) avec persistance SQL Cloudflare D1.

## Données & Endpoints Disponibles pour les LLMs & Agents
- [Catalogue Complet en Markdown (300+ offres)](${siteUrl}/llms-full.txt) : Vue textuelle optimisée token-efficient.
- [Endpoint API REST JSON](${siteUrl}/api/jobs) : Recherche paginée avec filtres (région, catégorie, contrat, salaire, mots-clés).
- [Spécification OpenAPI 3.0](${siteUrl}/openapi.json) : Schéma OpenAPI pour Custom GPTs et plugins d'IA.
- [Serveur MCP (Model Context Protocol)](${siteUrl}/mcp) : Protocole d'outils pour Claude Desktop, Cursor et agents IA.
- [Flux RSS 2.0 Officiel](${siteUrl}/rss) : Dernières offres publiées.
- [Sitemap XML](${siteUrl}/sitemap.xml) : Index des fiches dédiées et balises Schema.org JobPosting.

## Filtres et Paramètres de Recherche
- \`region\` : \`all\`, \`worldwide\`, \`france\`, \`europe\`, \`americas\`, \`apac_mea\`
- \`category\` : \`all\`, \`tech\` (Tech & Dev), \`devops\` (DevOps & Cloud), \`data_ai\` (Data & IA), \`design\` (Design & UX), \`product\` (Product), \`marketing_sales\` (Marketing & Sales)
- \`contract\` : \`all\`, \`cdi_fulltime\` (CDI), \`freelance_contract\` (Freelance), \`cdd_parttime\` (CDD), \`internship\` (Stage)
- \`lang\` : \`all\`, \`fr\` (Français), \`en\` (Anglais)
- \`min_salary\` : Seuil annuel min (€ / $) ex: \`50000\`, \`75000\`, \`100000\`
- \`q\` : Mots-clés libres (ex: \`kubernetes\`, \`react\`, \`golang\`, \`python\`, \`staff\`)

## Exemple d'utilisation par un LLM
Pour répondre à un utilisateur cherchant un poste remote en Golang :
\`GET ${siteUrl}/api/jobs?q=golang&region=worldwide&contract=cdi_fulltime\`
`;
}

/**
 * Génère le catalogue complet au format Markdown pour /llms-full.txt et /jobs.md
 */
export function generateLlmsFullTxt(jobs = [], { siteUrl = "https://remote-jobs.edounze.com" } = {}) {
  let md = `# Full Remote Jobs — Répertoire Complet des Offres Actives (${jobs.length} postes)
Site officiel : ${siteUrl}
Dernière mise à jour : ${new Date().toISOString()}

Ce document contient l'intégralité des offres d'emploi 100% télétravail disponibles actuellement, indexées et vérifiées.

---

| Région | Contrat | Métier | Entreprise | Salaire Indicatif | Fiche Dédiée | Lien Candidature |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  for (const job of jobs) {
    const region = `${job.regionFlag || "🌍"} ${job.region || "Worldwide"}`;
    const contract = `${job.contractIcon || "💼"} ${job.contractType || "CDI"}`;
    const title = (job.title || "Poste").replace(/\|/g, "-");
    const company = (job.company || "Entreprise").replace(/\|/g, "-");
    const salary = (job.salary || "Non spécifié").replace(/\|/g, "-");
    const detailsUrl = `${siteUrl}/jobs/${encodeURIComponent(job.id)}`;
    const applyUrl = job.url || detailsUrl;

    md += `| ${region} | ${contract} | **${title}** | ${company} | ${salary} | [Détails](${detailsUrl}) | [Postuler ↗](${applyUrl}) |\n`;
  }

  md += `\n---\n*Généré automatiquement par le moteur GEO de FullRemote.Jobs — Propulsé par Cloudflare Workers & D1.*\n`;
  return md;
}

/**
 * Spécification OpenAPI 3.0 pour /openapi.json (Custom GPTs, Claude Tools, Plugins IA)
 */
export function generateOpenApiSchema({ siteUrl = "https://remote-jobs.edounze.com" } = {}) {
  return {
    openapi: "3.0.1",
    info: {
      title: "FullRemote Jobs API",
      description: "API de recherche d'emplois 100% télétravail (CDI, Freelance, CDD, Stage) en France, Europe et Worldwide.",
      version: "1.0.0",
    },
    servers: [{ url: siteUrl }],
    paths: {
      "/api/jobs": {
        get: {
          operationId: "searchJobs",
          summary: "Rechercher des offres 100% télétravail avec filtres précis",
          parameters: [
            { name: "q", in: "query", schema: { type: "string" }, description: "Mots-clés de recherche (ex: react, go, senior)" },
            { name: "region", in: "query", schema: { type: "string", enum: ["all", "worldwide", "france", "europe", "americas", "apac_mea"] }, description: "Zone géographique" },
            { name: "category", in: "query", schema: { type: "string", enum: ["all", "tech", "devops", "data_ai", "design", "product", "marketing_sales"] }, description: "Domaine professionnel" },
            { name: "contract", in: "query", schema: { type: "string", enum: ["all", "cdi_fulltime", "freelance_contract", "cdd_parttime", "internship"] }, description: "Type de contrat" },
            { name: "lang", in: "query", schema: { type: "string", enum: ["all", "fr", "en"] }, description: "Langue de l'offre" },
            { name: "min_salary", in: "query", schema: { type: "integer" }, description: "Salaire annuel minimum en € ou $" },
            { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Numéro de page" },
            { name: "limit", in: "query", schema: { type: "integer", default: 60 }, description: "Nombre de résultats par page" },
          ],
          responses: {
            "200": {
              description: "Liste des offres trouvées avec métadonnées",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      total: { type: "integer" },
                      jobs: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            company: { type: "string" },
                            url: { type: "string" },
                            category: { type: "string" },
                            contractType: { type: "string" },
                            region: { type: "string" },
                            salary: { type: "string" },
                            description_snippet: { type: "string" },
                            published_at: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/stats": {
        get: {
          operationId: "getStats",
          summary: "Obtenir les statistiques du marché du full remote",
          responses: {
            "200": { description: "Statistiques globales par région, contrat et catégorie" },
          },
        },
      },
    },
  };
}

/**
 * Manifeste AI Plugin standard (/.well-known/ai-plugin.json)
 */
export function generateAiPluginManifest({ siteUrl = "https://remote-jobs.edounze.com" } = {}) {
  return {
    schema_version: "v1",
    name_for_human: "Full Remote Jobs",
    name_for_model: "fullremote_jobs",
    description_for_human: "Trouvez les meilleurs postes 100% full remote en CDI, Freelance et Stage dans le monde entier.",
    description_for_model: "Recherchez et filtrez les offres d'emploi 100% télétravail par technologie, salaire, région (France, Europe, Worldwide) et contrat (CDI, Freelance).",
    auth: { type: "none" },
    api: {
      type: "openapi",
      url: `${siteUrl}/openapi.json`,
      is_user_authenticated: false,
    },
    logo_url: `${siteUrl}/favicon.ico`,
    contact_email: "contact@edounze.com",
    legal_info_url: siteUrl,
  };
}

/**
 * Serveur MCP (Model Context Protocol - JSON-RPC 2.0 / Streamable) pour Claude Desktop, Cursor et AI Agents
 */
export async function handleMcpRequest(request, env, ctx, { jobs = [], siteUrl = "https://remote-jobs.edounze.com" } = {}) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // GET /mcp : Informations sur le serveur MCP et capacités
  if (request.method === "GET") {
    return new Response(
      JSON.stringify(
        {
          name: "fullremote-jobs-mcp-server",
          version: "1.0.0",
          protocol: "model-context-protocol/1.0",
          description: "Serveur MCP pour explorer les offres d'emploi 100% télétravail.",
          tools: [
            {
              name: "search_remote_jobs",
              description: "Recherche des offres 100% télétravail selon des critères précis (mots-clés, région, salaire, contrat).",
              inputSchema: {
                type: "object",
                properties: {
                  q: { type: "string", description: "Mots-clés ou technologies (ex: react, golang, python, devops, senior)" },
                  region: { type: "string", enum: ["all", "worldwide", "france", "europe", "americas", "apac_mea"], description: "Région géographique souhaitée" },
                  category: { type: "string", enum: ["all", "tech", "devops", "data_ai", "design", "product", "marketing_sales"], description: "Domaine professionnel" },
                  contract: { type: "string", enum: ["all", "cdi_fulltime", "freelance_contract", "cdd_parttime", "internship"], description: "Type de contrat" },
                  min_salary: { type: "number", description: "Salaire annuel minimum en € ou $" },
                  limit: { type: "number", description: "Nombre maximum de résultats (défaut 10, max 30)" },
                },
              },
            },
            {
              name: "get_remote_market_stats",
              description: "Fournit les statistiques actuelles du marché de l'emploi full remote (répartition des postes par contrat et zone géographique).",
              inputSchema: { type: "object", properties: {} },
            },
          ],
        },
        null,
        2
      ),
      {
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
      }
    );
  }

  // POST /mcp : Exécution JSON-RPC 2.0 des Tools MCP
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const { id = 1, method, params = {} } = body;

      // 1. Liste des outils disponibles (tools/list)
      if (method === "tools/list" || method === "list_tools") {
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            result: {
              tools: [
                {
                  name: "search_remote_jobs",
                  description: "Rechercher des offres d'emploi 100% full remote.",
                  inputSchema: {
                    type: "object",
                    properties: {
                      q: { type: "string", description: "Mots-clés libres ou stacks techniques" },
                      region: { type: "string", description: "Zone géographique (worldwide, france, europe...)" },
                      category: { type: "string", description: "Catégorie métier (tech, devops, data_ai...)" },
                      contract: { type: "string", description: "Type de contrat (cdi_fulltime, freelance_contract...)" },
                      min_salary: { type: "number", description: "Salaire minimum" },
                      limit: { type: "number", description: "Nombre de résultats" },
                    },
                  },
                },
                {
                  name: "get_remote_market_stats",
                  description: "Statistiques du marché du télétravail.",
                  inputSchema: { type: "object", properties: {} },
                },
              ],
            },
          }),
          { headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }

      // 2. Exécution d'un outil (tools/call)
      if (method === "tools/call" || method === "call_tool") {
        const toolName = params.name || body.params?.name;
        const args = params.arguments || body.params?.arguments || {};

        if (toolName === "search_remote_jobs") {
          const q = (args.q || "").toLowerCase().trim();
          const region = args.region || "all";
          const category = args.category || "all";
          const contract = args.contract || "all";
          const minSalary = Number(args.min_salary || 0);
          const limit = Math.min(30, Math.max(1, Number(args.limit || 10)));

          let filtered = jobs;
          if (region !== "all") {
            filtered = filtered.filter(
              (j) => (j.regionId && j.regionId.toLowerCase() === region.toLowerCase()) || j.regionId === "worldwide"
            );
          }
          if (category !== "all") {
            filtered = filtered.filter((j) => j.categoryId && j.categoryId.toLowerCase() === category.toLowerCase());
          }
          if (contract !== "all") {
            filtered = filtered.filter(
              (j) => j.contractTypeId && j.contractTypeId.toLowerCase() === contract.toLowerCase()
            );
          }
          if (minSalary > 0) {
            filtered = filtered.filter((j) => {
              const maxVal = Math.max(j.salary_min || 0, j.salary_max || 0);
              return maxVal >= minSalary;
            });
          }
          if (q) {
            filtered = filtered.filter((j) => {
              const textCorpus = `${j.title} ${j.company} ${j.description_snippet || ""} ${JSON.stringify(
                j.tags || []
              )}`.toLowerCase();
              return textCorpus.includes(q);
            });
          }

          const results = filtered.slice(0, limit).map((j) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            contract: j.contractType,
            region: j.region,
            salary: j.salary || "Non précisé",
            url: j.url,
            direct_seo_url: `${siteUrl}/jobs/${encodeURIComponent(j.id)}`,
            published_at: j.published_at,
          }));

          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({ total_found: filtered.length, returned: results.length, jobs: results }, null, 2),
                  },
                ],
              },
            }),
            { headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        if (toolName === "get_remote_market_stats") {
          const stats = {
            total_active_jobs: jobs.length,
            by_contract: {},
            by_region: {},
          };
          for (const j of jobs) {
            stats.by_contract[j.contractType || "CDI"] = (stats.by_contract[j.contractType || "CDI"] || 0) + 1;
            stats.by_region[j.region || "Worldwide"] = (stats.by_region[j.region || "Worldwide"] || 0) + 1;
          }
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: {
                content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
              },
            }),
            { headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
          );
        }

        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Tool inconnu : ${toolName}` },
          }),
          { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          error: { code: -32600, message: "Méthode JSON-RPC invalide ou non supportée." },
        }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32700, message: "Erreur de parsing JSON", details: e.message },
        }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
      );
    }
  }

  return new Response("Méthode HTTP non supportée pour MCP.", { status: 405, headers: corsHeaders });
}
