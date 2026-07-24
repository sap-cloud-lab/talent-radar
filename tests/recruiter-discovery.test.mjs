import assert from "node:assert/strict";
import test from "node:test";
import {
  deduplicateJobs,
  extractOutputText,
  normaliseCandidate,
  renderBrowserData
} from "../scripts/discover-recruiter-posts.mjs";

const currentDate = new Date("2026-07-25T06:00:00Z");

function candidate(overrides = {}) {
  return {
    title: "SAP Project Manager",
    company: "Example Recruitment",
    recruiter: "A Recruiter",
    location: "Auckland, New Zealand",
    region: "NZ",
    workMode: "Hybrid",
    engagement: "Contract",
    module: "S/4HANA Program Manager",
    group: "Leadership",
    rate: "$1,100–1,300/day",
    sourceName: "SEEK",
    postUrl: "https://www.linkedin.com/posts/example-sap-project-manager",
    applicationUrl: "https://www.seek.co.nz/job/123456?utm_source=linkedin",
    applicationRoute: "active-listing",
    postDate: "2026-07-22",
    listingDate: "2026-07-20",
    applicationStatus: "open",
    openEvidence: "The current listing displayed an Apply control.",
    summary: "Lead an S/4HANA delivery programme in Auckland.",
    responsibilities: ["Lead delivery", "Coordinate stakeholders"],
    requirements: ["S/4HANA programme experience"],
    skills: ["S/4HANA", "Programme delivery"],
    ...overrides
  };
}

test("normalises a fresh validated recruiter discovery into the app schema", () => {
  const job = normaliseCandidate(candidate(), { now: currentDate });
  assert.equal(job.region, "NZ");
  assert.equal(job.module, "S/4HANA Program Manager");
  assert.equal(job.sourceUrl, "https://www.seek.co.nz/job/123456");
  assert.equal(job.discoverySource, "Public recruiter post");
  assert.equal(job.applyStatus, "open");
  assert.match(job.id, /^recruiter-[a-f0-9]{12}$/);
});

test("rejects closed, stale and non-HTTPS opportunities", () => {
  assert.equal(normaliseCandidate(candidate({ applicationStatus: "closed" }), { now: currentDate }), null);
  assert.equal(
    normaliseCandidate(candidate({ postDate: "2026-05-01", listingDate: "2026-05-01" }), { now: currentDate }),
    null
  );
  assert.equal(
    normaliseCandidate(candidate({ applicationUrl: "http://example.com/job/1" }), { now: currentDate }),
    null
  );
});

test("requires a very fresh date for a recruiter-post-only route", () => {
  assert.equal(
    normaliseCandidate(
      candidate({
        applicationRoute: "public-recruiter-post",
        applicationUrl: "https://www.linkedin.com/posts/example-sap-project-manager",
        postDate: "2026-07-01",
        listingDate: null
      }),
      { now: currentDate }
    ),
    null
  );
});

test("deduplicates by canonical application URL", () => {
  const first = normaliseCandidate(candidate(), { now: currentDate });
  const second = normaliseCandidate(
    candidate({
      title: "SAP Programme Manager",
      applicationUrl: "https://www.seek.co.nz/job/123456?tracking=duplicate"
    }),
    { now: currentDate }
  );
  assert.equal(deduplicateJobs([first, second]).length, 1);
});

test("extracts structured output text and renders safe browser data", () => {
  const response = {
    output: [{ type: "message", content: [{ type: "output_text", text: "{\"candidates\":[]}" }] }]
  };
  assert.equal(extractOutputText(response), "{\"candidates\":[]}");
  const output = renderBrowserData({
    generatedAt: "2026-07-25T06:00:00.000Z",
    generatedDate: "2026-07-25",
    model: "gpt-5.6-terra",
    searchGroups: 3,
    sourcesReviewed: 8,
    searchSummaries: ["Checked public sources."],
    jobs: []
  });
  assert.match(output, /TalentRadarRecruiterJobs/);
  assert.match(output, /gpt-5\.6-terra/);
});
