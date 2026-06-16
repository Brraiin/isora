import {
  AlertTriangle,
  Briefcase,
  CalendarSync,
  Check,
  ExternalLink,
  FileText,
  GraduationCap,
  Gavel,
  HeartPulse,
  Landmark,
  Link,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Tags,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import isoraLogoUrl from "./assets/isora.svg";
import {
  claims,
  domains,
  type ClaimAngle,
  type Claim,
  type Domain,
  type Side,
  type StatutTemporel,
} from "./data/claims";

const sideLabels: Record<Side | "tous", string> = {
  tous: "Tous",
  hommes: "Hommes",
  femmes: "Femmes",
};

const angleLabels: Record<ClaimAngle | "tous", string> = {
  tous: "Tous les angles",
  désavantage_subi: "Désavantage subi",
  violence_exercée: "Violence exercée",
  récit_sur_le_sexe: "Récit sur le sexe",
};

const periodFilterLabels: Record<StatutTemporel | "tous", string> = {
  tous: "Toutes périodes",
  historique: "Historique",
  actuel: "Actuel",
  "en hausse": "En hausse",
  "en baisse": "En baisse",
  persistant: "Persistant",
  "lié à une crise": "Lié à une crise",
  "partiellement réformé": "Partiellement réformé",
  "variable selon pays": "Variable selon pays",
  "données insuffisantes": "Données insuffisantes",
};

type Locale = "fr" | "en";

const sideLabelsByLocale: Record<Locale, Record<Side | "tous", string>> = {
  fr: sideLabels,
  en: {
    tous: "All",
    hommes: "Men",
    femmes: "Women",
  },
};

const angleLabelsByLocale: Record<Locale, Record<ClaimAngle | "tous", string>> = {
  fr: angleLabels,
  en: {
    tous: "All angles",
    désavantage_subi: "Disadvantage experienced",
    violence_exercée: "Violence perpetrated",
    récit_sur_le_sexe: "Sex-based narrative",
  },
};

const periodFilterLabelsByLocale: Record<Locale, Record<StatutTemporel | "tous", string>> = {
  fr: periodFilterLabels,
  en: {
    tous: "All periods",
    historique: "Historical",
    actuel: "Current",
    "en hausse": "Increasing",
    "en baisse": "Decreasing",
    persistant: "Persistent",
    "lié à une crise": "Crisis-related",
    "partiellement réformé": "Partly reformed",
    "variable selon pays": "Varies by country",
    "données insuffisantes": "Insufficient data",
  },
};

const uiText: Record<Locale, Record<string, string>> = {
  fr: {
    tagline: "Le référentiel des asymétries liées au sexe",
    verifiedSources: "sources vérifiées",
    heroKicker: "Données sourcées, contexte lisible, contribution ouverte",
    heroTitle: "Lister les asymétries documentées selon le sexe",
    heroBody:
      "Isora recense des asymétries documentées par pays, période, domaine et angle d'analyse. Chaque fiche précise sa source, son contexte et la population réellement mesurée, pour rendre la donnée lisible, vérifiable et corrigeable.",
    menAsymmetries: "Asymétries concernant les hommes",
    womenAsymmetries: "Asymétries concernant les femmes",
    contribution: "Contribution",
    proposeClaim: "Proposer une asymétrie sourcée",
    searchPlaceholder: "Rechercher une fiche, un pays, une source...",
    searchLabel: "Recherche",
    weeklyWatch: "Veille hebdomadaire",
    activeFilters: "Filtres actifs",
    noFilters: "Aucun filtre sélectionné",
    clearAll: "Tout effacer",
    angles: "Angles",
    domains: "Domaines",
    claims: "Fiches",
    measuredPopulation: "Population mesurée",
    verifiedOn: "Vérifié le",
    contest: "Contester",
    copyLink: "Copier le lien de l'asymétrie",
    copiedLink: "Lien copié",
    language: "Langue",
  },
  en: {
    tagline: "The reference for sex-based asymmetries",
    verifiedSources: "verified sources",
    heroKicker: "Sourced data, readable context, open contribution",
    heroTitle: "Browse documented sex-based asymmetries",
    heroBody:
      "Isora tracks documented asymmetries by country, period, domain and editorial angle. Each entry states its source, context and actually measured population so the data stays readable, verifiable and correctable.",
    menAsymmetries: "Asymmetries concerning men",
    womenAsymmetries: "Asymmetries concerning women",
    contribution: "Contribution",
    proposeClaim: "Suggest a sourced asymmetry",
    searchPlaceholder: "Search an entry, country, source...",
    searchLabel: "Search",
    weeklyWatch: "Weekly watch",
    activeFilters: "Active filters",
    noFilters: "No selected filter",
    clearAll: "Clear all",
    angles: "Angles",
    domains: "Domains",
    claims: "Entries",
    measuredPopulation: "Measured population",
    verifiedOn: "Verified on",
    contest: "Contest",
    copyLink: "Copy the asymmetry link",
    copiedLink: "Link copied",
    language: "Language",
  },
};

const zoneLabels: Record<string, string> = {
  OCDE: "OCDE - Organisation de coopération et de développement économiques",
};

const domainIcons: Record<Domain, LucideIcon> = {
  Travail: Briefcase,
  Santé: HeartPulse,
  Famille: Users,
  Justice: Gavel,
  Éducation: GraduationCap,
  Revenus: Landmark,
  Violences: ShieldAlert,
  Religieux: FileText,
  Droits: Gavel,
  Conflits: ShieldAlert,
  Numérique: FileText,
  Autonomie: HeartPulse,
};

const latestCheck = "15 juin 2026";
const canonicalUrl = "https://isora-xi.vercel.app/";

async function sendContribution(title: string, payload: unknown) {
  const response = await fetch("/api/contributions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ title, payload }),
  });

  if (!response.ok) {
    throw new Error("contribution_failed");
  }
}

const pageWidth = "mx-auto w-[min(1200px,calc(100%_-_48px))] max-[760px]:w-[min(100%_-_24px,1200px)]";
const panel = "bg-white ring-1 ring-inset ring-neutral-300";
const icon18 = "[&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0";
const primaryAction =
  "inline-flex min-h-11 items-center justify-center gap-2 border-0 bg-blue-800 px-4 font-bold text-white whitespace-nowrap hover:bg-blue-700 max-[760px]:w-full";
const field =
  "min-h-[42px] w-full border-0 border-b-2 border-blue-800 bg-neutral-200 px-2.5 text-neutral-900 outline-0";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function IsoraWordmark({ className }: { className?: string }) {
  return (
    <img
      className={cn("block h-auto object-contain", className)}
      src={isoraLogoUrl}
      alt="isora"
    />
  );
}

function getNextMonday(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const distance = day === 1 ? 7 : (8 - day) % 7 || 7;
  next.setDate(next.getDate() + distance);
  return next;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function formatTagLabel(label: string) {
  return label.charAt(0).toLocaleUpperCase("fr-FR") + label.slice(1);
}

function getPeriodLabel(claim: Claim) {
  return `${claim.periode_debut}${claim.periode_fin ? `-${claim.periode_fin}` : "+"}`;
}

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((currentValue) => currentValue !== value) : [...values, value];
}

function interleaveClaimsBySide(list: Claim[]) {
  const men = list.filter((claim) => claim.side === "hommes");
  const women = list.filter((claim) => claim.side === "femmes");
  const ordered: Claim[] = [];
  const maxLength = Math.max(men.length, women.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (men[index]) ordered.push(men[index]);
    if (women[index]) ordered.push(women[index]);
  }

  return ordered;
}

function getClaimIdFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return claims.some((claim) => claim.id === id) ? id : null;
}

function HighlightedSummary({ text }: { text: string }) {
  const metricPattern =
    /((?:environ|près de|plus de|moins de|autour de|à plus de|à moins de)?\s*\d[\d\s]*(?:,\d+)?(?:\s*(?:%|M\b|millions?|ans?|semaines?|sem\.|pour 100 000|\/an))?(?:\s*(?:contre|vs|à|-)\s*\d[\d\s]*(?:,\d+)?(?:\s*(?:%|M\b|millions?|ans?))?)?)/gi;
  const parts = text.split(metricPattern).filter(Boolean);

  return (
    <p className="mt-4 leading-[1.64] text-neutral-700">
      {parts.map((part, index) =>
        /\d/.test(part) ? (
          <strong className="font-semibold text-neutral-900" key={`${part}-${index}`}>
            {part}
          </strong>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </p>
  );
}

function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "fr";
    return window.localStorage.getItem("isora:locale") === "en" ? "en" : "fr";
  });
  const [side, setSide] = useState<Side | "tous">("tous");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<StatutTemporel[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [domain, setDomain] = useState<Domain | "tous">("tous");
  const [angle, setAngle] = useState<ClaimAngle | "tous">("tous");
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [sharedClaimId, setSharedClaimId] = useState(() => getClaimIdFromHash());
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [contestedClaim, setContestedClaim] = useState<Claim | null>(null);
  const [contestSources, setContestSources] = useState([""]);
  const [contestSubmitted, setContestSubmitted] = useState(false);
  const [contestError, setContestError] = useState(false);
  const text = uiText[locale];
  const displaySideLabels = sideLabelsByLocale[locale];
  const displayAngleLabels = angleLabelsByLocale[locale];
  const displayPeriodLabels = periodFilterLabelsByLocale[locale];
  const nextWeeklyRun = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(getNextMonday(new Date())),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "fr";
    window.localStorage.setItem("isora:locale", locale);
  }, [locale]);

  useEffect(() => {
    function syncSharedClaim() {
      setSharedClaimId(getClaimIdFromHash());
    }

    window.addEventListener("hashchange", syncSharedClaim);

    return () => window.removeEventListener("hashchange", syncSharedClaim);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");

    function syncColumnMode() {
      setIsSingleColumn(mediaQuery.matches);
    }

    syncColumnMode();
    mediaQuery.addEventListener("change", syncColumnMode);

    return () => mediaQuery.removeEventListener("change", syncColumnMode);
  }, []);

  const filteredClaims = useMemo(() => {
    const normalizedQuery = normalize(query);
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    const matchingClaims = claims.filter((claim) => {
      const matchesSide = side === "tous" || claim.side === side;
      const matchesTag =
        selectedTags.length === 0 || selectedTags.every((tag) => claim.tags.includes(tag));
      const matchesZone = selectedZones.length === 0 || selectedZones.includes(claim.pays_ou_zone);
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(claim.statut_temporel);
      const matchesPeriod =
        selectedPeriods.length === 0 || selectedPeriods.includes(getPeriodLabel(claim));
      const matchesDomain = domain === "tous" || claim.domain === domain;
      const matchesAngle = angle === "tous" || claim.angle === angle;
      const searchable = normalize(
        [
          claim.title,
          claim.summary,
          claim.translations?.en?.title ?? "",
          claim.translations?.en?.summary ?? "",
          claim.translations?.en?.nuance ?? "",
          claim.translations?.en?.sourcePopulation ?? "",
          claim.translations?.en?.tags?.join(" ") ?? "",
          claim.metric,
          angleLabels[claim.angle],
          angleLabelsByLocale.en[claim.angle],
          claim.domain,
          claim.pays_ou_zone,
          claim.statut_temporel,
          claim.sourcePopulation ?? "",
          claim.source.publisher,
          claim.tags.join(" "),
        ].join(" "),
      );
      const matchesQuery = queryTerms.length === 0 || queryTerms.every((term) => searchable.includes(term));

      return (
        matchesSide &&
        matchesTag &&
        matchesZone &&
        matchesStatus &&
        matchesPeriod &&
        matchesDomain &&
        matchesAngle &&
        matchesQuery
      );
    });

    return side === "tous" ? interleaveClaimsBySide(matchingClaims) : matchingClaims;
  }, [angle, domain, query, selectedPeriods, selectedStatuses, selectedTags, selectedZones, side]);

  const claimColumns = useMemo(() => {
    if (isSingleColumn) return [filteredClaims];

    return [
      filteredClaims.filter((_, index) => index % 2 === 0),
      filteredClaims.filter((_, index) => index % 2 === 1),
    ];
  }, [filteredClaims, isSingleColumn]);

  const counts = useMemo(
    () => ({
      hommes: claims.filter((claim) => claim.side === "hommes").length,
      femmes: claims.filter((claim) => claim.side === "femmes").length,
      fiches: claims.length,
      sources: new Set(
        claims.flatMap((claim) => [
          claim.source.url,
          ...(claim.additionalSources?.map((source) => source.url) ?? []),
        ]),
      ).size,
    }),
    [],
  );

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: "Isora - Asymétries documentées selon le sexe",
          description:
            "Référentiel de fiches sourcées sur les asymétries documentées selon le sexe, avec source, pays ou zone, période, population mesurée et nuance.",
          inLanguage: "fr-FR",
          dateModified: "2026-06-16",
          isPartOf: {
            "@id": `${canonicalUrl}#website`,
          },
          about: domains.map((label) => ({ "@type": "Thing", name: label })),
        },
        {
          "@type": "ItemList",
          "@id": `${canonicalUrl}#claims`,
          name: "Fiches documentées Isora",
          numberOfItems: claims.length,
          itemListElement: claims.slice(0, 60).map((claim, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${canonicalUrl}#${claim.id}`,
            name: claim.title,
            description: claim.summary,
          })),
        },
      ],
    }),
    [],
  );

  const domainStats = useMemo(
    () =>
      domains.map((label) => ({
        label,
        total: claims.filter((claim) => claim.domain === label).length,
      })),
    [],
  );

  const angleStats = useMemo(
    () =>
      (Object.keys(angleLabels).filter((label) => label !== "tous") as ClaimAngle[]).map((label) => ({
        label,
        total: claims.filter((claim) => claim.angle === label).length,
      })),
    [],
  );

  const selectedFilters = useMemo(
    () =>
      [
        side !== "tous" ? { key: "side", label: displaySideLabels[side], clear: () => setSide("tous") } : null,
        angle !== "tous" ? { key: "angle", label: displayAngleLabels[angle], clear: () => setAngle("tous") } : null,
        domain !== "tous" ? { key: "domain", label: domain, clear: () => setDomain("tous") } : null,
        ...selectedZones.map((zone) => ({
          key: `zone-${zone}`,
          label: zoneLabels[zone] ?? zone,
          clear: () => setSelectedZones((currentZones) => currentZones.filter((currentZone) => currentZone !== zone)),
        })),
        ...selectedStatuses.map((status) => ({
          key: `status-${status}`,
          label: displayPeriodLabels[status],
          clear: () =>
            setSelectedStatuses((currentStatuses) =>
              currentStatuses.filter((currentStatus) => currentStatus !== status),
            ),
        })),
        ...selectedPeriods.map((period) => ({
          key: `period-${period}`,
          label: period,
          clear: () =>
            setSelectedPeriods((currentPeriods) =>
              currentPeriods.filter((currentPeriod) => currentPeriod !== period),
            ),
        })),
        ...selectedTags.map((tag) => ({
          key: `tag-${tag}`,
          label: formatTagLabel(tag),
          clear: () => setSelectedTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag)),
        })),
      ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>,
    [angle, displayAngleLabels, displayPeriodLabels, displaySideLabels, domain, selectedPeriods, selectedStatuses, selectedTags, selectedZones, side],
  );

  const maxDomainCount = Math.max(...domainStats.map((stat) => stat.total), 1);
  const sharedClaim = sharedClaimId ? claims.find((claim) => claim.id === sharedClaimId) : null;

  function addTag(label: string) {
    setSelectedTags((currentTags) => toggleValue(currentTags, label));
  }

  async function handleSuggestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError(false);
    const formData = new FormData(event.currentTarget);
    const suggestion = {
      type: "suggestion_asymetrie",
      side: formData.get("side"),
      angle: formData.get("angle"),
      title: formData.get("title"),
      summary: formData.get("summary"),
      pageUrl: window.location.href,
      createdAt: new Date().toISOString(),
    };

    const stored = JSON.parse(localStorage.getItem("sexedata:suggestions") ?? "[]");
    localStorage.setItem("sexedata:suggestions", JSON.stringify([...stored, suggestion]));

    try {
      await sendContribution(`Suggestion Isora - ${suggestion.title}`, suggestion);
      event.currentTarget.reset();
      setSubmitted(true);
    } catch {
      setSubmissionError(true);
    }
  }

  function openContestForm(claim: Claim) {
    setContestedClaim(claim);
    setContestSources([""]);
    setContestSubmitted(false);
  }

  function closeContestForm() {
    setContestedClaim(null);
    setContestSources([""]);
    setContestSubmitted(false);
    setContestError(false);
  }

  function updateContestSource(index: number, value: string) {
    setContestSources((currentSources) =>
      currentSources.map((source, sourceIndex) => (sourceIndex === index ? value : source)),
    );
  }

  async function handleContestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contestedClaim) return;
    setContestError(false);

    const formData = new FormData(event.currentTarget);
    const contestation = {
      type: "contestation_asymetrie",
      claimId: contestedClaim.id,
      claimTitle: contestedClaim.title,
      claimUrl: `${window.location.origin}${window.location.pathname}#${contestedClaim.id}`,
      correction: formData.get("correction"),
      sources: contestSources.map((source) => source.trim()).filter(Boolean),
      pageUrl: window.location.href,
      createdAt: new Date().toISOString(),
    };

    const stored = JSON.parse(localStorage.getItem("sexedata:contestations") ?? "[]");
    localStorage.setItem("sexedata:contestations", JSON.stringify([...stored, contestation]));

    try {
      await sendContribution(`Contestation Isora - ${contestedClaim.title}`, contestation);
      event.currentTarget.reset();
      setContestSources([""]);
      setContestSubmitted(true);
    } catch {
      setContestError(true);
    }
  }

  return (
    <div className="min-w-80 bg-neutral-100 font-sans text-neutral-900 antialiased">
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <header className="border-neutral-300 bg-white" role="banner">
        <div className={cn(pageWidth, "flex min-h-[76px] items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start max-[760px]:py-3.5")}>
          <div className="flex items-baseline gap-4 max-[760px]:gap-2.5">
            <div className="flex items-baseline gap-3.5 max-[760px]:items-center max-[760px]:gap-3">
              <a className="text-neutral-900 no-underline" href="/" aria-label="Accueil isora">
                <IsoraWordmark className="w-28 max-[760px]:w-24" />
              </a>
              <p className="m-0 leading-[1.45] text-neutral-500 max-[760px]:max-w-[19rem] max-[760px]:text-[0.92rem] max-[760px]:leading-[1.35]">
                {text.tagline}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 max-[760px]:w-full max-[760px]:justify-between">
            <a
              className="inline-flex min-h-10 items-center px-3.5 font-bold text-blue-800 underline decoration-1 underline-offset-[3px] hover:bg-blue-50"
              href="#fiches"
            >
              {counts.sources} {text.verifiedSources}
            </a>
            <div
              className="inline-flex min-h-10 items-center gap-1 bg-neutral-100 p-1 ring-1 ring-inset ring-neutral-300"
              aria-label={text.language}
            >
              {(["fr", "en"] as Locale[]).map((language) => (
                <button
                  className={cn(
                    "inline-flex min-h-8 items-center gap-1.5 border-0 px-2.5 text-sm font-extrabold text-neutral-700 hover:bg-blue-50 hover:text-blue-800",
                    locale === language && "bg-blue-800 text-white hover:bg-blue-800 hover:text-white",
                  )}
                  type="button"
                  key={language}
                  aria-pressed={locale === language}
                  onClick={() => setLocale(language)}
                >
                  <span aria-hidden="true">{language === "fr" ? "🇫🇷" : "🇬🇧"}</span>
                  {language.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-neutral-100">
        {sharedClaim ? (
          <section className={cn(pageWidth, "py-6 pb-14")}>
            <div className="mx-auto w-[min(100%,760px)]">
              <ClaimCard
                claim={sharedClaim}
                locale={locale}
                onAngleClick={(value) => setAngle((currentAngle) => (currentAngle === value ? "tous" : value))}
	                onDomainClick={(value) => setDomain((currentDomain) => (currentDomain === value ? "tous" : value))}
	                onPeriodClick={(value) => setSelectedPeriods((currentPeriods) => toggleValue(currentPeriods, value))}
	                onSideClick={(value) => setSide((currentSide) => (currentSide === value ? "tous" : value))}
	                onContestClick={openContestForm}
	                onStatusClick={(value) => setSelectedStatuses((currentStatuses) => toggleValue(currentStatuses, value))}
                onTagClick={addTag}
                onZoneClick={(value) => setSelectedZones((currentZones) => toggleValue(currentZones, value))}
                selectedAngle={angle}
                selectedDomain={domain}
                selectedPeriods={selectedPeriods}
                selectedSide={side}
                selectedStatuses={selectedStatuses}
                selectedTags={selectedTags}
                selectedZones={selectedZones}
                text={text}
              />
            </div>
          </section>
        ) : (
          <>
        <section className="border-b border-neutral-300 bg-emerald-50">
          <div className={cn(pageWidth, "py-[72px] pb-16 max-[760px]:py-10 max-[760px]:pb-8")}>
            <div className="max-w-[780px]">
              <p className="m-0 text-base font-extrabold leading-normal text-blue-800">
                {text.heroKicker}
              </p>
              <h1 className="mt-3.5 max-w-[780px] text-[3.45rem] font-extrabold leading-[1.1] tracking-normal text-neutral-900 max-[760px]:text-[2.35rem]">
                {text.heroTitle}
              </h1>
              <p className="mt-[22px] max-w-[720px] text-[1.15rem] leading-[1.65] text-neutral-700">
                {text.heroBody}
              </p>
            </div>
          </div>
        </section>

        <section className=" border-neutral-300 bg-white">
          <div className={cn(pageWidth, "grid grid-cols-3 gap-3 pt-4 max-[760px]:grid-cols-1")} aria-label="État de la base">
            <button
              className={cn(
                "flex min-h-[118px] cursor-pointer flex-col justify-between border-0 border-l-4 border-l-violet-700 bg-white p-5 text-left ring-1 ring-inset ring-neutral-300 hover:bg-violet-50",
                side === "hommes" && "bg-violet-50 ring-violet-200",
              )}
              type="button"
              aria-pressed={side === "hommes"}
              onClick={() => setSide("hommes")}
            >
              <span className="text-5xl font-extrabold leading-none text-violet-700">{counts.hommes}</span>
              <small className="font-bold leading-[1.35] text-neutral-700">{text.menAsymmetries}</small>
            </button>
            <button
              className={cn(
                "flex min-h-[118px] cursor-pointer flex-col justify-between border-0 border-l-4 border-l-cyan-600 bg-white p-5 text-left ring-1 ring-inset ring-neutral-300 hover:bg-cyan-50",
                side === "femmes" && "bg-cyan-50 ring-cyan-200",
              )}
              type="button"
              aria-pressed={side === "femmes"}
              onClick={() => setSide("femmes")}
            >
              <span className="text-5xl font-extrabold leading-none text-cyan-600">{counts.femmes}</span>
              <small className="font-bold leading-[1.35] text-neutral-700">{text.womenAsymmetries}</small>
            </button>
            <div className="flex min-h-[118px] flex-col justify-between gap-2.5 border-l-4 border-l-green-700 bg-white p-5 ring-1 ring-inset ring-neutral-300">
              <Send className="h-[22px] w-[22px] text-green-700" aria-hidden="true" />
              <span className="text-xs font-extrabold uppercase leading-tight tracking-normal text-green-700">{text.contribution}</span>
              <button
                className={cn(primaryAction, "mt-0.5 min-h-[42px] w-full whitespace-normal bg-green-700 px-3 leading-tight hover:bg-green-800")}
                type="button"
                onClick={() => setIsFormOpen(true)}
              >
                {text.proposeClaim}
              </button>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-20 border-b border-neutral-300 bg-white/95">
          <div className={cn(pageWidth, "py-4")}>
            <div className={cn(icon18, "flex min-h-11 items-center gap-2.5 border-b-2 border-blue-800 bg-neutral-200 px-3")}>
              <Search className="text-blue-800" aria-hidden="true" />
              <input
                className="w-full min-w-0 border-0 bg-transparent text-neutral-900 outline-0 placeholder:text-neutral-500"
                type="search"
                placeholder={text.searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={text.searchLabel}
              />
            </div>
          </div>
        </section>

        <section className={cn(pageWidth, "mt-6 grid grid-cols-[310px_minmax(0,1fr)] items-start gap-[18px] pb-14 max-[980px]:grid-cols-1")}>
          <aside className={cn(panel, "sticky top-[84px] max-h-[calc(100vh_-_110px)] overflow-auto p-5 max-[980px]:static max-[980px]:max-h-none")} aria-label="Synthèse">
            <div className={cn(icon18, "flex items-center gap-3 [&_svg]:h-[30px] [&_svg]:w-[30px]")}>
              <CalendarSync className="text-blue-800" aria-hidden="true" />
              <div>
                <h2 className="m-0 text-base leading-snug text-neutral-900">{text.weeklyWatch}</h2>
                <p className="mt-1 text-sm leading-snug text-neutral-500">{nextWeeklyRun}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 border-t border-neutral-300 pt-[18px]" aria-label="Filtres">
              <div className="grid gap-2.5 border-b border-neutral-300 pb-3.5" aria-label="Filtres sélectionnés">
                <div className={cn(icon18, "flex items-center gap-2 text-neutral-900")}>
                  <Tags className="text-blue-800" aria-hidden="true" />
                  <h3 className="m-0 text-[0.96rem] leading-tight">{text.activeFilters}</h3>
                </div>
                {selectedFilters.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-[7px]">
                      {selectedFilters.map((filter) => (
                        <button
                          className={cn(icon18, "inline-flex min-h-8 max-w-full items-center gap-2 border border-neutral-300 bg-white px-2 py-1.5 text-left text-[0.82rem] font-bold text-blue-800 [&_svg]:h-[15px] [&_svg]:w-[15px]")}
                          key={filter.key}
                          type="button"
                          onClick={filter.clear}
                        >
                          <span className="min-w-0 [overflow-wrap:anywhere]">{filter.label}</span>
                          <X aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                    <button
                      className="min-h-8 w-full border border-neutral-300 bg-blue-50 text-[0.82rem] font-bold text-blue-800"
                      type="button"
                      onClick={() => {
                        setSide("tous");
                        setSelectedTags([]);
                        setSelectedZones([]);
                        setSelectedStatuses([]);
                        setSelectedPeriods([]);
                        setDomain("tous");
                        setAngle("tous");
                      }}
                    >
                      {text.clearAll}
                    </button>
                  </>
                ) : (
                  <p className="text-[0.84rem] font-bold text-neutral-500">{text.noFilters}</p>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-2.5" aria-label="Filtres par angle">
              <div className={cn(icon18, "flex items-center gap-2 text-neutral-900")}>
                <Tags className="text-blue-800" aria-hidden="true" />
                <h3 className="m-0 text-[0.96rem] leading-tight">{text.angles}</h3>
              </div>
              {angleStats.map((stat) => (
                <button
                  className={cn(
                    "grid min-h-[34px] w-full grid-cols-[minmax(0,1fr)_26px] items-center gap-2 border border-transparent bg-transparent py-1 text-left hover:border-blue-100 hover:bg-blue-50",
                    angle === stat.label && "border-blue-100 bg-blue-50",
                  )}
                  key={stat.label}
                  type="button"
                  aria-pressed={angle === stat.label}
                  onClick={() => setAngle((currentAngle) => (currentAngle === stat.label ? "tous" : stat.label))}
                >
                  <span className="min-w-0 text-[0.82rem] font-bold text-neutral-700 [overflow-wrap:anywhere]">
                    {displayAngleLabels[stat.label]}
                  </span>
                  <span className="text-right text-[0.82rem] font-bold text-neutral-700">{stat.total}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-2.5" aria-label="Filtres par domaine">
              <div className={cn(icon18, "flex items-center gap-2 text-neutral-900")}>
                <Tags className="text-blue-800" aria-hidden="true" />
                <h3 className="m-0 text-[0.96rem] leading-tight">{text.domains}</h3>
              </div>
              {domainStats.map((stat) => (
                <button
                  className={cn(
                    "grid min-h-[34px] w-full grid-cols-[minmax(0,1fr)_78px_26px] items-center gap-2 border border-transparent bg-transparent py-1 text-left hover:border-blue-100 hover:bg-blue-50 max-[480px]:grid-cols-[minmax(0,1fr)_64px_22px]",
                    domain === stat.label && "border-blue-100 bg-blue-50",
                  )}
                  key={stat.label}
                  type="button"
                  aria-pressed={domain === stat.label}
                  onClick={() => setDomain((currentDomain) => (currentDomain === stat.label ? "tous" : stat.label))}
                >
                  <span className="min-w-0 text-[0.82rem] font-bold text-neutral-700 [overflow-wrap:anywhere]">{stat.label}</span>
                  <div className="h-2.5 overflow-hidden bg-neutral-200 ring-1 ring-inset ring-neutral-300">
                    <span
                      className="block h-full min-w-0 bg-blue-800"
                      style={{ width: `${(stat.total / maxDomainCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-right text-[0.82rem] font-bold text-neutral-700">{stat.total}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0" aria-label={text.claims} id="fiches">
            <div className="grid grid-cols-2 items-start gap-4 max-[760px]:grid-cols-1">
              {claimColumns.map((columnClaims, columnIndex) => (
                <div className="grid gap-4" key={`claim-column-${columnIndex}`}>
                  {columnClaims.map((claim) => (
                    <ClaimCard
                      claim={claim}
                      key={claim.id}
                      locale={locale}
                      onAngleClick={(value) => setAngle((currentAngle) => (currentAngle === value ? "tous" : value))}
                      onDomainClick={(value) => setDomain((currentDomain) => (currentDomain === value ? "tous" : value))}
                      onPeriodClick={(value) => setSelectedPeriods((currentPeriods) => toggleValue(currentPeriods, value))}
                      onSideClick={(value) => setSide((currentSide) => (currentSide === value ? "tous" : value))}
                      onContestClick={openContestForm}
                      onStatusClick={(value) =>
                        setSelectedStatuses((currentStatuses) => toggleValue(currentStatuses, value))
                      }
                      onTagClick={addTag}
                      onZoneClick={(value) => setSelectedZones((currentZones) => toggleValue(currentZones, value))}
                      selectedAngle={angle}
                      selectedDomain={domain}
                      selectedPeriods={selectedPeriods}
                      selectedSide={side}
                      selectedStatuses={selectedStatuses}
                      selectedTags={selectedTags}
                      selectedZones={selectedZones}
                      text={text}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        </section>
          </>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/45 p-4" role="presentation">
            <section
              className={cn(panel, "max-h-[calc(100vh_-_32px)] w-[min(520px,100%)] overflow-auto p-5")}
              role="dialog"
              aria-modal="true"
              aria-labelledby="suggestion-title"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="suggestion-title" className="m-0 text-base leading-snug text-neutral-900">
                    Proposer une asymétrie sourcée
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-neutral-500">On vérifiera la source et complétera les informations avant publication.</p>
                </div>
                <button
                  className={cn(icon18, "inline-flex h-10 w-10 items-center justify-center border-0 bg-neutral-200 text-blue-800")}
                  type="button"
	                  onClick={() => {
	                    setIsFormOpen(false);
	                    setSubmitted(false);
	                    setSubmissionError(false);
	                  }}
                  aria-label="Fermer"
                >
                  <X aria-hidden="true" />
                </button>
              </div>

              <form className="mt-[18px] grid gap-3" onSubmit={handleSuggestionSubmit}>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  Groupe concerné
                  <select className={field} name="side" required defaultValue="hommes">
                    <option value="hommes">Hommes</option>
                    <option value="femmes">Femmes</option>
                  </select>
                </label>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  Angle de l'asymétrie
                  <select className={field} name="angle" required defaultValue="désavantage_subi">
                    {(Object.keys(angleLabels).filter((label) => label !== "tous") as ClaimAngle[]).map((label) => (
                      <option key={label} value={label}>
                        {angleLabels[label]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  Titre
                  <input className={field} name="title" type="text" required minLength={8} />
                </label>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  Résumé
                  <textarea
                    className={cn(field, "min-h-36 resize-y py-2.5 leading-relaxed")}
                    name="summary"
                    required
                    minLength={16}
                    placeholder="Décris l'asymétrie, le contexte, et ce qui mérite d'être vérifié."
                  />
                </label>
                <button className={cn(primaryAction, "w-full")} type="submit">
                  <Send className="h-[18px] w-[18px]" aria-hidden="true" />
                  Envoyer la contribution
                </button>
                {submitted && (
                  <p className="font-bold text-green-700">
                    Contribution envoyée. Merci, elle sera vérifiée avant publication.
                  </p>
                )}
                {submissionError && (
                  <p className="font-bold text-red-700">
                    Envoi impossible pour le moment. La contribution reste conservée dans ce navigateur.
                  </p>
                )}
              </form>
            </section>
          </div>
        )}

        {contestedClaim && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/45 p-4" role="presentation">
            <section
              className={cn(panel, "max-h-[calc(100vh_-_32px)] w-[min(560px,100%)] overflow-auto p-5")}
              role="dialog"
              aria-modal="true"
              aria-labelledby="contest-title"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="contest-title" className="m-0 text-base leading-snug text-neutral-900">
                    Contester une asymétrie
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-neutral-500">{contestedClaim.title}</p>
                </div>
                <button
                  className={cn(icon18, "inline-flex h-10 w-10 items-center justify-center border-0 bg-neutral-200 text-blue-800")}
                  type="button"
                  onClick={closeContestForm}
                  aria-label="Fermer"
                >
                  <X aria-hidden="true" />
                </button>
              </div>

              <form className="mt-[18px] grid gap-3" onSubmit={handleContestSubmit}>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  Qu'est-ce qui est à modifier ?
                  <textarea
                    className={cn(field, "min-h-36 resize-y py-2.5 leading-relaxed")}
                    name="correction"
                    required
                    minLength={12}
                    placeholder="Explique la correction, le point contesté, ou la nuance à ajouter."
                  />
                </label>

                <div className="grid gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-neutral-700">Sources</span>
                    <button
                      className={cn(icon18, "inline-flex min-h-9 items-center gap-1.5 border-0 bg-neutral-200 px-2.5 text-sm font-bold text-blue-800 hover:bg-blue-100")}
                      type="button"
                      onClick={() => setContestSources((currentSources) => [...currentSources, ""])}
                    >
                      <Plus aria-hidden="true" />
                      Ajouter
                    </button>
                  </div>
                  {contestSources.map((source, index) => (
                    <label className="grid gap-[7px] text-sm font-bold text-neutral-700" key={`contest-source-${index}`}>
                      Source {index + 1}
                      <input
                        className={field}
                        type="url"
                        value={source}
                        onChange={(event) => updateContestSource(index, event.target.value)}
                        required={index === 0}
                        placeholder="https://..."
                      />
                    </label>
                  ))}
                </div>

                <button className={cn(primaryAction, "w-full")} type="submit">
                  <Send className="h-[18px] w-[18px]" aria-hidden="true" />
                  Envoyer la contestation
                </button>
                {contestSubmitted && (
                  <p className="font-bold text-green-700">
                    Contestation envoyée. Merci, elle sera vérifiée avant modification.
                  </p>
                )}
                {contestError && (
                  <p className="font-bold text-red-700">
                    Envoi impossible pour le moment. La contestation reste conservée dans ce navigateur.
                  </p>
                )}
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function ClaimCard({
  claim,
  locale,
  onAngleClick,
  onContestClick,
  onDomainClick,
  onPeriodClick,
  onSideClick,
  onStatusClick,
  onTagClick,
  onZoneClick,
  selectedAngle,
  selectedDomain,
  selectedPeriods,
  selectedSide,
  selectedStatuses,
  selectedTags,
  selectedZones,
  text,
}: {
  claim: Claim;
  locale: Locale;
  onAngleClick: (label: ClaimAngle) => void;
  onContestClick: (claim: Claim) => void;
  onDomainClick: (label: Domain) => void;
  onPeriodClick: (label: string) => void;
  onSideClick: (label: Side) => void;
  onStatusClick: (label: StatutTemporel) => void;
  onTagClick: (label: string) => void;
  onZoneClick: (label: string) => void;
  selectedAngle: ClaimAngle | "tous";
  selectedDomain: Domain | "tous";
  selectedPeriods: string[];
  selectedSide: Side | "tous";
  selectedStatuses: StatutTemporel[];
  selectedTags: string[];
  selectedZones: string[];
  text: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const claimTranslation = locale === "en" ? claim.translations?.en : undefined;
  const claimTitle = claimTranslation?.title ?? claim.title;
  const claimSummary = claimTranslation?.summary ?? claim.summary;
  const claimNuance = claimTranslation?.nuance ?? claim.nuance;
  const claimSourcePopulation = claimTranslation?.sourcePopulation ?? claim.sourcePopulation;
  const claimTags = claimTranslation?.tags ?? claim.tags;
  const displaySideLabels = sideLabelsByLocale[locale];
  const displayAngleLabels = angleLabelsByLocale[locale];
  const displayPeriodLabels = periodFilterLabelsByLocale[locale];
  const Icon = domainIcons[claim.domain];
  const isWomen = claim.side === "femmes";
  const sideColor = isWomen ? "text-cyan-600" : "text-violet-700";
  const sideBg = isWomen ? "bg-cyan-50" : "bg-violet-100";
  const sideBorder = isWomen ? "border-t-cyan-600" : "border-t-violet-700";
  const periodLabel = getPeriodLabel(claim);
  const chipButton =
    "min-h-[30px] border-0 px-2 py-1.5 text-xs font-bold text-neutral-700 ring-1 ring-inset ring-neutral-300 hover:bg-blue-100 hover:text-blue-800";
  const selectedChip = "!bg-blue-100 !text-blue-900 !ring-blue-300";
  const activeTagFilters = [
    ...selectedTags,
    ...selectedZones,
    ...selectedStatuses,
    ...selectedStatuses.map((status) => periodFilterLabels[status]),
    ...selectedStatuses.map((status) => displayPeriodLabels[status]),
    ...selectedPeriods,
    selectedDomain !== "tous" ? selectedDomain : null,
  ]
    .filter(Boolean)
    .map((label) => normalize(String(label)));

  async function copyShareLink() {
    const url = new URL(`${window.location.origin}${window.location.pathname}`);
    url.hash = claim.id;
    const shareUrl = url.toString();

    function copyWithFallback() {
      const input = document.createElement("textarea");
      input.value = shareUrl;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.top = "-9999px";
      document.body.append(input);
      input.focus();
      input.select();
      const copiedFromInput = document.execCommand("copy");
      input.remove();

      return copiedFromInput;
    }

    try {
      if (!copyWithFallback() && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article
      className={cn(
        panel,
        "w-full scroll-mt-24 border-t-4 p-6 max-[760px]:scroll-mt-20 max-[760px]:p-5",
        sideBorder,
      )}
      id={claim.id}
    >
      <div className="flex min-h-8 items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
        <div className="flex flex-wrap gap-2">
          <button
            className={cn(chipButton, sideBg, sideColor, selectedSide === claim.side && selectedChip)}
            type="button"
            aria-pressed={selectedSide === claim.side}
            onClick={() => onSideClick(claim.side)}
          >
            {displaySideLabels[claim.side]}
          </button>
          <button
            className={cn(chipButton, "bg-blue-50 text-blue-800", selectedAngle === claim.angle && selectedChip)}
            type="button"
            aria-pressed={selectedAngle === claim.angle}
            onClick={() => onAngleClick(claim.angle)}
          >
            {displayAngleLabels[claim.angle]}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={cn(
              icon18,
              chipButton,
              "flex items-center gap-1.5 bg-neutral-100",
              selectedDomain === claim.domain && selectedChip,
            )}
            type="button"
            aria-pressed={selectedDomain === claim.domain}
            onClick={() => onDomainClick(claim.domain)}
          >
            <Icon aria-hidden="true" />
            {claim.domain}
          </button>
          <button
            className={cn(
              icon18,
              "inline-flex h-[30px] w-[30px] items-center justify-center border-0 bg-neutral-100 text-blue-800 ring-1 ring-inset ring-neutral-300 hover:bg-blue-50",
              copied && "bg-green-50 text-green-700 ring-green-200",
            )}
            type="button"
            onClick={() => void copyShareLink()}
            aria-label={copied ? text.copiedLink : `${text.copyLink}: ${claimTitle}`}
            title={copied ? text.copiedLink : text.copyLink}
          >
            {copied ? <Check aria-hidden="true" /> : <Link aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <h3 className="m-0 text-[1.35rem] font-extrabold leading-[1.24] text-neutral-900">{claimTitle}</h3>
        <HighlightedSummary text={claimSummary} />
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-4">
        <div className="flex flex-wrap gap-[7px]">
          <button
            className={cn(
              chipButton,
              "bg-neutral-100",
              selectedZones.includes(claim.pays_ou_zone) && selectedChip,
            )}
            type="button"
            aria-pressed={selectedZones.includes(claim.pays_ou_zone)}
            onClick={() => onZoneClick(claim.pays_ou_zone)}
          >
            {zoneLabels[claim.pays_ou_zone] ?? claim.pays_ou_zone}
          </button>
          <button
            className={cn(
              chipButton,
              "bg-neutral-100",
              selectedStatuses.includes(claim.statut_temporel) && selectedChip,
            )}
            type="button"
            aria-pressed={selectedStatuses.includes(claim.statut_temporel)}
            onClick={() => onStatusClick(claim.statut_temporel)}
          >
            {displayPeriodLabels[claim.statut_temporel]}
          </button>
          <button
            className={cn(
              chipButton,
              "bg-neutral-100",
              selectedPeriods.includes(periodLabel) && selectedChip,
            )}
            type="button"
            aria-pressed={selectedPeriods.includes(periodLabel)}
            onClick={() => onPeriodClick(periodLabel)}
          >
            {periodLabel}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-[7px]">
        {claimTags.map((label, index) => {
          const isActive = activeTagFilters.includes(normalize(label));
          const sourceTag = claim.tags[index] ?? label;

          return (
            <button
              className={cn(
                "min-h-[27px] border-0 px-2 py-1.5 text-[0.78rem] font-bold ring-1 ring-inset hover:bg-blue-100 hover:text-blue-800",
                isActive
                  ? "bg-blue-100 text-blue-900 ring-blue-300"
                  : "bg-neutral-200 text-neutral-700 ring-neutral-300",
              )}
              key={`${sourceTag}-${label}`}
              type="button"
              aria-pressed={selectedTags.includes(sourceTag)}
              onClick={() => onTagClick(sourceTag)}
            >
              {formatTagLabel(label)}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <div className={cn(icon18, "flex items-start gap-2 border-t border-neutral-200 pt-4 text-[0.86rem] leading-[1.48] text-neutral-700")}>
          <AlertTriangle className="mt-0.5 text-red-700" aria-hidden="true" />
          <span>{claimNuance}</span>
        </div>
      </div>

      {claimSourcePopulation && (
        <details className="mt-3 bg-neutral-100 text-[0.86rem] leading-[1.48] text-neutral-700 ring-1 ring-inset ring-neutral-300">
          <summary className={cn("cursor-pointer px-3 py-2.5 font-bold", sideColor)}>
            {text.measuredPopulation}
          </summary>
          <div className="border-t border-neutral-300 px-3 py-3">{claimSourcePopulation}</div>
        </details>
      )}

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2 max-[460px]:grid-cols-1">
        <div className={cn(icon18, "flex min-h-[38px] items-center gap-2 bg-neutral-200 px-[9px] py-[7px] text-[0.82rem] font-bold text-neutral-700")}>
        <CalendarSync className="text-blue-800" aria-hidden="true" />
        {text.verifiedOn} {claim.lastChecked}
        </div>
        <button
          className={cn(icon18, "flex min-h-[38px] items-center justify-center gap-2 border border-neutral-300 bg-white px-2.5 py-[7px] text-[0.86rem] font-bold text-blue-800 hover:bg-blue-50")}
          type="button"
        onClick={() => onContestClick(claim)}
      >
        <AlertTriangle aria-hidden="true" />
        {text.contest}
      </button>
      </div>

      <a
        className={cn(icon18, "mt-3 flex min-h-[42px] items-center gap-2 bg-white px-2.5 py-[9px] text-[0.86rem] font-bold text-blue-800 ring-1 ring-inset ring-neutral-300 hover:bg-blue-50")}
        href={claim.source.url}
        target="_blank"
        rel="noreferrer"
      >
        <FileText aria-hidden="true" />
        <span className="min-w-0 flex-1">
          {claim.source.publisher} - {claim.source.date}
        </span>
        <ExternalLink aria-hidden="true" />
      </a>
      {claim.additionalSources?.map((source) => (
        <a
          className={cn(icon18, "mt-2 flex min-h-[42px] items-center gap-2 bg-neutral-100 px-2.5 py-[9px] text-[0.86rem] font-bold text-blue-800 ring-1 ring-inset ring-neutral-300 hover:bg-blue-50")}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          key={source.url}
        >
          <FileText aria-hidden="true" />
          <span className="min-w-0 flex-1">
            {source.publisher} - {source.date}
          </span>
          <ExternalLink aria-hidden="true" />
        </a>
      ))}
    </article>
  );
}

export default App;
