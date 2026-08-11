export type LexiconEntry = {
  slug: string;
  term: string;
  category: "repere" | "opposition" | "haine" | "methode" | "angle";
  definition: string;
  detail: string;
  forms?: Partial<Record<"fr" | "en", string[]>>;
  doNotConfuseWith?: string[];
  relatedClaimIds?: string[];
};

export const lexiconNotice =
  "Ce lexique fixe les repères éditoriaux utilisés par isora. Il ne prétend pas remplacer les dictionnaires : il sépare quatre axes indépendants, le combat contre une asymétrie, l'opposition de principe à ce combat, l'adhésion à des rôles sexués traditionnels et la haine d'un sexe. Féminisme et masculinisme nomment ici l'objet d'un combat; antiféminisme et antimasculinisme nomment son opposition systématique; virilisme et féminilisme nomment des normes de rôles; misandrie et misogynie nomment des haines ou des mépris.";

export type LexiconTextMatch = {
  start: number;
  end: number;
  text: string;
  entry: LexiconEntry;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const compiledMatchers = new Map<
  "fr" | "en",
  { entryByForm: Map<string, LexiconEntry>; matcherSource: string; localeCode: string }
>();

export function getLexiconMatches(value: string, locale: "fr" | "en" = "fr"): LexiconTextMatch[] {
  if (!value) return [];

  let compiledMatcher = compiledMatchers.get(locale);

  if (!compiledMatcher) {
    const localeCode = locale === "fr" ? "fr-FR" : "en-GB";
    const localizedForms = lexiconEntries.flatMap((entry) =>
      (entry.forms?.[locale] ?? []).map((form) => ({ entry, form })),
    );
    const entryByForm = new Map(
      localizedForms.map(({ entry, form }) => [form.toLocaleLowerCase(localeCode), entry]),
    );
    const alternatives = [...entryByForm.keys()]
      .sort((left, right) => right.length - left.length)
      .map(escapeRegExp)
      .join("|");

    compiledMatcher = {
      entryByForm,
      localeCode,
      matcherSource: `(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`,
    };
    compiledMatchers.set(locale, compiledMatcher);
  }

  if (compiledMatcher.entryByForm.size === 0) return [];

  const matcher = new RegExp(compiledMatcher.matcherSource, "giu");

  return [...value.matchAll(matcher)].flatMap((match) => {
    const text = match[0];
    const entry = compiledMatcher.entryByForm.get(text.toLocaleLowerCase(compiledMatcher.localeCode));
    const start = match.index;

    return entry && start !== undefined
      ? [{ start, end: start + text.length, text, entry }]
      : [];
  });
}

export const lexiconEntries: LexiconEntry[] = [
  {
    slug: "fille-femme",
    term: "Fille / femme",
    category: "repere",
    definition: "Dans le contexte éditorial d'isora : être humain (Homo sapiens) de sexe chromosomique XX.",
    detail:
      "Cette convention fixe le périmètre du site. Elle ne signifie pas que chaque source citée mesure les chromosomes : lorsqu'une source parle de femmes, de sexe déclaré, de sexe assigné ou d'une catégorie administrative sans mesurer XX, isora conserve le libellé de la source et précise la population réellement mesurée.",
  },
  {
    slug: "garcon-homme",
    term: "Garçon / homme",
    category: "repere",
    definition: "Dans le contexte éditorial d'isora : être humain (Homo sapiens) de sexe chromosomique XY.",
    detail:
      "Cette convention fixe le périmètre du site. Elle ne signifie pas que chaque source citée mesure les chromosomes : lorsqu'une source parle d'hommes, de sexe déclaré, de sexe assigné ou d'une catégorie administrative sans mesurer XY, isora conserve le libellé de la source et précise la population réellement mesurée.",
  },
  {
    slug: "feminisme",
    term: "Féminisme",
    category: "repere",
    definition: "Combat contre les asymétries en défaveur des filles et des femmes.",
    detail:
      "Dans isora, le terme désigne un mouvement ou une position centrée sur les droits, risques, violences, représentations ou conséquences défavorables aux filles et aux femmes. Il ne décrit à lui seul ni une opinion sur les hommes, ni une adhésion ou une opposition aux rôles sexués traditionnels. Une même personne peut donc être féministe et masculiniste selon les asymétries qu'elle défend.",
    forms: {
      fr: ["féminisme", "féministe", "féministes"],
      en: ["feminism", "feminist", "feminists"],
    },
    doNotConfuseWith: ["féminilisme", "misandrie", "antimasculinisme"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "masculinisme",
    term: "Masculinisme",
    category: "repere",
    definition: "Combat contre les asymétries en défaveur des garçons et des hommes.",
    detail:
      "Dans isora, ce repère sert à nommer la défense factuelle et pacifique des vulnérabilités masculines. Il ne décrit à lui seul ni une opinion sur les femmes, ni une adhésion ou une opposition aux rôles sexués traditionnels. Une même personne peut donc être masculiniste et féministe selon les asymétries qu'elle défend. Lorsqu'un dictionnaire, un média ou un rapport public emploie masculinisme pour désigner l'antiféminisme, le virilisme, la misogynie ou des actes violents, isora conserve le titre exact pour la traçabilité mais ne reprend pas cette qualification à son compte : chaque élément est reclassé séparément selon son contenu observable.",
    forms: {
      fr: ["masculinisme", "masculiniste", "masculinistes"],
      en: ["masculinism", "masculinist", "masculinists"],
    },
    doNotConfuseWith: ["virilisme", "misogynie", "antiféminisme"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "antifeminisme",
    term: "Antiféminisme",
    category: "opposition",
    definition:
      "Opposition de principe au féminisme ou disqualification systématique des combats pacifiques contre les asymétries en défaveur des filles et des femmes.",
    detail:
      "Dans isora, le terme vise l'opposition générale à la légitimité du combat féministe, ou sa disqualification répétée indépendamment des faits examinés. Contester une statistique, une méthode, une mesure ou une revendication féministe précise ne suffit pas à caractériser l'antiféminisme : il faut observer une opposition de principe ou une disqualification systématique. L'antiféminisme n'implique pas automatiquement la misogynie, le virilisme ou le masculinisme.",
    forms: {
      fr: ["antiféminisme", "antiféministe", "antiféministes"],
      en: ["antifeminism", "anti-feminism", "antifeminist", "anti-feminist", "antifeminists", "anti-feminists"],
    },
    doNotConfuseWith: ["misogynie", "virilisme", "masculinisme"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "antimasculinisme",
    term: "Antimasculinisme",
    category: "opposition",
    definition:
      "Opposition de principe au masculinisme ou disqualification systématique des combats pacifiques contre les asymétries en défaveur des garçons et des hommes.",
    detail:
      "Dans isora, le terme vise l'opposition générale à la légitimité du combat masculiniste, ou sa disqualification répétée indépendamment des faits examinés. Contester une statistique, une méthode, une mesure ou une revendication masculiniste précise ne suffit pas à caractériser l'antimasculinisme : il faut observer une opposition de principe ou une disqualification systématique. L'antimasculinisme n'implique pas automatiquement la misandrie, le féminilisme ou le féminisme.",
    forms: {
      fr: ["antimasculinisme", "antimasculiniste", "antimasculinistes"],
      en: ["antimasculinism", "anti-masculinism", "antimasculinist", "anti-masculinist", "antimasculinists", "anti-masculinists"],
    },
    doNotConfuseWith: ["misandrie", "féminilisme", "féminisme"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "virilisme",
    term: "Virilisme",
    category: "repere",
    definition:
      "Adhésion à un modèle traditionnel de virilité et aux rôles patriarcaux attendus des hommes.",
    detail:
      "Le virilisme valorise ou prescrit selon le sexe des qualités et obligations comme la force, la dureté, la domination, l'initiative, la prise de risque, la protection matérielle ou le refus de la vulnérabilité. Il peut renforcer des asymétries défavorables aux femmes comme aux hommes, tout en accordant des avantages liés à certains rôles. Aimer pour soi des traits perçus comme virils ne suffit pas : le repère vise leur transformation en norme attendue ou hiérarchiquement supérieure. Une personne de l'un ou l'autre sexe peut porter cette position.",
    forms: {
      fr: ["virilisme", "viriliste", "virilistes"],
      en: ["virilism", "virilist", "virilists"],
    },
    doNotConfuseWith: ["masculinisme", "misogynie"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "feminilisme",
    term: "Féminilisme",
    category: "repere",
    definition:
      "Néologisme éditorial d'isora : adhésion à un modèle traditionnel de féminité et aux rôles patriarcaux attendus des femmes.",
    detail:
      "Le féminilisme valorise ou prescrit selon le sexe des qualités, apparences et rôles comme la douceur, la retenue, le soin, la séduction, la dépendance matérielle ou l'attente de galanterie, de protection et de prise en charge par les hommes. Il peut renforcer des asymétries défavorables aux femmes comme aux hommes, tout en accordant des avantages liés à certains rôles. Aimer pour soi des traits perçus comme féminins ou apprécier un geste galant ne suffit pas : le repère vise leur transformation en norme sexuée. Le concept sociologique de « féminité accentuée » décrit un phénomène voisin de conformité au patriarcat. Une personne de l'un ou l'autre sexe peut porter cette position.",
    forms: {
      fr: ["féminilisme", "féminiliste", "féminilistes"],
      en: ["feminilism", "feminilist", "feminilists"],
    },
    doNotConfuseWith: ["féminisme", "misandrie"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "misandrie",
    term: "Misandrie",
    category: "haine",
    definition: "Haine ou mépris des hommes.",
    detail:
      "La misandrie décrit une hostilité envers les hommes comme groupe. Elle peut être exprimée par des femmes ou par des hommes. Elle n'est pas synonyme de féminisme, même si des discours se réclamant du féminisme peuvent parfois contenir des énoncés misandres. La disqualification générale d'une revendication masculine pacifique à cause du sexe qu'elle défend peut être étudiée comme une disqualification sexiste; la misandrie ne doit toutefois être retenue que si une haine ou un mépris des hommes est observable.",
    forms: {
      fr: ["misandrie", "misandre", "misandres"],
      en: ["misandry", "misandrist", "misandrists"],
    },
    doNotConfuseWith: ["féminisme", "antimasculinisme"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "misogynie",
    term: "Misogynie",
    category: "haine",
    definition: "Haine ou mépris des femmes.",
    detail:
      "La misogynie décrit une hostilité envers les femmes comme groupe. Elle peut être exprimée par des hommes ou par des femmes. Elle n'est pas synonyme de masculinisme au sens d'une défense factuelle des asymétries défavorables aux hommes.",
    forms: {
      fr: ["misogynie", "misogyne", "misogynes"],
      en: ["misogyny", "misogynist", "misogynists"],
    },
    doNotConfuseWith: ["masculinisme", "antiféminisme"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "sexisme",
    term: "Sexisme",
    category: "haine",
    definition: "Traitement, jugement, norme ou représentation défavorable fondé sur le sexe.",
    detail:
      "Le sexisme peut viser les filles, les femmes, les garçons ou les hommes selon le contexte. isora documente des asymétries précises plutôt que de déduire une intention sexiste sans source.",
    forms: {
      fr: ["sexisme", "sexiste", "sexistes"],
      en: ["sexism", "sexist", "sexists"],
    },
  },
  {
    slug: "asymetrie",
    term: "Asymétrie",
    category: "methode",
    definition: "Différence documentée entre filles/femmes et garçons/hommes.",
    detail:
      "Une asymétrie peut porter sur un droit, un risque, une exposition, une sanction, une représentation, une charge sociale ou une conséquence mesurée. Elle ne suffit pas toujours à prouver une discrimination intentionnelle.",
    forms: {
      fr: ["asymétrie", "asymétries"],
      en: ["asymmetry", "asymmetries"],
    },
  },
  {
    slug: "population-mesuree",
    term: "Population mesurée",
    category: "methode",
    definition: "Groupe réellement observé par la source citée.",
    detail:
      "Une source peut parler de femmes/hommes, de sexe déclaré, de sexe administratif ou d'une catégorie d'enquête sans mesurer les chromosomes. isora conserve le vocabulaire de la source et précise ce que la donnée permet ou non de conclure.",
    forms: {
      fr: ["population mesurée", "populations mesurées"],
      en: ["measured population", "measured populations"],
    },
  },
  {
    slug: "source-primaire",
    term: "Source primaire",
    category: "methode",
    definition: "Document qui produit directement la donnée, le droit ou l'analyse citée.",
    detail:
      "Quand c'est possible, isora privilégie les textes officiels, rapports statistiques, bases institutionnelles, publications scientifiques ou organismes producteurs plutôt qu'un commentaire secondaire.",
    forms: {
      fr: ["source primaire", "sources primaires"],
      en: ["primary source", "primary sources"],
    },
  },
  {
    slug: "desavantage-subi",
    term: "Désavantage subi",
    category: "angle",
    definition: "Asymétrie où un groupe supporte une charge, un risque ou une perte plus forte.",
    detail:
      "Cet angle décrit l'effet mesuré ou documenté sur les personnes concernées. Il ne désigne pas automatiquement un coupable individuel.",
    forms: {
      fr: ["désavantage subi", "désavantages subis"],
      en: ["suffered disadvantage", "suffered disadvantages"],
    },
  },
  {
    slug: "violence-exercee",
    term: "Violence exercée",
    category: "angle",
    definition: "Asymétrie portant sur les auteurs, mis en cause ou comportements violents mesurés.",
    detail:
      "Cet angle sert à ne pas mélanger la victimisation, les auteurs déclarés, les mis en cause, les condamnations et les représentations. Chaque source mesure un champ différent.",
    forms: {
      fr: ["violence exercée", "violences exercées"],
      en: ["violence committed", "violence perpetrated"],
    },
  },
  {
    slug: "perception",
    term: "Perception",
    category: "angle",
    definition: "Asymétrie de vocabulaire, perception, norme sociale ou représentation.",
    detail:
      "Cet angle couvre ce qui est perçu, dit ou cadré socialement: mots disponibles, stéréotypes, opinions, normes et représentations. Une perception peut signaler une asymétrie réelle ou ressentie, mais elle ne suffit pas toujours à prouver un droit, un accès concret ou un effet mesuré.",
    forms: {
      fr: ["perception", "perceptions"],
      en: ["perception", "perceptions"],
    },
  },
];
