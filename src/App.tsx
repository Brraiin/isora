import {
  AlertTriangle,
  Briefcase,
  CalendarSync,
  Check,
  ChevronDown,
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
import packageJson from "../package.json";
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

type ContributionPayload = {
  type?: string;
  side?: string;
  angle?: string;
  title?: string;
  summary?: string;
  claimId?: string;
  claimTitle?: string;
  claimUrl?: string;
  correction?: string;
  sources?: string[];
  pageUrl?: string;
  createdAt?: string;
};

type ContributionPreview = {
  id: string;
  source: "local" | "github";
  title: string;
  url?: string;
  createdAt?: string;
  labels?: string[];
  payload: ContributionPayload;
};

type RemoteContribution = {
  number?: number;
  title?: string;
  url?: string;
  createdAt?: string;
  labels?: string[];
  payload?: ContributionPayload | null;
};

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
    mobileTagline: "Référentiel des asymétries de sexe",
    verifiedSources: "sources vérifiées",
    heroKicker: "Données sourcées, contexte lisible, contribution ouverte",
    heroTitle: "Liste les asymétries documentées selon le sexe",
    heroBody:
      "Isora recense des asymétries documentées par pays, période, domaine et angle d'analyse. Chaque fiche précise sa source, son contexte et la population réellement mesurée, pour rendre la donnée lisible, vérifiable et corrigeable.",
    mobileHeroBody:
      "Isora recense des asymétries documentées par pays, période, domaine et angle, avec source et contexte vérifiables.",
    menAsymmetries: "Asymétries concernant les hommes",
    womenAsymmetries: "Asymétries concernant les femmes",
    contribution: "Contribution",
    proposeClaim: "Proposer une asymétrie sourcée",
    searchPlaceholder: "Rechercher une fiche, un pays, une source...",
    searchLabel: "Recherche",
    blog: "Blog",
    weeklyWatch: "Veille quotidienne",
    activeFilters: "Filtres actifs",
    noFilters: "Aucun filtre sélectionné",
    noResults: "Il n'y a pas de résultat avec ces filtres.",
    clearAll: "Tout effacer",
    clearAllFilters: "Supprimer tous les filtres",
    angles: "Angles",
    domains: "Domaines",
    claims: "Fiches",
    measuredPopulation: "Population mesurée",
    verifiedOn: "Vérifié le",
    contest: "Contester",
    showDetails: "Voir",
    hideDetails: "Réduire",
    copyLink: "Copier le lien de l'asymétrie",
    copiedLink: "Lien copié",
    language: "Langue",
    close: "Fermer",
    suggestionIntro: "On vérifiera la source et complétera les informations avant publication.",
    affectedGroup: "Groupe concerné",
    asymmetryAngle: "Angle de l'asymétrie",
    title: "Titre",
    summary: "Résumé",
    summaryPlaceholder: "Décris l'asymétrie, le contexte, et ce qui mérite d'être vérifié.",
    sendContribution: "Envoyer la contribution",
    contributionSent: "Contribution envoyée. Merci, elle sera vérifiée avant publication.",
    contributionError: "Envoi impossible pour le moment. La contribution reste conservée dans ce navigateur.",
    contestClaim: "Contester une asymétrie",
    correctionLabel: "Qu'est-ce qui est à modifier ?",
    correctionPlaceholder: "Explique la correction, le point contesté, ou la nuance à ajouter.",
    sources: "Sources",
    add: "Ajouter",
    source: "Source",
    sendContest: "Envoyer la contestation",
    contestSent: "Contestation envoyée. Merci, elle sera vérifiée avant modification.",
    contestError: "Envoi impossible pour le moment. La contestation reste conservée dans ce navigateur.",
  },
  en: {
    tagline: "The reference for sex-based asymmetries",
    mobileTagline: "Sex-based asymmetry reference",
    verifiedSources: "verified sources",
    heroKicker: "Sourced data, readable context, open contribution",
    heroTitle: "Browse documented sex-based asymmetries",
    heroBody:
      "Isora tracks documented asymmetries by country, period, domain and editorial angle. Each entry states its source, context and actually measured population so the data stays readable, verifiable and correctable.",
    mobileHeroBody:
      "Isora tracks documented asymmetries by country, period, domain and angle, with verifiable source and context.",
    menAsymmetries: "Asymmetries concerning men",
    womenAsymmetries: "Asymmetries concerning women",
    contribution: "Contribution",
    proposeClaim: "Suggest a sourced asymmetry",
    searchPlaceholder: "Search an entry, country, source...",
    searchLabel: "Search",
    blog: "Blog",
    weeklyWatch: "Daily watch",
    activeFilters: "Active filters",
    noFilters: "No selected filter",
    noResults: "There are no results with these filters.",
    clearAll: "Clear all",
    clearAllFilters: "Remove all filters",
    angles: "Angles",
    domains: "Domains",
    claims: "Entries",
    measuredPopulation: "Measured population",
    verifiedOn: "Verified on",
    contest: "Contest",
    showDetails: "View",
    hideDetails: "Collapse",
    copyLink: "Copy the asymmetry link",
    copiedLink: "Link copied",
    language: "Language",
    close: "Close",
    suggestionIntro: "We will verify the source and complete the details before publication.",
    affectedGroup: "Affected group",
    asymmetryAngle: "Asymmetry angle",
    title: "Title",
    summary: "Summary",
    summaryPlaceholder: "Describe the asymmetry, the context, and what should be verified.",
    sendContribution: "Send contribution",
    contributionSent: "Contribution sent. Thank you, it will be verified before publication.",
    contributionError: "Sending is unavailable for now. The contribution remains saved in this browser.",
    contestClaim: "Contest an asymmetry",
    correctionLabel: "What should be changed?",
    correctionPlaceholder: "Explain the correction, contested point, or nuance to add.",
    sources: "Sources",
    add: "Add",
    source: "Source",
    sendContest: "Send contestation",
    contestSent: "Contestation sent. Thank you, it will be verified before any change.",
    contestError: "Sending is unavailable for now. The contestation remains saved in this browser.",
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
const localReturnsClearPassword = "Jka$n@3^iTR7E8";
const localReturnsClearAttemptsKey = "isora:clear-local-returns-attempts";
const legacyContributionPrefix = ["sexe", "data"].join("");
const contributionStorageKeys = {
  suggestions: "isora:suggestions",
  contestations: "isora:contestations",
  legacySuggestions: `${legacyContributionPrefix}:suggestions`,
  legacyContestations: `${legacyContributionPrefix}:contestations`,
};

function getParisDateKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function readLocalReturnsClearAttempts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(localReturnsClearAttemptsKey) ?? "null");

    if (parsed?.date === getParisDateKey() && Number.isInteger(parsed.attempts)) {
      return parsed as { date: string; attempts: number };
    }
  } catch {
    // Reset malformed attempt state.
  }

  return { date: getParisDateKey(), attempts: 0 };
}

function writeLocalReturnsClearAttempts(attempts: number) {
  localStorage.setItem(
    localReturnsClearAttemptsKey,
    JSON.stringify({ date: getParisDateKey(), attempts }),
  );
}

function requestLocalReturnsClearPassword() {
  const currentAttempts = readLocalReturnsClearAttempts();

  if (currentAttempts.attempts >= 3) {
    window.alert("Suppression bloquée pour aujourd'hui après 3 tentatives incorrectes.");
    return false;
  }

  const password = window.prompt("Mot de passe pour supprimer les retours locaux :");

  if (password === null) return false;

  if (password === localReturnsClearPassword) {
    localStorage.removeItem(localReturnsClearAttemptsKey);
    return true;
  }

  const nextAttempts = currentAttempts.attempts + 1;
  writeLocalReturnsClearAttempts(nextAttempts);
  const remainingAttempts = Math.max(3 - nextAttempts, 0);
  window.alert(
    remainingAttempts > 0
      ? `Mot de passe incorrect. ${remainingAttempts} tentative${remainingAttempts > 1 ? "s" : ""} restante${remainingAttempts > 1 ? "s" : ""} aujourd'hui.`
      : "Mot de passe incorrect. Suppression bloquée pour aujourd'hui.",
  );

  return false;
}

async function sendContribution(title: string, payload: unknown) {
  try {
    const response = await fetch("/api/contributions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ title, payload }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (response.ok || response.status === 202 || response.status === 404 || response.status === 503) {
      return data;
    }
  } catch {
    return { ok: true, delivery: "browser_local" };
  }

  return { ok: true, delivery: "browser_local" };
}

function isContributionAdminView() {
  if (typeof window === "undefined") return false;
  const adminView = new URLSearchParams(window.location.search).get("admin");
  return adminView === "contributions" || adminView === "contributions=";
}

function readStoredContributions(key: string, legacyKey?: string) {
  try {
    const current = JSON.parse(localStorage.getItem(key) ?? "[]");
    const legacy = legacyKey ? JSON.parse(localStorage.getItem(legacyKey) ?? "[]") : [];
    const value = [...(Array.isArray(legacy) ? legacy : []), ...(Array.isArray(current) ? current : [])];
    return Array.isArray(value) ? (value as ContributionPayload[]) : [];
  } catch {
    return [];
  }
}

function appendStoredContribution(key: string, payload: ContributionPayload, legacyKey?: string) {
  const stored = readStoredContributions(key, legacyKey);
  localStorage.setItem(key, JSON.stringify([...stored, payload]));
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function formatContributionDate(value?: string) {
  if (!value) return "Date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getContributionTitle(payload: ContributionPayload, fallback: string) {
  return payload.claimTitle ?? payload.title ?? fallback;
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

function getNextDailyRun(date: Date) {
  const next = new Date(date);
  next.setHours(7, 30, 0, 0);

  if (next <= date) {
    next.setDate(next.getDate() + 1);
  }

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

function matchesSelectedTags(claim: Claim, selectedTags: string[]) {
  if (selectedTags.length === 0) return true;
  return selectedTags.every((tag) => claim.tags.includes(tag));
}

function getHybridParticipantTags(claim: Claim) {
  const participantTags = ["femmes", "hommes"].filter((tag) => claim.tags.includes(tag));

  if (participantTags.length > 1) return participantTags;

  if (claim.id === "femmes-filles-hors-ecole" || claim.id === "femmes-menopause-soins") {
    return ["femmes", "hommes"];
  }

  return [];
}

function getCombinedSideFilterRank(claim: Claim) {
  if (getHybridParticipantTags(claim).length > 1) return 0;
  if (claim.side === "femmes" && claim.tags.includes("hommes")) return 1;
  if (claim.side === "hommes" && claim.tags.includes("femmes")) return 1;
  return 2;
}

function matchesCombinedSideTags(claim: Claim) {
  return getCombinedSideFilterRank(claim) < 2;
}

function orderClaimsForCombinedSideTags(list: Claim[]) {
  return list
    .map((claim, index) => ({ claim, index, rank: getCombinedSideFilterRank(claim) }))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map((item) => item.claim);
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

function ContributionInbox({
  localRequests,
  onClearLocalRequests,
  remoteRequests,
  remoteStatus,
}: {
  localRequests: ContributionPreview[];
  onClearLocalRequests: () => void;
  remoteRequests: ContributionPreview[];
  remoteStatus: "idle" | "loading" | "ready" | "unavailable" | "error";
}) {
  const requests = [...remoteRequests, ...localRequests].sort((left, right) => {
    const leftDate = new Date(left.createdAt ?? "").getTime() || 0;
    const rightDate = new Date(right.createdAt ?? "").getTime() || 0;
    return rightDate - leftDate;
  });

  return (
    <div className="min-w-80 bg-neutral-100 font-sans text-neutral-900 antialiased">
      <main className={cn(pageWidth, "min-h-screen py-8")}>
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-300 pb-5">
          <div>
            <IsoraWordmark className="w-24" />
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-neutral-900">Retours utilisateurs</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-neutral-600">
              Vue non référencée pour vérifier les contestations et propositions avant modification des asymétries.
            </p>
            <p className="mt-2 text-sm font-bold text-neutral-500">Version app {packageJson.version}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {localRequests.length > 0 && (
              <button
                className={cn(icon18, "inline-flex min-h-10 items-center gap-2 bg-neutral-200 px-3 text-sm font-bold text-blue-800 hover:bg-blue-100")}
                type="button"
                onClick={onClearLocalRequests}
              >
                <X aria-hidden="true" />
                Supprimer les retours locaux
              </button>
            )}
            <div className="bg-white px-3 py-2 text-sm font-bold text-neutral-700 ring-1 ring-inset ring-neutral-300">
              {requests.length} retour{requests.length > 1 ? "s" : ""}
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-3" aria-label="Statut des retours">
          {remoteStatus === "loading" && (
            <div className={cn(panel, "p-4 font-bold text-blue-800")}>Chargement des issues GitHub...</div>
          )}
          {remoteStatus === "unavailable" && (
            <div className={cn(panel, "flex gap-3 p-4 text-sm font-bold text-amber-800")}>
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
              GitHub n'est pas configuré sur cet environnement. Les retours locaux restent visibles ici.
            </div>
          )}
          {remoteStatus === "error" && (
            <div className={cn(panel, "flex gap-3 p-4 text-sm font-bold text-red-700")}>
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
              Impossible de charger les issues GitHub pour le moment.
            </div>
          )}
        </section>

        <section className="mt-5 grid grid-cols-2 gap-4 max-[900px]:grid-cols-1" aria-label="Retours reçus">
          {requests.map((request) => (
            <ContributionPreviewCard key={request.id} request={request} />
          ))}
          {requests.length === 0 && (
            <div className={cn(panel, "col-span-full p-6 text-center font-bold text-neutral-500")}>
              Aucun retour à afficher pour le moment.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ContributionPreviewCard({ request }: { request: ContributionPreview }) {
  const payload = request.payload;
  const isContest = payload.type === "contestation_asymetrie";
  const label = isContest ? "Contestation" : "Proposition";
  const sources = Array.isArray(payload.sources) ? payload.sources.filter(Boolean) : [];

  return (
    <article className={cn(panel, "border-t-4 border-t-blue-800 p-5")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-blue-50 px-2 py-1 text-xs font-extrabold uppercase text-blue-800 ring-1 ring-inset ring-blue-200">
          {label}
        </span>
        <span className="bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600 ring-1 ring-inset ring-neutral-300">
          {request.source === "github" ? "GitHub" : "Local"}
        </span>
        {payload.side && (
          <span className="bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600 ring-1 ring-inset ring-neutral-300">
            {payload.side}
          </span>
        )}
      </div>

      <h2 className="mt-4 text-xl font-extrabold leading-snug text-neutral-900">
        {getContributionTitle(payload, request.title)}
      </h2>
      <p className="mt-2 text-sm font-bold text-neutral-500">{formatContributionDate(request.createdAt)}</p>

      {payload.correction && (
        <section className="mt-4">
          <h3 className="text-sm font-extrabold text-neutral-900">À modifier</h3>
          <p className="mt-1 leading-relaxed text-neutral-700">{payload.correction}</p>
        </section>
      )}

      {payload.summary && (
        <section className="mt-4">
          <h3 className="text-sm font-extrabold text-neutral-900">Résumé proposé</h3>
          <p className="mt-1 leading-relaxed text-neutral-700">{payload.summary}</p>
        </section>
      )}

      {payload.angle && (
        <p className="mt-4 text-sm text-neutral-600">
          <strong className="text-neutral-900">Angle :</strong> {payload.angle}
        </p>
      )}

      {sources.length > 0 && (
        <section className="mt-4">
          <h3 className="text-sm font-extrabold text-neutral-900">Sources</h3>
          <div className="mt-2 grid gap-2">
            {sources.map((source) => (
              <a
                className={cn(icon18, "inline-flex min-w-0 items-center gap-2 font-bold text-blue-800 underline underline-offset-2 [overflow-wrap:anywhere]")}
                href={source}
                key={source}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink aria-hidden="true" />
                {source}
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {payload.claimUrl && (
          <a
            className={cn(icon18, "inline-flex min-h-10 items-center gap-2 bg-neutral-200 px-3 font-bold text-blue-800 hover:bg-blue-100")}
            href={payload.claimUrl}
          >
            <Link aria-hidden="true" />
            Voir l'asymétrie
          </a>
        )}
        {request.url && (
          <a
            className={cn(icon18, "inline-flex min-h-10 items-center gap-2 bg-blue-800 px-3 font-bold text-white hover:bg-blue-700")}
            href={request.url}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" />
            Ouvrir l'issue
          </a>
        )}
      </div>

      <details className="mt-5 border-t border-neutral-300 pt-4">
        <summary className="font-bold text-neutral-700">JSON brut</summary>
        <pre className="mt-3 max-h-72 overflow-auto bg-neutral-950 p-3 text-xs leading-relaxed text-neutral-100">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </details>
    </article>
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
  const [suggestionSources, setSuggestionSources] = useState([""]);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [sharedClaimId, setSharedClaimId] = useState(() => getClaimIdFromHash());
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [contestedClaim, setContestedClaim] = useState<Claim | null>(null);
  const [contestSources, setContestSources] = useState([""]);
  const [contestSubmitted, setContestSubmitted] = useState(false);
  const [contestError, setContestError] = useState(false);
  const [isRequestsView] = useState(() => isContributionAdminView());
  const [localRequests, setLocalRequests] = useState<ContributionPreview[]>([]);
  const [remoteRequests, setRemoteRequests] = useState<ContributionPreview[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<"idle" | "loading" | "ready" | "unavailable" | "error">("idle");
  const [filterPanelsOpen, setFilterPanelsOpen] = useState({
    angles: true,
    domains: true,
  });
  const text = uiText[locale];
  const displaySideLabels = sideLabelsByLocale[locale];
  const displayAngleLabels = angleLabelsByLocale[locale];
  const displayPeriodLabels = periodFilterLabelsByLocale[locale];
  const nextDailyRun = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(getNextDailyRun(new Date())),
    [locale],
  );
  const hasMenTagFilter = selectedTags.includes("hommes");
  const hasWomenTagFilter = selectedTags.includes("femmes");
  const selectedTopicTags = useMemo(
    () => selectedTags.filter((tag) => tag !== "hommes" && tag !== "femmes"),
    [selectedTags],
  );

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "fr";
    window.localStorage.setItem("isora:locale", locale);
  }, [locale]);

  useEffect(() => {
    if (!isRequestsView) return undefined;

    const previousTitle = document.title;
    document.title = "Retours utilisateurs - Isora";

    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robotsMeta?.getAttribute("content") ?? null;
    const createdRobots = !robotsMeta;

    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.name = "robots";
      document.head.appendChild(robotsMeta);
    }

    robotsMeta.content = "noindex,nofollow";

    return () => {
      document.title = previousTitle;
      if (!robotsMeta) return;
      if (createdRobots) {
        robotsMeta.remove();
      } else if (previousRobots) {
        robotsMeta.content = previousRobots;
      }
    };
  }, [isRequestsView]);

  useEffect(() => {
    if (!isRequestsView) return;

    const suggestions = readStoredContributions(
      contributionStorageKeys.suggestions,
      contributionStorageKeys.legacySuggestions,
    ).map((payload, index) => ({
      id: `local-suggestion-${index}-${payload.createdAt ?? ""}`,
      source: "local" as const,
      title: getContributionTitle(payload, "Suggestion locale"),
      createdAt: payload.createdAt,
      payload,
    }));
    const contestations = readStoredContributions(
      contributionStorageKeys.contestations,
      contributionStorageKeys.legacyContestations,
    ).map((payload, index) => ({
      id: `local-contestation-${index}-${payload.createdAt ?? ""}`,
      source: "local" as const,
      title: getContributionTitle(payload, "Contestation locale"),
      createdAt: payload.createdAt,
      payload,
    }));

    setLocalRequests([...suggestions, ...contestations]);
  }, [isRequestsView]);

  useEffect(() => {
    if (!isRequestsView) return;

    let cancelled = false;
    setRemoteStatus("loading");

    fetch("/api/contributions")
      .then(async (response) => {
        if (response.status === 404 || response.status === 503) {
          if (!cancelled) setRemoteStatus("unavailable");
          return null;
        }

        if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
          if (!cancelled) setRemoteStatus("unavailable");
          return null;
        }

        if (!response.ok) {
          throw new Error("remote_contributions_failed");
        }

        return response.json() as Promise<{ items?: RemoteContribution[] }>;
      })
      .then((data) => {
        if (cancelled || !data) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setRemoteRequests(
          items.map((item) => {
            const payload = item.payload ?? {};
            const id = item.number ? `github-${item.number}` : `github-${item.createdAt ?? item.title ?? ""}`;

            return {
              id,
              source: "github",
              title: getContributionTitle(payload, item.title ?? "Retour GitHub"),
              url: item.url,
              createdAt: item.createdAt ?? payload.createdAt,
              labels: item.labels,
              payload,
            };
          }),
        );
        setRemoteStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setRemoteStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isRequestsView]);

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

  useEffect(() => {
    setFilterPanelsOpen({
      angles: !isSingleColumn,
      domains: !isSingleColumn,
    });
  }, [isSingleColumn]);

  const filteredClaims = useMemo(() => {
    const normalizedQuery = normalize(query);
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    const matchingClaims = claims.filter((claim) => {
      const matchesSide = side === "tous" || claim.side === side;
      const claimHasMenTag = claim.side === "hommes" || claim.tags.includes("hommes");
      const claimHasWomenTag = claim.side === "femmes" || claim.tags.includes("femmes");
      const matchesSideTags =
        hasMenTagFilter && hasWomenTagFilter
          ? matchesCombinedSideTags(claim)
          : (!hasMenTagFilter && !hasWomenTagFilter) ||
            (hasMenTagFilter && claimHasMenTag) ||
            (hasWomenTagFilter && claimHasWomenTag);
      const matchesTag = matchesSelectedTags(claim, selectedTopicTags);
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
        matchesSideTags &&
        matchesTag &&
        matchesZone &&
        matchesStatus &&
        matchesPeriod &&
        matchesDomain &&
        matchesAngle &&
        matchesQuery
      );
    });

    const orderedClaims = side === "tous" ? interleaveClaimsBySide(matchingClaims) : matchingClaims;

    return hasMenTagFilter && hasWomenTagFilter
      ? orderClaimsForCombinedSideTags(orderedClaims)
      : orderedClaims;
  }, [angle, domain, hasMenTagFilter, hasWomenTagFilter, query, selectedPeriods, selectedStatuses, selectedTopicTags, selectedZones, side]);

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

  const sharedClaim = sharedClaimId ? claims.find((claim) => claim.id === sharedClaimId) : null;
  const isMenOnlyFilter = side === "hommes";
  const isWomenOnlyFilter = side === "femmes";
  const showMenSummaryTile = !isWomenOnlyFilter;
  const showWomenSummaryTile = !isMenOnlyFilter;

  function addTag(label: string) {
    setSelectedTags((currentTags) => toggleValue(currentTags, label));
  }

  function clearFilters() {
    setSide("tous");
    setSelectedTags([]);
    setSelectedZones([]);
    setSelectedStatuses([]);
    setSelectedPeriods([]);
    setDomain("tous");
    setAngle("tous");
  }

  async function handleSuggestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmissionError(false);
    const formData = new FormData(form);
    const suggestion = {
      type: "suggestion_asymetrie",
      side: getFormString(formData, "side"),
      angle: getFormString(formData, "angle"),
      title: getFormString(formData, "title"),
      summary: getFormString(formData, "summary"),
      sources: suggestionSources.map((source) => source.trim()).filter(Boolean),
      pageUrl: window.location.href,
      createdAt: new Date().toISOString(),
    };

    appendStoredContribution(
      contributionStorageKeys.suggestions,
      suggestion,
      contributionStorageKeys.legacySuggestions,
    );

    try {
      await sendContribution(`Suggestion Isora - ${suggestion.title}`, suggestion);
      form.reset();
      setSuggestionSources([""]);
      setSubmitted(true);
      setSubmissionError(false);
    } catch {
      setSubmissionError(true);
    }
  }

  function updateSuggestionSource(index: number, value: string) {
    setSuggestionSources((currentSources) =>
      currentSources.map((source, sourceIndex) => (sourceIndex === index ? value : source)),
    );
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
    const form = event.currentTarget;
    setContestError(false);

    const formData = new FormData(form);
    const contestation = {
      type: "contestation_asymetrie",
      claimId: contestedClaim.id,
      claimTitle: contestedClaim.title,
      claimUrl: `${window.location.origin}${window.location.pathname}#${contestedClaim.id}`,
      correction: getFormString(formData, "correction"),
      sources: contestSources.map((source) => source.trim()).filter(Boolean),
      pageUrl: window.location.href,
      createdAt: new Date().toISOString(),
    };

    appendStoredContribution(
      contributionStorageKeys.contestations,
      contestation,
      contributionStorageKeys.legacyContestations,
    );

    try {
      await sendContribution(`Contestation Isora - ${contestedClaim.title}`, contestation);
      form.reset();
      setContestSources([""]);
      setContestSubmitted(true);
      setContestError(false);
    } catch {
      setContestError(true);
    }
  }

  if (isRequestsView) {
    return (
      <ContributionInbox
        localRequests={localRequests}
        onClearLocalRequests={() => {
          if (!requestLocalReturnsClearPassword()) return;

          localStorage.removeItem(contributionStorageKeys.suggestions);
          localStorage.removeItem(contributionStorageKeys.contestations);
          localStorage.removeItem(contributionStorageKeys.legacySuggestions);
          localStorage.removeItem(contributionStorageKeys.legacyContestations);
          setLocalRequests([]);
        }}
        remoteRequests={remoteRequests}
        remoteStatus={remoteStatus}
      />
    );
  }

  return (
    <div className="min-w-80 bg-neutral-100 font-sans text-neutral-900 antialiased">
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <header className="border-neutral-300 bg-white" role="banner">
        <div className={cn(pageWidth, "flex min-h-[76px] items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start max-[760px]:py-3.5")}>
          <div className="flex items-baseline gap-4 max-[760px]:gap-2.5">
            <div className="flex items-end gap-3.5 max-[760px]:gap-3">
              <a className="text-neutral-900 no-underline" href="/" aria-label="Accueil isora">
                <IsoraWordmark className="w-28 max-[760px]:w-24" />
              </a>
              <p className="m-0 translate-y-1 leading-[1.45] text-neutral-500 max-[760px]:max-w-[19rem] max-[760px]:translate-y-[3px] max-[760px]:text-[0.92rem] max-[760px]:leading-[1.35]">
                <span className="max-[760px]:hidden">{text.tagline}</span>
                <span className="hidden max-[760px]:inline">{text.mobileTagline}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 max-[760px]:w-full max-[760px]:justify-between">
            <a
              className="inline-flex min-h-10 items-center px-3.5 font-bold text-blue-800 underline decoration-1 underline-offset-[3px] hover:bg-blue-50 max-[760px]:hidden"
              href="#fiches"
            >
              {counts.sources} {text.verifiedSources}
            </a>
            <a
              className={cn(icon18, "inline-flex min-h-10 items-center gap-2 px-3.5 font-bold text-blue-800 underline decoration-1 underline-offset-[3px] hover:bg-blue-50")}
              href="/blog/"
            >
              <FileText aria-hidden="true" />
              {text.blog}
            </a>
            {/*
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
            */}
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
              <p className="m-0 text-base font-extrabold leading-normal text-blue-800 max-[760px]:hidden">
                {text.heroKicker}
              </p>
              <h1 className="mt-3.5 max-w-[780px] text-[3.45rem] font-extrabold leading-[1.1] tracking-normal text-neutral-900 max-[760px]:text-[2.35rem]">
                {text.heroTitle}
              </h1>
              <p className="mt-[22px] max-w-[720px] text-[1.15rem] leading-[1.65] text-neutral-700">
                <span className="max-[760px]:hidden">{text.heroBody}</span>
                <span className="hidden max-[760px]:inline">{text.mobileHeroBody}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="border-neutral-300 bg-white max-[760px]:hidden">
          <div
            className={cn(
              pageWidth,
              "grid gap-3 pt-4 max-[760px]:grid-cols-2",
              showMenSummaryTile && showWomenSummaryTile ? "grid-cols-3" : "grid-cols-2",
            )}
            aria-label="État de la base"
          >
            {showMenSummaryTile && (
              <button
                className={cn(
                  "flex min-h-[118px] cursor-pointer flex-col justify-between border-0 border-l-4 border-l-violet-700 bg-white p-5 text-left ring-1 ring-inset ring-neutral-300 hover:bg-violet-50 max-[760px]:min-h-[74px] max-[760px]:p-3",
                  selectedTags.includes("hommes") && "bg-violet-50 ring-violet-200",
                )}
                type="button"
                aria-pressed={selectedTags.includes("hommes")}
                onClick={() => {
                  setSide("tous");
                  addTag("hommes");
                }}
              >
                <span className="text-5xl font-extrabold leading-none text-violet-700 max-[760px]:hidden">{counts.hommes}</span>
                <small className="font-bold leading-[1.35] text-neutral-700 max-[760px]:text-[0.82rem]">{text.menAsymmetries}</small>
              </button>
            )}
            {showWomenSummaryTile && (
              <button
                className={cn(
                  "flex min-h-[118px] cursor-pointer flex-col justify-between border-0 border-l-4 border-l-cyan-600 bg-white p-5 text-left ring-1 ring-inset ring-neutral-300 hover:bg-cyan-50 max-[760px]:min-h-[74px] max-[760px]:p-3",
                  selectedTags.includes("femmes") && "bg-cyan-50 ring-cyan-200",
                )}
                type="button"
                aria-pressed={selectedTags.includes("femmes")}
                onClick={() => {
                  setSide("tous");
                  addTag("femmes");
                }}
              >
                <span className="text-5xl font-extrabold leading-none text-cyan-600 max-[760px]:hidden">{counts.femmes}</span>
                <small className="font-bold leading-[1.35] text-neutral-700 max-[760px]:text-[0.82rem]">{text.womenAsymmetries}</small>
              </button>
            )}
            <div className="flex min-h-[118px] flex-col justify-between gap-2.5 border-l-4 border-l-green-700 bg-white p-5 ring-1 ring-inset ring-neutral-300 max-[760px]:hidden">
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
                <p className="mt-1 text-sm leading-snug text-neutral-500">{nextDailyRun}</p>
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
                      onClick={clearFilters}
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
              <button
                className={cn(icon18, "flex w-full items-center gap-2 border-0 bg-transparent p-0 text-left text-neutral-900")}
                type="button"
                aria-expanded={filterPanelsOpen.angles}
                onClick={() =>
                  setFilterPanelsOpen((currentPanels) => ({
                    ...currentPanels,
                    angles: !currentPanels.angles,
                  }))
                }
              >
                <Tags className="text-blue-800" aria-hidden="true" />
                <h3 className="m-0 flex-1 text-[0.96rem] leading-tight">{text.angles}</h3>
                <ChevronDown
                  className={cn(
                    "text-blue-800 transition-transform",
                    filterPanelsOpen.angles && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
              {filterPanelsOpen.angles && (
                <div className="flex flex-wrap gap-1.5">
                  {(["hommes", "femmes"] as const).map((tag) => (
                    <button
                      className={cn(
                        "inline-flex min-h-8 max-w-full items-center gap-1.5 border border-neutral-300 bg-white px-2.5 py-1.5 text-left text-[0.78rem] font-bold text-neutral-700 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-800",
                        selectedTags.includes(tag) && "border-blue-200 bg-blue-50 text-blue-800",
                      )}
                      key={`angle-participant-${tag}`}
                      type="button"
                      aria-pressed={selectedTags.includes(tag)}
                      onClick={() => {
                        setSide("tous");
                        addTag(tag);
                      }}
                    >
                      <span className="min-w-0 [overflow-wrap:anywhere]">{displaySideLabels[tag]}</span>
                      <span className="text-[0.72rem] text-neutral-500">{counts[tag]}</span>
                    </button>
                  ))}
                  {angleStats.map((stat) => (
                    <button
                      className={cn(
                        "inline-flex min-h-8 max-w-full items-center gap-1.5 border border-neutral-300 bg-white px-2.5 py-1.5 text-left text-[0.78rem] font-bold text-neutral-700 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-800",
                        angle === stat.label && "border-blue-200 bg-blue-50 text-blue-800",
                      )}
                      key={stat.label}
                      type="button"
                      aria-pressed={angle === stat.label}
                      onClick={() => setAngle((currentAngle) => (currentAngle === stat.label ? "tous" : stat.label))}
                    >
                      <span className="min-w-0 [overflow-wrap:anywhere]">
                        {displayAngleLabels[stat.label]}
                      </span>
                      <span className="text-[0.72rem] text-neutral-500">{stat.total}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-2.5" aria-label="Filtres par domaine">
              <button
                className={cn(icon18, "flex w-full items-center gap-2 border-0 bg-transparent p-0 text-left text-neutral-900")}
                type="button"
                aria-expanded={filterPanelsOpen.domains}
                onClick={() =>
                  setFilterPanelsOpen((currentPanels) => ({
                    ...currentPanels,
                    domains: !currentPanels.domains,
                  }))
                }
              >
                <Tags className="text-blue-800" aria-hidden="true" />
                <h3 className="m-0 flex-1 text-[0.96rem] leading-tight">{text.domains}</h3>
                <ChevronDown
                  className={cn(
                    "text-blue-800 transition-transform",
                    filterPanelsOpen.domains && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
              {filterPanelsOpen.domains && (
                <div className="flex flex-wrap gap-1.5">
                  {domainStats.map((stat) => (
                    <button
                      className={cn(
                        "inline-flex min-h-8 max-w-full items-center gap-1.5 border border-neutral-300 bg-white px-2.5 py-1.5 text-left text-[0.78rem] font-bold text-neutral-700 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-800",
                        domain === stat.label && "border-blue-200 bg-blue-50 text-blue-800",
                      )}
                      key={stat.label}
                      type="button"
                      aria-pressed={domain === stat.label}
                      onClick={() => setDomain((currentDomain) => (currentDomain === stat.label ? "tous" : stat.label))}
                    >
                      <span className="min-w-0 [overflow-wrap:anywhere]">{stat.label}</span>
                      <span className="text-[0.72rem] text-neutral-500">{stat.total}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0" aria-label={text.claims} id="fiches">
            {filteredClaims.length === 0 ? (
              <div className={cn(panel, "grid min-h-48 place-items-center p-6 text-center")}>
                <div>
                  <p className="m-0 text-lg font-extrabold text-neutral-900">{text.noResults}</p>
                  <button
                    className={cn(primaryAction, "mt-4 w-full max-w-sm")}
                    type="button"
                    onClick={clearFilters}
                  >
                    {text.clearAllFilters}
                  </button>
                </div>
              </div>
            ) : (
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
            )}
            <div className="mt-4 hidden min-h-[118px] flex-col justify-between gap-2.5 border-l-4 border-l-green-700 bg-white p-5 ring-1 ring-inset ring-neutral-300 max-[760px]:flex">
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
                    {text.proposeClaim}
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-neutral-500">{text.suggestionIntro}</p>
                </div>
                <button
                  className={cn(icon18, "inline-flex h-10 w-10 items-center justify-center border-0 bg-neutral-200 text-blue-800")}
                  type="button"
	                  onClick={() => {
	                    setIsFormOpen(false);
	                    setSuggestionSources([""]);
	                    setSubmitted(false);
	                    setSubmissionError(false);
	                  }}
                  aria-label={text.close}
                >
                  <X aria-hidden="true" />
                </button>
              </div>

              <form className="mt-[18px] grid gap-3" onSubmit={handleSuggestionSubmit}>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  {text.affectedGroup}
                  <select className={field} name="side" required defaultValue="hommes">
                    <option value="hommes">{displaySideLabels.hommes}</option>
                    <option value="femmes">{displaySideLabels.femmes}</option>
                  </select>
                </label>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  {text.asymmetryAngle}
                  <select className={field} name="angle" required defaultValue="désavantage_subi">
                    {(Object.keys(angleLabels).filter((label) => label !== "tous") as ClaimAngle[]).map((label) => (
                      <option key={label} value={label}>
                        {displayAngleLabels[label]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  {text.title}
                  <input className={field} name="title" type="text" required minLength={8} />
                </label>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  {text.summary}
                  <textarea
                    className={cn(field, "min-h-36 resize-y py-2.5 leading-relaxed")}
                    name="summary"
                    required
                    minLength={16}
                    placeholder={text.summaryPlaceholder}
                  />
                </label>

                <div className="grid gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-neutral-700">{text.sources}</span>
                    <button
                      className={cn(icon18, "inline-flex min-h-9 items-center gap-1.5 border-0 bg-neutral-200 px-2.5 text-sm font-bold text-blue-800 hover:bg-blue-100")}
                      type="button"
                      onClick={() => setSuggestionSources((currentSources) => [...currentSources, ""])}
                    >
                      <Plus aria-hidden="true" />
                      {text.add}
                    </button>
                  </div>
                  {suggestionSources.map((source, index) => (
                    <label className="grid gap-[7px] text-sm font-bold text-neutral-700" key={`suggestion-source-${index}`}>
                      {text.source} {index + 1}
                      <input
                        className={field}
                        type="url"
                        value={source}
                        onChange={(event) => updateSuggestionSource(index, event.target.value)}
                        required={index === 0}
                        placeholder="https://..."
                      />
                    </label>
                  ))}
                </div>

                <button className={cn(primaryAction, "w-full")} type="submit">
                  <Send className="h-[18px] w-[18px]" aria-hidden="true" />
                  {text.sendContribution}
                </button>
                {submitted && (
                  <p className="font-bold text-green-700">
                    {text.contributionSent}
                  </p>
                )}
                {submissionError && (
                  <p className="font-bold text-red-700">
                    {text.contributionError}
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
                    {text.contestClaim}
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-neutral-500">{contestedClaim.title}</p>
                </div>
                <button
                  className={cn(icon18, "inline-flex h-10 w-10 items-center justify-center border-0 bg-neutral-200 text-blue-800")}
                  type="button"
                  onClick={closeContestForm}
                  aria-label={text.close}
                >
                  <X aria-hidden="true" />
                </button>
              </div>

              <form className="mt-[18px] grid gap-3" onSubmit={handleContestSubmit}>
                <label className="grid gap-[7px] text-sm font-bold text-neutral-700">
                  {text.correctionLabel}
                  <textarea
                    className={cn(field, "min-h-36 resize-y py-2.5 leading-relaxed")}
                    name="correction"
                    required
                    minLength={12}
                    placeholder={text.correctionPlaceholder}
                  />
                </label>

                <div className="grid gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-neutral-700">{text.sources}</span>
                    <button
                      className={cn(icon18, "inline-flex min-h-9 items-center gap-1.5 border-0 bg-neutral-200 px-2.5 text-sm font-bold text-blue-800 hover:bg-blue-100")}
                      type="button"
                      onClick={() => setContestSources((currentSources) => [...currentSources, ""])}
                    >
                      <Plus aria-hidden="true" />
                      {text.add}
                    </button>
                  </div>
                  {contestSources.map((source, index) => (
                    <label className="grid gap-[7px] text-sm font-bold text-neutral-700" key={`contest-source-${index}`}>
                      {text.source} {index + 1}
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
                  {text.sendContest}
                </button>
                {contestSubmitted && (
                  <p className="font-bold text-green-700">
                    {text.contestSent}
                  </p>
                )}
                {contestError && (
                  <p className="font-bold text-red-700">
                    {text.contestError}
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
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
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
  const hybridParticipantTags = getHybridParticipantTags(claim);
  const isHybridSexCard = hybridParticipantTags.length > 1;
  const sideColor = isHybridSexCard ? "text-blue-700" : isWomen ? "text-cyan-600" : "text-violet-700";
  const sideBg = isHybridSexCard ? "bg-blue-50" : isWomen ? "bg-cyan-50" : "bg-violet-100";
  const sideBorder = isHybridSexCard ? "border-t-blue-500" : isWomen ? "border-t-cyan-600" : "border-t-violet-700";
  const periodLabel = getPeriodLabel(claim);
  const shouldShowSideChip = !hybridParticipantTags.includes(claim.side);
  const hiddenBottomParticipantTags = isHybridSexCard ? hybridParticipantTags : [];
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
  const mobileDetailsId = `${claim.id}-mobile-details`;
  const participantChipStyles: Record<string, string> = {
    femmes: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    hommes: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  const selectedParticipantChipStyles: Record<string, string> = {
    femmes: "!bg-cyan-100 !text-cyan-900 !ring-cyan-300",
    hommes: "!bg-violet-100 !text-violet-900 !ring-violet-300",
  };

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
          {hybridParticipantTags.map((label) => (
            <button
              className={cn(
                chipButton,
                participantChipStyles[label] ?? "bg-blue-50 text-blue-800 ring-blue-200",
                selectedTags.includes(label) && (selectedParticipantChipStyles[label] ?? selectedChip),
              )}
              key={`hybrid-top-${label}`}
              type="button"
              aria-pressed={selectedTags.includes(label)}
              onClick={() => onTagClick(label)}
            >
              {formatTagLabel(label)}
            </button>
          ))}
          {shouldShowSideChip && (
            <button
              className={cn(chipButton, sideBg, sideColor, selectedSide === claim.side && selectedChip)}
              type="button"
              aria-pressed={selectedSide === claim.side}
              onClick={() => onSideClick(claim.side)}
            >
              {displaySideLabels[claim.side]}
            </button>
          )}
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

      <div className="mt-7 space-y-4 max-[760px]:mt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="m-0 flex-1 text-[1.35rem] font-extrabold leading-[1.24] text-neutral-900 max-[760px]:text-[1.08rem]">
            {claimTitle}
          </h3>
          <button
            className="hidden min-h-8 shrink-0 items-center justify-center border border-blue-200 bg-blue-50 px-2.5 py-1 text-[0.78rem] font-extrabold text-blue-800 hover:bg-blue-100 max-[760px]:inline-flex"
            type="button"
            aria-controls={mobileDetailsId}
            aria-expanded={isMobileExpanded}
            onClick={() => setIsMobileExpanded((currentValue) => !currentValue)}
          >
            {isMobileExpanded ? text.hideDetails : text.showDetails}
          </button>
        </div>
      </div>

      <div className={cn("contents", !isMobileExpanded && "max-[760px]:hidden")} id={mobileDetailsId}>
      <div className="mt-4">
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
          const isHybridParticipantTag = hybridParticipantTags.includes(sourceTag);

          if (hiddenBottomParticipantTags.includes(sourceTag)) {
            return null;
          }

          return (
            <button
              className={cn(
                "min-h-[27px] border-0 px-2 py-1.5 text-[0.78rem] font-bold ring-1 ring-inset hover:bg-blue-100 hover:text-blue-800",
                isActive
                  ? "bg-blue-100 text-blue-900 ring-blue-300"
                  : isHybridParticipantTag
                    ? "bg-blue-50 text-blue-800 ring-blue-200"
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
          className={cn(icon18, "flex min-h-[38px] items-center justify-center gap-2 border border-neutral-300 bg-white px-2.5 py-[7px] text-[0.86rem] font-bold text-blue-800 hover:bg-blue-50 max-[760px]:hidden")}
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
      <button
        className={cn(icon18, "mt-3 hidden min-h-[42px] w-full items-center justify-center gap-2 border border-neutral-300 bg-white px-2.5 py-[9px] text-[0.86rem] font-bold text-blue-800 hover:bg-blue-50 max-[760px]:flex")}
        type="button"
        onClick={() => onContestClick(claim)}
      >
        <AlertTriangle aria-hidden="true" />
        {text.contest}
      </button>
      </div>
    </article>
  );
}

export default App;
