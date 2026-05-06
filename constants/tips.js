const tips = [
  {
    tip: 'Always check gnomAD frequency—common variants are rarely pathogenic.',
    icon: 'Dna',
  },
  {
    tip: 'FFPE samples often cause C>T artifacts; confirm with strand bias.',
    icon: 'TestTube2',
  },
  {
    tip: 'Did you know? TP53 is mutated in over 50% of human cancers.',
    icon: 'BarChart3',
  },
  {
    tip: 'Tumor purity <20% dramatically reduces low-VAF detection sensitivity.',
    icon: 'Microscope',
  },
  {
    tip: 'High TMB? Check if MSI-H or POLE-mutant before concluding hypermutation.',
    icon: 'TrendingUp',
  },
  {
    tip: 'Many VUS get reclassified yearly—review them every 6–12 months.',
    icon: 'RefreshCcw',
  },
  {
    tip: 'NTRK fusions are rare but unlock tissue-agnostic therapy options.',
    icon: 'Target',
  },
  {
    tip: 'Check exon-level coverage to avoid missing mutations in GC-rich regions.',
    icon: 'ClipboardList',
  },
  {
    tip: 'Low VAF mutations can be clinically relevant—context is key.',
    icon: 'Brain',
  },
  {
    tip: 'MSI may appear false-low if tumor content is insufficient.',
    icon: 'AlertTriangle',
  },
  {
    tip: 'RNA-seq excels at detecting fusions missed by DNA panels.',
    icon: 'Microscope',
  },
  {
    tip: 'Copy number signatures can indicate homologous recombination deficiency.',
    icon: 'TrendingUp',
  },
  {
    tip: 'Always correlate PD-L1 scoring method (TPS vs CPS) with tumor type.',
    icon: 'ClipboardList',
  },
  {
    tip: 'Did you know? BRCA1 is involved in repairing double-strand breaks.',
    icon: 'Shield',
  },
  {
    tip: 'Use ONCOKB levels to communicate evidence strength clearly.',
    icon: 'FileText',
  },
  {
    tip: 'Check biological relevance—mutations in noncritical domains may be benign.',
    icon: 'Brain',
  },
  {
    tip: 'Matched-normal testing reduces false positives and germline confusion.',
    icon: 'CheckCircle2',
  },
  {
    tip: 'Tumor mutational signatures can reveal carcinogen exposure.',
    icon: 'Dna',
  },
  {
    tip: 'POLE mutations often create ultra-mutated tumors responsive to immunotherapy.',
    icon: 'Zap',
  },
  {
    tip: 'Did you know? Some cancers are driven by just a single fusion event.',
    icon: 'Lightbulb',
  },
  {
    tip: 'Always mention FDA-approved tissue-agnostic therapy options separately.',
    icon: 'ClipboardList',
  },
  {
    tip: 'Confirm germline suspicion when tumor shows high VAF truncating variants.',
    icon: 'AlertCircle',
  },
  {
    tip: 'Check for read orientation bias—it helps distinguish true variants from artifacts.',
    icon: 'Search',
  },
  {
    tip: 'Rare fusions (RET, ALK) can appear in unexpected cancer types.',
    icon: 'Target',
  },
  {
    tip: 'Coverage uniformity issues can hide important exons—always inspect QC.',
    icon: 'Activity',
  },
  {
    tip: 'Did you know? MSI-H tumors respond well to checkpoint inhibitors.',
    icon: 'Shield',
  },
  {
    tip: 'Consider tumor heterogeneity—subclonal mutations may predict resistance.',
    icon: 'Activity',
  },
  {
    tip: 'Always cite strong evidence sources like NCCN, ClinVar, COSMIC.',
    icon: 'FileText',
  },
  {
    tip: 'Check the domain hotspot before calling a variant as VUS.',
    icon: 'Search',
  },
  {
    tip: 'Use structural variant callers for complex fusions and rearrangements.',
    icon: 'Microscope',
  },
  {
    tip: 'Deep coverage (>500x) helps detect low-frequency resistance mutations.',
    icon: 'TrendingUp',
  },
  {
    tip: 'Did you know? Tumor-only testing misclassifies 5–15% germline variants.',
    icon: 'AlertTriangle',
  },
  {
    tip: 'Annotate using multiple databases—each offers unique insights.',
    icon: 'Copy',
  },
  {
    tip: 'Check sample age—old FFPE blocks degrade DNA significantly.',
    icon: 'Clock',
  },
  {
    tip: 'Always verify gene fusion breakpoints—they impact drug response.',
    icon: 'Target',
  },
  {
    tip: 'MSI by NGS should be cross-checked with IHC if results are borderline.',
    icon: 'TestTube2',
  },
  {
    tip: 'Did you know? KRAS G12C inhibitors have changed lung cancer therapy.',
    icon: 'Zap',
  },
  {
    tip: 'TMB thresholds differ by cancer type—avoid a one-size-fits-all approach.',
    icon: 'BarChart3',
  },
  {
    tip: 'Check for concurrent mutations—co-alterations can influence therapy.',
    icon: 'Dna',
  },
  {
    tip: 'FFPE deamination increases with storage temperature—store blocks cool.',
    icon: 'AlertTriangle',
  },
  {
    tip: 'Did you know? BRAF V600E is highly actionable across several cancers.',
    icon: 'CheckCircle2',
  },
  {
    tip: 'Ensure decalcification method supports DNA integrity for bone samples.',
    icon: 'FlaskConical',
  },
  {
    tip: 'Check fusion isoform—different isoforms respond differently to therapy.',
    icon: 'RefreshCcw',
  },
  {
    tip: 'Use orthogonal methods for low-frequency indels or homopolymer regions.',
    icon: 'Check',
  },
  {
    tip: 'Keep an update calendar—ClinVar and COSMIC refresh frequently.',
    icon: 'Calendar',
  },
  {
    tip: 'Did you know? EGFR exon 20 insertions are resistant to first-gen TKIs.',
    icon: 'AlertCircle',
  },
  {
    tip: 'Always confirm final calls with biological plausibility—not just software.',
    icon: 'Brain',
  },
  {
    tip: 'HRD may be present even without BRCA mutations—check the genomic scar.',
    icon: 'Search',
  },
  {
    tip: 'Fusion-negative doesn’t mean fusion-absent—check RNA sequencing too.',
    icon: 'Microscope',
  },
  {
    tip: 'Did you know? Genomic amplifications can be more actionable than mutations.',
    icon: 'TrendingUp',
  },
];
export default tips;
