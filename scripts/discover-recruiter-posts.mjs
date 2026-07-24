import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const configPath = resolve(projectRoot, "config", "recruiter-sources.json");
const dataPath = resolve(projectRoot, "data", "recruiter-post-jobs.json");
const browserDataPath = resolve(projectRoot, "scripts", "recruiter-post-jobs.js");
const defaultModel = "gpt-5.6-terra";

const groupByModule = new Map([
  ["FI/CO", "Functional"],
  ["SD", "Functional"],
  ["MM", "Functional"],
  ["PP", "Functional"],
  ["QM", "Functional"],
  ["PM", "Functional"],
  ["WM/EWM", "Functional"],
  ["TM", "Functional"],
  ["HCM/SuccessFactors", "Functional"],
  ["Ariba", "Functional"],
  ["IBP", "Functional"],
  ["GRC", "Functional"],
  ["CRM/CX", "Functional"],
  ["ABAP/OO-ABAP", "Technical"],
  ["BTP", "Technical"],
  ["Fiori/UI5", "Technical"],
  ["CDS/OData", "Technical"],
  ["Integration Suite (CPI/PI-PO)", "Technical"],
  ["BW/4HANA", "Technical"],
  ["SAC", "Technical"],
  ["Basis", "Technical"],
  ["Security", "Technical"],
  ["Solution Architect", "Leadership"],
  ["Enterprise Architect", "Leadership"],
  ["S/4HANA Program Manager", "Leadership"],
  ["Delivery Lead", "Leadership"]
]);

const discoverySchema = {
  type: "object",
  additionalProperties: false,
  required: ["searchSummary", "candidates"],
  properties: {
    searchSummary: { type: "string" },
    candidates: {
      type: "array",
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "company",
          "recruiter",
          "location",
          "region",
          "workMode",
          "engagement",
          "module",
          "group",
          "rate",
          "sourceName",
          "postUrl",
          "applicationUrl",
          "applicationRoute",
          "postDate",
          "listingDate",
          "applicationStatus",
          "openEvidence",
          "summary",
          "responsibilities",
          "requirements",
          "skills"
        ],
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          recruiter: { type: ["string", "null"] },
          location: { type: "string" },
          region: { type: "string", enum: ["AU", "NZ"] },
          workMode: {
            type: "string",
            enum: ["Remote", "Hybrid", "On-site", "FIFO / site-based", "Not stated"]
          },
          engagement: {
            type: "string",
            enum: ["Permanent", "Contract", "Temporary", "Not stated"]
          },
          module: { type: "string" },
          group: {
            type: "string",
            enum: ["Functional", "Technical", "Leadership", "Other"]
          },
          rate: { type: ["string", "null"] },
          sourceName: { type: "string" },
          postUrl: { type: "string" },
          applicationUrl: { type: "string" },
          applicationRoute: {
            type: "string",
            enum: ["active-listing", "public-recruiter-post"]
          },
          postDate: { type: ["string", "null"] },
          listingDate: { type: ["string", "null"] },
          applicationStatus: {
            type: "string",
            enum: ["open", "closed", "unclear"]
          },
          openEvidence: { type: "string" },
          summary: { type: "string" },
          responsibilities: {
            type: "array",
            maxItems: 8,
            items: { type: "string" }
          },
          requirements: {
            type: "array",
            maxItems: 8,
            items: { type: "string" }
          },
          skills: {
            type: "array",
            maxItems: 12,
            items: { type: "string" }
          }
        }
      }
    }
  }
};

function cleanText(value, fallback = "") {
  return String(value ?? fallback)
    .replace(/\s+/g, " ")
    .trim();
}

function cleanList(values, maximum = 8) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => cleanText(value)).filter(Boolean))].slice(
    0,
    maximum
  );
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function canonicalUrl(value) {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|trk|tracking|ref|source)/i.test(key)) url.searchParams.delete(key);
  }
  const search = url.searchParams.toString();
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}${search ? `?${search}` : ""}`;
}

function parseIsoDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function ageInDays(value, now) {
  const date = parseIsoDate(value);
  return date ? Math.floor((now.valueOf() - date.valueOf()) / 86_400_000) : null;
}

function deriveModule(candidate) {
  const supplied = cleanText(candidate.module);
  const haystack = `${candidate.title} ${candidate.summary} ${candidate.skills?.join(" ") || ""} ${supplied}`.toLowerCase();
  const mappings = [
    [/\b(fi[\s/-]?co|fico|finance and control)\b/, "FI/CO"],
    [/\b(successfactors|sap hcm|human capital)\b/, "HCM/SuccessFactors"],
    [/\b(ariba)\b/, "Ariba"],
    [/\b(ewm|extended warehouse|warehouse management)\b/, "WM/EWM"],
    [/\b(transportation management|sap tm)\b/, "TM"],
    [/\b(integrated business planning|sap ibp)\b/, "IBP"],
    [/\b(grc|governance risk compliance)\b/, "GRC"],
    [/\b(cx|customer experience|sap crm)\b/, "CRM/CX"],
    [/\b(abap|oo-abap)\b/, "ABAP/OO-ABAP"],
    [/\b(btp|business technology platform)\b/, "BTP"],
    [/\b(fiori|ui5)\b/, "Fiori/UI5"],
    [/\b(cds|odata)\b/, "CDS/OData"],
    [/\b(cpi|pi-po|pi\/po|integration suite)\b/, "Integration Suite (CPI/PI-PO)"],
    [/\b(bw\/4hana|bw4hana|business warehouse)\b/, "BW/4HANA"],
    [/\b(sap analytics cloud|sac)\b/, "SAC"],
    [/\b(basis)\b/, "Basis"],
    [/\b(security|authorisations|authorizations)\b/, "Security"],
    [/\b(enterprise architect)\b/, "Enterprise Architect"],
    [/\b(solution architect)\b/, "Solution Architect"],
    [/\b(program manager|programme manager|project manager)\b/, "S/4HANA Program Manager"],
    [/\b(delivery lead|delivery manager)\b/, "Delivery Lead"],
    [/\b(sap sd|sales and distribution)\b/, "SD"],
    [/\b(sap mm|materials management|sourcing and procurement)\b/, "MM"],
    [/\b(sap pp|production planning)\b/, "PP"],
    [/\b(sap qm|quality management)\b/, "QM"],
    [/\b(sap pm|plant maintenance|asset management)\b/, "PM"]
  ];
  return mappings.find(([pattern]) => pattern.test(haystack))?.[1] || supplied || "Unclassified SAP";
}

function stableId(candidate) {
  const fingerprint = [
    cleanText(candidate.title).toLowerCase(),
    cleanText(candidate.company).toLowerCase(),
    canonicalUrl(candidate.applicationUrl).toLowerCase()
  ].join("|");
  return `recruiter-${createHash("sha256").update(fingerprint).digest("hex").slice(0, 12)}`;
}

function postedLabel(firstSeen, now) {
  const age = ageInDays(firstSeen, now);
  if (age === null || age <= 0) return "Posted today";
  return `Posted ${age} ${age === 1 ? "day" : "days"} ago`;
}

export function normaliseCandidate(candidate, options = {}) {
  const now = options.now || new Date();
  const today = now.toISOString().slice(0, 10);
  const maximumListingAgeDays = options.maximumListingAgeDays ?? 30;
  const maximumRecruiterPostOnlyAgeDays = options.maximumRecruiterPostOnlyAgeDays ?? 14;

  if (!candidate || candidate.applicationStatus !== "open") return null;
  if (!["AU", "NZ"].includes(candidate.region)) return null;
  if (!isHttpsUrl(candidate.postUrl) || !isHttpsUrl(candidate.applicationUrl)) return null;
  if (!/\b(sap|s\/4|s4hana|successfactors|ariba|business technology platform)\b/i.test(`${candidate.title} ${candidate.summary}`)) {
    return null;
  }

  const route = candidate.applicationRoute;
  const postAge = ageInDays(candidate.postDate, now);
  const listingAge = ageInDays(candidate.listingDate, now);
  if (postAge !== null && (postAge < 0 || postAge > maximumListingAgeDays)) return null;
  if (listingAge !== null && (listingAge < 0 || listingAge > maximumListingAgeDays)) return null;
  if (route === "public-recruiter-post" && (postAge === null || postAge > maximumRecruiterPostOnlyAgeDays)) {
    return null;
  }
  if (route === "active-listing" && listingAge === null && postAge === null) return null;

  const title = cleanText(candidate.title);
  const company = cleanText(candidate.company, "Employer not disclosed");
  const location = cleanText(candidate.location, candidate.region === "NZ" ? "New Zealand" : "Australia");
  const module = deriveModule(candidate);
  const group = groupByModule.get(module) || candidate.group || "Other";
  const verifiedAt = today;
  const firstSeen = candidate.listingDate || candidate.postDate || today;
  const recruiter = cleanText(candidate.recruiter) || null;
  const sourceName = cleanText(candidate.sourceName, route === "public-recruiter-post" ? "Public recruiter post" : "Public listing");
  const applicationUrl = canonicalUrl(candidate.applicationUrl);
  const postUrl = canonicalUrl(candidate.postUrl);

  return {
    id: stableId({ title, company, applicationUrl }),
    title,
    company,
    recruiter,
    location,
    region: candidate.region,
    workMode: candidate.workMode,
    stream: "SAP",
    group,
    module,
    rate: cleanText(candidate.rate) || null,
    engagement: candidate.engagement,
    source: sourceName,
    sourceUrl: applicationUrl,
    discoveryUrl: postUrl,
    discoverySource: "Public recruiter post",
    applicationRoute: route,
    provenance:
      route === "active-listing"
        ? `Public recruiter-authored vacancy discovered and its active public application route validated on ${verifiedAt}.`
        : `Fresh public recruiter-authored vacancy post confirmed open on ${verifiedAt}.`,
    firstSeen,
    postedLabel: postedLabel(firstSeen, now),
    verifiedAt,
    applyStatus: "open",
    priority: candidate.workMode === "Remote" ? "priority" : "current",
    priorityReason: cleanText(candidate.openEvidence),
    summary: cleanText(candidate.summary),
    responsibilities: cleanList(candidate.responsibilities),
    requirements: cleanList(candidate.requirements),
    skills: cleanList([module, ...(candidate.skills || [])], 12),
    type: candidate.engagement
  };
}

export function deduplicateJobs(jobs) {
  const seenUrls = new Set();
  const seenRoles = new Set();
  return jobs.filter((job) => {
    const urlKey = canonicalUrl(job.sourceUrl).toLowerCase();
    const roleKey = [job.title, job.company, job.location]
      .map((value) => cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " "))
      .join("|");
    if (seenUrls.has(urlKey) || seenRoles.has(roleKey)) return false;
    seenUrls.add(urlKey);
    seenRoles.add(roleKey);
    return true;
  });
}

export function extractOutputText(response) {
  for (const item of response?.output || []) {
    if (item.type !== "message") continue;
    for (const content of item.content || []) {
      if (content.type === "refusal") throw new Error(`Discovery request refused: ${content.refusal}`);
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  throw new Error("The Responses API returned no output_text item.");
}

function extractSearchSources(response) {
  const values = [];
  for (const item of response?.output || []) {
    if (item.type !== "web_search_call") continue;
    for (const source of item.action?.sources || []) {
      if (source.url && isHttpsUrl(source.url)) values.push(source.url);
    }
  }
  return [...new Set(values)];
}

function buildPrompt(group, previousJobs, today, config) {
  const organisations = group.organisations.join(", ");
  const people = group.people.length ? group.people.join(", ") : "No named people; search the organisations and their recruiters.";
  const prior = previousJobs
    .slice(0, 30)
    .map((job) => `- ${job.title} | ${job.company} | ${job.sourceUrl}`)
    .join("\n");

  return `You are the vacancy-verification component of Talent Radar. Today is ${today}.

Find fresh, recruiter-authored public posts advertising genuine SAP jobs in Australia or New Zealand for this search group.

Search group: ${group.label}
Recruitment organisations: ${organisations}
Named recruiters to check: ${people}

Also search beyond the named people within those organisations. Look for public LinkedIn posts and company updates that normal job-board searches can miss, then search the open web for a matching current job page or explicit public application route.

Previous discoveries to re-check when they belong to this group:
${prior || "- None"}

Acceptance rules:
- The vacancy must be an SAP role physically based in Australia or New Zealand, or explicitly remote within AU/NZ.
- The recruiter post must be public and no more than ${config.maximumListingAgeDays} days old.
- Prefer a matching current employer, recruiter, SEEK, LinkedIn Jobs or other public listing with an active Apply control.
- If there is no separate listing, accept the recruiter post itself only when it is no more than ${config.maximumRecruiterPostOnlyAgeDays} days old, clearly advertises a live role and gives an explicit way to express interest.
- Open the relevant pages and confirm the vacancy has not been marked closed, expired, filled or unavailable.
- Exclude speculative talent-pool posts, generic availability posts, training, sales pitches, old roles, duplicates and roles outside AU/NZ.
- Do not use private messages, inbox records or email alerts as evidence.
- Do not invent a date, work arrangement, rate, company, application URL or SAP module. Use "Not stated" or null where the schema permits it.
- applicationUrl must be the direct active listing URL when one exists. Otherwise use the public recruiter-post URL.
- postUrl must be the recruiter-authored public post or public company update that revealed the role.
- Write a concise non-verbatim summary, responsibilities and requirements so Talent Radar can show useful internal job details.
- Return only candidates whose applicationStatus is "open". Return an empty candidates array if none meet every rule.

Use web search thoroughly enough to check the named sources and validate each returned vacancy.`;
}

async function requestDiscovery({ apiKey, model, prompt }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      store: false,
      reasoning: { effort: "medium" },
      tools: [{ type: "web_search", search_context_size: "medium" }],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      max_output_tokens: 18000,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "recruiter_vacancy_discovery",
          strict: true,
          schema: discoverySchema
        }
      }
    }),
    signal: AbortSignal.timeout(360_000)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI Responses API failed (${response.status}): ${body.slice(0, 1200)}`);
  }

  const payload = await response.json();
  return {
    result: JSON.parse(extractOutputText(payload)),
    sources: extractSearchSources(payload)
  };
}

async function discoverGroup(options) {
  let finalError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await requestDiscovery(options);
    } catch (error) {
      finalError = error;
      if (attempt < 3) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 3000));
    }
  }
  throw finalError;
}

export function renderBrowserData(payload) {
  const meta = {
    generatedAt: payload.generatedAt,
    generatedDate: payload.generatedDate,
    model: payload.model,
    searchGroups: payload.searchGroups,
    sourcesReviewed: payload.sourcesReviewed,
    searchSummaries: payload.searchSummaries
  };
  return `(function loadRecruiterDiscoveredJobs() {
  "use strict";

  window.TalentRadarRecruiterMeta = Object.freeze(${JSON.stringify(meta, null, 2)});
  window.TalentRadarRecruiterJobs = Object.freeze(${JSON.stringify(payload.jobs, null, 2)});
})();
`;
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function run() {
  const args = new Set(process.argv.slice(2));
  const validateOnly = args.has("--validate-only");
  const config = await readJson(configPath, null);
  if (!config) throw new Error(`Missing discovery configuration at ${configPath}`);

  const previous = await readJson(dataPath, { jobs: [] });
  if (validateOnly) {
    const normalised = deduplicateJobs(previous.jobs || []);
    if (normalised.length !== (previous.jobs || []).length) {
      throw new Error("Generated recruiter data contains duplicate records.");
    }
    console.log(`Validated ${normalised.length} generated recruiter opportunities.`);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required. Store it as a GitHub Actions repository secret.");

  const model = process.env.OPENAI_DISCOVERY_MODEL || defaultModel;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const responses = await Promise.all(
    config.groups.map((group) =>
      discoverGroup({
        apiKey,
        model,
        prompt: buildPrompt(group, previous.jobs || [], today, config)
      })
    )
  );

  const candidates = responses.flatMap((response) => response.result.candidates || []);
  const jobs = deduplicateJobs(
    candidates
      .map((candidate) =>
        normaliseCandidate(candidate, {
          now,
          maximumListingAgeDays: config.maximumListingAgeDays,
          maximumRecruiterPostOnlyAgeDays: config.maximumRecruiterPostOnlyAgeDays
        })
      )
      .filter(Boolean)
  ).sort((left, right) => right.firstSeen.localeCompare(left.firstSeen) || left.title.localeCompare(right.title));

  if ((previous.jobs || []).length > 0 && jobs.length === 0 && process.env.ALLOW_EMPTY_DISCOVERY !== "1") {
    throw new Error(
      "Discovery returned no valid jobs while the previous snapshot was non-empty. The existing published data was preserved."
    );
  }

  const payload = {
    generatedAt: now.toISOString(),
    generatedDate: today,
    model,
    searchGroups: config.groups.length,
    sourcesReviewed: new Set(responses.flatMap((response) => response.sources)).size,
    searchSummaries: responses.map((response) => cleanText(response.result.searchSummary)).filter(Boolean),
    jobs
  };

  await writeFile(dataPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(browserDataPath, renderBrowserData(payload), "utf8");
  console.log(
    `Published ${jobs.length} verified recruiter-post opportunities from ${payload.sourcesReviewed} reviewed web sources.`
  );
}

const isCommandLine = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isCommandLine) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
