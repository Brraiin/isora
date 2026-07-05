export type LexiconEntry = {
  slug: string;
  term: string;
  category: "repere" | "haine" | "methode" | "angle";
  definition: string;
  detail: string;
  doNotConfuseWith?: string[];
  relatedClaimIds?: string[];
};

export const lexiconNotice =
  "Ce lexique fixe les repères éditoriaux utilisés par isora. Il ne prétend pas remplacer les dictionnaires : il sert à éviter les confusions entre combat contre une asymétrie, haine d'un sexe, source statistique et interprétation. Attention à ne pas confondre féminisme avec misandrie, ni masculinisme avec misogynie.";

export const lexiconEntries: LexiconEntry[] = [
  {
    slug: "feminisme",
    term: "Féminisme",
    category: "repere",
    definition: "Combat contre les asymétries en défaveur des filles et des femmes.",
    detail:
      "Dans isora, le terme désigne un mouvement ou une position centrée sur les droits, risques, violences, représentations ou conséquences défavorables aux filles et aux femmes. Cette définition n'implique pas qu'une parole féministe serait automatiquement misandre.",
    doNotConfuseWith: ["misandrie"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "masculinisme",
    term: "Masculinisme",
    category: "repere",
    definition: "Combat contre les asymétries en défaveur des garçons et des hommes.",
    detail:
      "Dans isora, ce repère sert à nommer la défense factuelle des vulnérabilités masculines sans haine des femmes. Les dictionnaires et rapports publics francophones donnent souvent au mot un sens péjoratif ou antiféministe; cette fiche signale justement l'écart entre ce besoin lexical et l'usage courant.",
    doNotConfuseWith: ["misogynie"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "misandrie",
    term: "Misandrie",
    category: "haine",
    definition: "Haine ou mépris des hommes.",
    detail:
      "La misandrie décrit une hostilité envers les hommes comme groupe. Elle peut être exprimée par des femmes ou par des hommes. Elle n'est pas synonyme de féminisme, même si des discours se réclamant du féminisme peuvent parfois contenir des énoncés misandres.",
    doNotConfuseWith: ["féminisme"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "misogynie",
    term: "Misogynie",
    category: "haine",
    definition: "Haine ou mépris des femmes.",
    detail:
      "La misogynie décrit une hostilité envers les femmes comme groupe. Elle peut être exprimée par des hommes ou par des femmes. Elle n'est pas synonyme de masculinisme au sens d'une défense factuelle des asymétries défavorables aux hommes.",
    doNotConfuseWith: ["masculinisme"],
    relatedClaimIds: ["hommes-vocabulaire-masculinisme-pejoratif"],
  },
  {
    slug: "sexisme",
    term: "Sexisme",
    category: "haine",
    definition: "Traitement, jugement, norme ou représentation défavorable fondé sur le sexe.",
    detail:
      "Le sexisme peut viser les filles, les femmes, les garçons ou les hommes selon le contexte. isora documente des asymétries précises plutôt que de déduire une intention sexiste sans source.",
  },
  {
    slug: "asymetrie",
    term: "Asymétrie",
    category: "methode",
    definition: "Différence documentée entre filles/femmes et garçons/hommes.",
    detail:
      "Une asymétrie peut porter sur un droit, un risque, une exposition, une sanction, une représentation, une charge sociale ou une conséquence mesurée. Elle ne suffit pas toujours à prouver une discrimination intentionnelle.",
  },
  {
    slug: "population-mesuree",
    term: "Population mesurée",
    category: "methode",
    definition: "Groupe réellement observé par la source citée.",
    detail:
      "Une source peut parler de femmes/hommes, de sexe déclaré, de sexe administratif ou d'une catégorie d'enquête sans mesurer les chromosomes. isora conserve le vocabulaire de la source et précise ce que la donnée permet ou non de conclure.",
  },
  {
    slug: "source-primaire",
    term: "Source primaire",
    category: "methode",
    definition: "Document qui produit directement la donnée, le droit ou l'analyse citée.",
    detail:
      "Quand c'est possible, isora privilégie les textes officiels, rapports statistiques, bases institutionnelles, publications scientifiques ou organismes producteurs plutôt qu'un commentaire secondaire.",
  },
  {
    slug: "desavantage-subi",
    term: "Désavantage subi",
    category: "angle",
    definition: "Asymétrie où un groupe supporte une charge, un risque ou une perte plus forte.",
    detail:
      "Cet angle décrit l'effet mesuré ou documenté sur les personnes concernées. Il ne désigne pas automatiquement un coupable individuel.",
  },
  {
    slug: "violence-exercee",
    term: "Violence exercée",
    category: "angle",
    definition: "Asymétrie portant sur les auteurs, mis en cause ou comportements violents mesurés.",
    detail:
      "Cet angle sert à ne pas mélanger la victimisation, les auteurs déclarés, les mis en cause, les condamnations et les représentations. Chaque source mesure un champ différent.",
  },
  {
    slug: "recit-sur-le-sexe",
    term: "Récit sur le sexe",
    category: "angle",
    definition: "Asymétrie de vocabulaire, perception, norme sociale ou représentation.",
    detail:
      "Cet angle couvre les mots disponibles, les cadrages publics, les stéréotypes, les opinions et les récits sociaux. Il demande une prudence particulière, car il ne mesure pas toujours un droit ou un comportement.",
  },
];
