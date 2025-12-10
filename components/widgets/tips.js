const tips = [
  {
    tip: "Always check gnomAD frequency—common variants are rarely pathogenic.",
    emoji: "🧬",
  },
  {
    tip: "FFPE samples often cause C>T artifacts; confirm with strand bias.",
    emoji: "🧪",
  },
  {
    tip: "Did you know? TP53 is mutated in over 50% of human cancers.",
    emoji: "📊",
  },
  {
    tip: "Tumor purity <20% dramatically reduces low-VAF detection sensitivity.",
    emoji: "🔍",
  },
  {
    tip: "High TMB? Check if MSI-H or POLE-mutant before concluding hypermutation.",
    emoji: "⚡",
  },
  {
    tip: "Many VUS get reclassified yearly—review them every 6–12 months.",
    emoji: "🔄",
  },
  {
    tip: "NTRK fusions are rare but unlock tissue-agnostic therapy options.",
    emoji: "🎯",
  },
  {
    tip: "Check exon-level coverage to avoid missing mutations in GC-rich regions.",
    emoji: "📈",
  },
  {
    tip: "Low VAF mutations can be clinically relevant—context is key.",
    emoji: "🧠",
  },
  {
    tip: "MSI may appear false-low if tumor content is insufficient.",
    emoji: "⚠️",
  },
  {
    tip: "RNA-seq excels at detecting fusions missed by DNA panels.",
    emoji: "🎙️",
  },
  {
    tip: "Copy number signatures can indicate homologous recombination deficiency.",
    emoji: "📐",
  },
  {
    tip: "Always correlate PD-L1 scoring method (TPS vs CPS) with tumor type.",
    emoji: "🧿",
  },
  {
    tip: "Did you know? BRCA1 is involved in repairing double-strand breaks.",
    emoji: "🛠️",
  },
  {
    tip: "Use ONCOKB levels to communicate evidence strength clearly.",
    emoji: "📚",
  },
  {
    tip: "Check biological relevance—mutations in noncritical domains may be benign.",
    emoji: "🧱",
  },
  {
    tip: "Matched-normal testing reduces false positives and germline confusion.",
    emoji: "👥",
  },
  {
    tip: "Tumor mutational signatures can reveal carcinogen exposure.",
    emoji: "🌱",
  },
  {
    tip: "POLE mutations often create ultra-mutated tumors responsive to immunotherapy.",
    emoji: "🚀",
  },
  {
    tip: "Did you know? Some cancers are driven by just a single fusion event.",
    emoji: "💡",
  },
  {
    tip: "Always mention FDA-approved tissue-agnostic therapy options separately.",
    emoji: "🏷️",
  },
  {
    tip: "Confirm germline suspicion when tumor shows high VAF truncating variants.",
    emoji: "🧾",
  },
  {
    tip: "Check for read orientation bias—it helps distinguish true variants from artifacts.",
    emoji: "🔎",
  },
  {
    tip: "Rare fusions (RET, ALK) can appear in unexpected cancer types.",
    emoji: "🔗",
  },
  {
    tip: "Coverage uniformity issues can hide important exons—always inspect QC.",
    emoji: "📏",
  },
  {
    tip: "Did you know? MSI-H tumors respond well to checkpoint inhibitors.",
    emoji: "🛡️",
  },
  {
    tip: "Consider tumor heterogeneity—subclonal mutations may predict resistance.",
    emoji: "🧩",
  },
  {
    tip: "Always cite strong evidence sources like NCCN, ClinVar, COSMIC.",
    emoji: "📘",
  },
  {
    tip: "Check the domain hotspot before calling a variant as VUS.",
    emoji: "🎯",
  },
  {
    tip: "Use structural variant callers for complex fusions and rearrangements.",
    emoji: "🛰️",
  },
  {
    tip: "Deep coverage (>500x) helps detect low-frequency resistance mutations.",
    emoji: "🌊",
  },
  {
    tip: "Did you know? Tumor-only testing misclassifies 5–15% germline variants.",
    emoji: "❗",
  },
  {
    tip: "Annotate using multiple databases—each offers unique insights.",
    emoji: "🗂️",
  },
  {
    tip: "Check sample age—old FFPE blocks degrade DNA significantly.",
    emoji: "⏳",
  },
  {
    tip: "Always verify gene fusion breakpoints—they impact drug response.",
    emoji: "🧲",
  },
  {
    tip: "MSI by NGS should be cross-checked with IHC if results are borderline.",
    emoji: "🔬",
  },
  {
    tip: "Did you know? KRAS G12C inhibitors have changed lung cancer therapy.",
    emoji: "🔥",
  },
  {
    tip: "TMB thresholds differ by cancer type—avoid a one-size-fits-all approach.",
    emoji: "📐",
  },
  {
    tip: "Check for concurrent mutations—co-alterations can influence therapy.",
    emoji: "🧵",
  },
  {
    tip: "FFPE deamination increases with storage temperature—store blocks cool.",
    emoji: "❄️",
  },
  {
    tip: "Did you know? BRAF V600E is highly actionable across several cancers.",
    emoji: "💊",
  },
  {
    tip: "Ensure decalcification method supports DNA integrity for bone samples.",
    emoji: "🦴",
  },
  {
    tip: "Check fusion isoform—different isoforms respond differently to therapy.",
    emoji: "🔄",
  },
  {
    tip: "Use orthogonal methods for low-frequency indels or homopolymer regions.",
    emoji: "🛠️",
  },
  {
    tip: "Keep an update calendar—ClinVar and COSMIC refresh frequently.",
    emoji: "🗓️",
  },
  {
    tip: "Did you know? EGFR exon 20 insertions are resistant to first-gen TKIs.",
    emoji: "🚫",
  },
  {
    tip: "Always confirm final calls with biological plausibility—not just software.",
    emoji: "🧡",
  },
  {
    tip: "HRD may be present even without BRCA mutations—check the genomic scar.",
    emoji: "🌌",
  },
  {
    tip: "Fusion-negative doesn’t mean fusion-absent—check RNA sequencing too.",
    emoji: "🎧",
  },
  {
    tip: "Did you know? Genomic amplifications can be more actionable than mutations.",
    emoji: "📢",
  },
];
export default tips;
