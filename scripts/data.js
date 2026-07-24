(function initialiseTalentRadarData() {
  "use strict";

  const snapshotDate = "2026-07-24";
  const sapGroups = [
    {
      id: "functional",
      name: "Functional",
      category: "Functional",
      modules: [
        "FI/CO",
        "SD",
        "MM",
        "PP",
        "QM",
        "PM",
        "WM/EWM",
        "TM",
        "HCM/SuccessFactors",
        "Ariba",
        "IBP",
        "GRC",
        "CRM/CX"
      ]
    },
    {
      id: "technical",
      name: "Technical",
      category: "Technical",
      modules: [
        "ABAP/OO-ABAP",
        "BTP",
        "Fiori/UI5",
        "CDS/OData",
        "Integration Suite (CPI/PI-PO)",
        "BW/4HANA",
        "SAC",
        "Basis",
        "Security"
      ]
    },
    {
      id: "leadership",
      name: "Leadership",
      category: "Leadership",
      modules: [
        "Solution Architect",
        "Enterprise Architect",
        "S/4HANA Program Manager",
        "Delivery Lead"
      ]
    }
  ];

  const otherGroups = [
    {
      id: "other",
      name: "Other workstream",
      category: "Other",
      modules: ["General PM/BA", "Data / Cloud", "Other ERP"]
    }
  ];

  const modules = [
    ...sapGroups.flatMap((group) =>
      group.modules.map((name) => ({
        id: name.toLowerCase().replaceAll("&", "and").replaceAll("/", "-").replaceAll(" ", "-"),
        name,
        stream: "SAP",
        group: group.name
      }))
    ),
    ...otherGroups.flatMap((group) =>
      group.modules.map((name) => ({
        id: name.toLowerCase().replaceAll("/", "-").replaceAll(" ", "-"),
        name,
        stream: "Other",
        group: group.name
      }))
    )
  ];

  const jobs = (window.TalentRadarLiveJobs || []).filter(
    (job) =>
      job.applyStatus === "open" &&
      /^https:\/\//.test(job.sourceUrl || "") &&
      !/inmail|email|recruiter message/i.test(`${job.source} ${job.provenance}`)
  );

  const sources = [
    {
      id: "seek",
      name: "SEEK",
      type: "Public job board",
      region: "Australia",
      ingestionMethod: "Direct public listing review",
      status: "verified",
      statusReason: "Apply or Quick Apply was visible on each included listing on 24 July 2026.",
      lastImport: snapshotDate,
      recordCount: jobs.filter((job) => job.source === "SEEK").length
    },
    {
      id: "linkedin",
      name: "LinkedIn Jobs",
      type: "Public job board",
      region: "Australia / New Zealand",
      ingestionMethod: "Direct public listing review",
      status: "verified",
      statusReason: "Apply was visible on each included listing on 24 July 2026.",
      lastImport: snapshotDate,
      recordCount: jobs.filter((job) => job.source === "LinkedIn Jobs").length
    }
  ];

  window.TalentRadarData = Object.freeze({
    meta: Object.freeze({
      product: "Talent Radar",
      coverage: "AU/NZ",
      snapshotDate,
      snapshotLabel: "Verified 24 July 2026",
      dataState: "Verified public listings",
      confirmedInboxRecordCount: 0,
      sapTaxonomyTagCount: sapGroups.reduce((sum, group) => sum + group.modules.length, 0),
      sourceCount: sources.length,
      lastLiveImport: snapshotDate,
      priorityRule: "Prioritise recent, remote and multi-region roles from currently open public listings.",
      disclaimer:
        "Every displayed role was checked against its public application page on 24 July 2026. Email and recruiter-message records are excluded."
    }),
    jobs: Object.freeze(jobs),
    pipeline: Object.freeze([]),
    sources: Object.freeze(sources),
    alerts: Object.freeze([]),
    modules: Object.freeze(modules),
    sapGroups: Object.freeze(sapGroups),
    otherGroups: Object.freeze(otherGroups)
  });
})();
