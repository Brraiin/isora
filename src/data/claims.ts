export type Side = "hommes" | "femmes";
export type ClaimAngle = "désavantage_subi" | "violence_exercée" | "récit_sur_le_sexe";

export type Domain =
  | "Travail"
  | "Santé"
  | "Famille"
  | "Justice"
  | "Éducation"
  | "Revenus"
  | "Violences"
  | "Religieux"
  | "Droits"
  | "Conflits"
  | "Numérique"
  | "Autonomie";

export type Confidence = "forte" | "moyenne" | "à vérifier";
export type StatutTemporel =
  | "historique"
  | "actuel"
  | "en hausse"
  | "en baisse"
  | "persistant"
  | "lié à une crise"
  | "partiellement réformé"
  | "variable selon pays"
  | "données insuffisantes";

export type Source = {
  label: string;
  publisher: string;
  url: string;
  date: string;
};

export type ClaimTranslation = {
  title: string;
  summary: string;
  nuance: string;
  sourcePopulation?: string;
  tags?: string[];
};

export type Claim = {
  id: string;
  side: Side;
  angle: ClaimAngle;
  domain: Domain;
  title: string;
  metric: string;
  summary: string;
  tags: string[];
  sourcePopulation?: string;
  source: Source;
  additionalSources?: Source[];
  confidence: Confidence;
  lastChecked: string;
  nuance: string;
  translations?: Partial<Record<"en", ClaimTranslation>>;
  categorie_isora: "Homme (XY)" | "Femme (XX)";
  libelle_source: string;
  mesure_chromosomes: boolean;
  theme: Domain;
  pays_ou_zone: string;
  periode_debut: string;
  periode_fin: string | null;
  statut_temporel: StatutTemporel;
  intensite_contextuelle: string;
  fait_resume: string;
  source_url: string;
  date_consultation: string;
  countryScope: string;
  regionScope: string;
  periodStart: string;
  periodEnd: string | null;
  currentStatus: StatutTemporel;
  legalType: string;
  methodNote: string;
};

type RawClaim = Omit<
  Claim,
  | "angle"
  | "categorie_isora"
  | "libelle_source"
  | "mesure_chromosomes"
  | "theme"
  | "pays_ou_zone"
  | "periode_debut"
  | "periode_fin"
  | "statut_temporel"
  | "intensite_contextuelle"
  | "fait_resume"
  | "source_url"
  | "date_consultation"
  | "countryScope"
  | "regionScope"
  | "periodStart"
  | "periodEnd"
  | "currentStatus"
  | "legalType"
  | "methodNote"
> & {
  angle?: ClaimAngle;
};

const rawClaims: RawClaim[] = [
  {
    id: "hommes-accidents-travail",
    side: "hommes",
    domain: "Travail",
    title: "Hommes très majoritaires parmi les morts au travail",
    metric: ">90 %",
    summary:
      "Les accidents du travail mortels concernent à plus de 90 % des hommes dans tous les secteurs étudiés. Les métiers du BTP, du transport, de la manutention et d'autres activités exposées restent fortement masculinisés.",
    tags: ["travail", "sécurité", "sociétal", "métiers dangereux"],
    source: {
      label:
        "Photographie statistique de la sinistralité au travail en France selon le sexe",
      publisher: "ANACT",
      url: "https://www.anact.fr/photographie-statistique-de-la-sinistralite-au-travail-en-france-selon-le-sexe",
      date: "2022",
    },
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Le constat documente une exposition au risque. Il ne prouve pas à lui seul une règle juridique défavorable aux hommes.",
  },
  {
    id: "hommes-suicide",
    side: "hommes",
    domain: "Santé",
    title: "Surmortalité masculine par suicide",
    metric: "75 %",
    summary:
      "En France, 8 848 décès par suicide ont été recensés en 2023 et 75 % concernent des hommes. L'isolement, la précarité et les ruptures de parcours sont cités parmi les déterminants sociaux à surveiller.",
    tags: ["santé", "isolement", "sociétal", "prévention"],
    source: {
      label: "Prévention du suicide : le lien social comme rempart",
      publisher: "Ministère du Travail et des Solidarités",
      url: "https://solidarites.gouv.fr/prevention-du-suicide-le-lien-social-comme-rempart-contre-lisolement",
      date: "2026",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le taux varie fortement selon l'âge, le niveau de vie et le territoire. La lecture doit rester sanitaire et sociale, pas accusatoire.",
  },
  {
    id: "hommes-esperance-vie",
    side: "hommes",
    domain: "Santé",
    title: "Espérance de vie plus courte pour les hommes en France",
    metric: "-5,6 ans",
    summary:
      "En 2025, l'Insee estime l'espérance de vie à la naissance à 80,3 ans pour les hommes contre 85,9 ans pour les femmes en France.",
    tags: ["santé", "mortalité", "sociétal"],
    source: {
      label: "Espérance de vie à divers âges",
      publisher: "Insee",
      url: "https://www.insee.fr/fr/statistiques/2416631",
      date: "13 janvier 2026",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'écart agrège comportements de santé, conditions de travail, exposition au risque et facteurs biologiques.",
  },
  {
    id: "hommes-pensions-alimentaires",
    side: "hommes",
    domain: "Justice",
    title: "Pères presque toujours débiteurs des pensions alimentaires",
    metric: "97 %",
    summary:
      "Dans les décisions étudiées par le ministère de la Justice, quand une contribution à l'entretien et à l'éducation de l'enfant est fixée, le parent débiteur est presque toujours le père.",
    tags: ["justice", "famille", "juridique", "séparation"],
    source: {
      label:
        "Une pension alimentaire fixée par les juges pour deux tiers des enfants de parents séparés",
      publisher: "Ministère de la Justice",
      url: "https://www.justice.gouv.fr/documentation/etudes-et-statistiques/pension-alimentaire-fixee-juges-deux-tiers-enfants-parents-separes",
      date: "2013",
    },
    confidence: "moyenne",
    lastChecked: "15 juin 2026",
    nuance:
      "La donnée est ancienne et reflète aussi la résidence principale des enfants. Elle doit être actualisée avant d'en faire un argument juridique fort.",
  },
  {
    id: "hommes-residence-alternee",
    side: "hommes",
    domain: "Famille",
    title: "Résidence alternée encore rare pour les pères séparés",
    metric: "14 %",
    summary:
      "L'Insee indique qu'en 2023, 14 % des enfants dont les parents sont séparés vivent en résidence alternée. Le reste vit principalement avec un seul parent, le plus souvent la mère selon les publications antérieures.",
    tags: ["famille", "coparentalité", "sociétal", "juridique"],
    source: {
      label: "En 2023, trois enfants sur dix vivent avec un seul de leurs parents",
      publisher: "Insee",
      url: "https://www.insee.fr/fr/statistiques/8310621",
      date: "janvier 2025",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La résidence dépend de l'âge de l'enfant, du logement, des demandes parentales, des revenus et des décisions judiciaires. Le chiffre ne suffit pas à isoler un biais du juge.",
  },
  {
    id: "hommes-femme-principale-pourvoyeuse-satisfaction",
    side: "hommes",
    domain: "Famille",
    title:
      "Quand la femme assure seule le revenu, la baisse de satisfaction est plus marquée chez les hommes",
    metric: "pénalité de bien-être",
    summary:
      "Dans une étude sur 9 pays européens, les femmes et les hommes déclarent en moyenne une satisfaction de vie plus basse quand la femme est la seule pourvoyeuse de revenus que lorsque le revenu principal vient de l'homme ou est partagé; la baisse est plus marquée chez les hommes, surtout quand l'homme est au chômage. Une étude britannique sur les couples mariés trouve aussi qu'une hausse du revenu relatif des hommes augmente leur satisfaction, alors qu'un effet équivalent n'apparaît pas chez les femmes.",
    tags: ["famille", "revenus", "couple", "satisfaction", "Europe", "Royaume-Uni"],
    source: {
      label:
        "The female-breadwinner well-being 'penalty': differences by men's (un)employment and country",
      publisher: "European Sociological Review / Oxford Academic",
      url: "https://academic.oup.com/esr/article/40/2/293/7190495",
      date: "2024",
    },
    additionalSources: [
      {
        label:
          "The Partner Pay Gap: Associations between Spouses' Relative Earnings and Life Satisfaction among Couples in the UK",
        publisher: "Work, Employment and Society / SAGE",
        url: "https://journals.sagepub.com/doi/10.1177/0950017020946657",
        date: "2021",
      },
      {
        label:
          "Are Female-Breadwinner Couples Always Less Stable? Evidence from French Administrative Data",
        publisher: "European Journal of Population / Springer",
        url: "https://link.springer.com/article/10.1007/s10680-024-09705-7",
        date: "2024",
      },
      {
        label: "Unlucky at work, unlucky in love: job loss and marital stability",
        publisher: "Review of Economics of the Household / Springer",
        url: "https://link.springer.com/article/10.1007/s11150-020-09506-x",
        date: "2021",
      },
    ],
    translations: {
      en: {
        title:
          "When the woman is the sole earner, the drop in life satisfaction is steeper for men",
        summary:
          "In a study covering nine European countries, women and men on average report lower life satisfaction when the woman is the sole breadwinner than when the main income comes from the man or is shared; the decline is steeper for men, especially when the man is unemployed. A UK study of married couples also finds that increases in men's relative earnings raise their life satisfaction, while no equivalent effect appears for women.",
        nuance:
          "These studies measure self-reported life satisfaction and statistical associations in heterosexual couples. They do not prove that every man feels emasculated or that a woman earning more mechanically causes separation. A 2024 French administrative study does find a higher risk of union dissolution in female-breadwinner couples, while also showing that near-equal earnings can be the most stable arrangement for some younger cohabiting or civil-union couples.",
        sourcePopulation:
          "Population measured by the sources: people in heterosexual couples surveyed in nine European countries in the European Social Survey (2004-2018), married co-resident couples in the UK Household Longitudinal Study, and couples observed in French administrative data for union dissolution. The sources use women/men categories and do not measure chromosomes.",
        tags: ["family", "income", "couples", "life satisfaction", "Europe", "United Kingdom"],
      },
    },
    confidence: "moyenne",
    lastChecked: "25 juin 2026",
    nuance:
      "Ces travaux mesurent une satisfaction déclarée et des associations statistiques dans des couples hétérosexuels; ils ne prouvent ni qu'un homme se sente individuellement « émasculé », ni qu'une femme qui gagne plus entraîne mécaniquement une rupture. L'étude française de 2024 trouve bien un risque de dissolution plus élevé dans les couples où la femme gagne davantage, mais elle montre aussi que des revenus proches peuvent être la configuration la plus stable chez certains couples plus jeunes en cohabitation ou en PACS.",
  },
  {
    id: "hommes-filiation-paternite-test-adn-judiciaire",
    side: "hommes",
    domain: "Justice",
    title: "Paternité biologique vérifiable seulement par une procédure judiciaire",
    metric: "1 an / 15 000 €",
    summary:
      "En France, un test de paternité est autorisé uniquement dans un cadre judiciaire; le réaliser hors de ce cadre est puni d'un an d'emprisonnement et de 15 000 € d'amende. La reconnaissance d'un enfant ne suppose pas de preuve biologique préalable, l'officier d'état civil n'effectue pas de vérification, et la fraude à la paternité n'est pas un délit autonome: le mensonge sur l'identité du père expose surtout à une contestation civile, sauf fraude qualifiée à la loi. La découverte d'une paternité attribuée à tort peut avoir un impact psychologique considérable sur l'homme qui s'est cru père.",
    tags: ["justice", "famille", "paternité", "filiation", "test ADN", "préjudice psychologique"],
    source: {
      label: "Dans quel cadre peut-on effectuer un test de paternité ?",
      publisher: "Service-Public.fr / DILA",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14042",
      date: "30 janvier 2025",
    },
    additionalSources: [
      {
        label: "Peut-on reconnaître un enfant dont on n'est pas le père ?",
        publisher: "Service-Public.fr / DILA",
        url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10428",
        date: "5 août 2025",
      },
      {
        label: "Cour de cassation, chambre criminelle, 4 mars 2026, n° 25-83.095",
        publisher: "Cour de cassation",
        url: "https://www.courdecassation.fr/decision/69a7e390cdc6046d4773ed5f",
        date: "4 mars 2026",
      },
      {
        label: "Contestation de la filiation (paternité ou maternité)",
        publisher: "Service-Public.fr / DILA",
        url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F940",
        date: "25 mars 2025",
      },
      {
        label: "Psychosocial consequences of disclosing misattributed paternity: a narrative review",
        publisher: "Journal of Family Issues / Monash University",
        url: "https://research.monash.edu/en/publications/psychosocial-consequences-of-disclosing-misattributed-paternity-a/",
        date: "2024",
      },
      {
        label: "Discovering Misattributed Paternity After DNA Testing and its Impact on Psychological Well-Being and Identity Formation",
        publisher: "American Journal of Qualitative Research",
        url: "https://www.ajqr.org/article/discovering-misattributed-paternity-after-dna-testing-and-its-impact-on-psychological-well-being-and-12611",
        date: "2022",
      },
    ],
    translations: {
      en: {
        title: "Biological paternity can only be verified through a court procedure",
        summary:
          "In France, a paternity test is legal only within a judicial framework; carrying one out outside that framework is punishable by one year in prison and a EUR 15,000 fine. Acknowledging a child does not require prior biological proof, the civil registrar does not verify it, and paternity fraud is not a standalone criminal offence: lying about the father's identity mainly exposes the situation to civil contestation, except in cases of qualified legal fraud. Discovering that paternity was wrongly attributed can have a major psychological impact on the man who believed he was the father.",
        nuance:
          "Saying that the woman faces no risk would be too absolute: organized fraud can lead to action by the public prosecutor, annulment of filiation, damages, or criminal penalties if it supports a qualified fraud. However, there is no general offence punishing the mere act of lying to a man about his biological paternity. The test must be ordered by a judge and the consent of the people concerned is still required; refusal is not an absolute veto, because the judge may interpret it as evidence of paternity or non-paternity. Available psychosocial studies point to a potentially strong impact of misattributed paternity, but the phenomenon remains less studied than other family disclosures.",
        sourcePopulation:
          "Population measured by the sources: people concerned by French proceedings on filiation, paternity contestation or paternity testing. The legal sources do not measure chromosomes.",
        tags: ["justice", "family", "paternity", "filiation", "DNA test", "psychological harm"],
      },
    },
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Dire que la femme n'encourt aucun risque serait trop absolu: une fraude organisée peut entraîner opposition du procureur, annulation de la filiation, dommages et intérêts, ou sanctions pénales si elle sert une fraude qualifiée. En revanche, il n'existe pas de délit général sanctionnant le simple fait de mentir à un homme sur sa paternité biologique. Le test doit être ordonné par un juge et le consentement des personnes concernées reste nécessaire; un refus n'est pas un veto absolu, car le juge peut l'interpréter comme un indice de paternité ou de non-paternité. Les études psychosociales disponibles signalent un fort retentissement possible de la paternité attribuée à tort, mais le phénomène reste moins étudié que d'autres révélations familiales.",
  },
  {
    id: "hommes-panama-fraude-paternite-crime-2026",
    side: "hommes",
    domain: "Justice",
    title: "Panama crée un délit spécifique de fraude à la paternité",
    metric: "2 à 5 ans",
    summary:
      "Au Panama, la loi n° 535 publiée le 19 juin 2026 crée un délit autonome de fraude à la paternité. Le texte prévoit 2 à 5 ans d'emprisonnement et 100 à 500 jours-amende lorsqu'un homme est amené, par tromperie ou dissimulation délibérée, à reconnaître comme sien un enfant qui n'est pas biologiquement le sien et à en assumer les responsabilités juridiques, économiques et patrimoniales.",
    tags: ["justice", "famille", "paternité", "filiation", "Panama", "droit pénal"],
    source: {
      label:
        "Gaceta Oficial n° 30550 - Ley n° 535 que sanciona el fraude de paternidad en la República de Panamá",
      publisher: "Gaceta Oficial de Panamá",
      url: "https://www.gacetaoficial.gob.pa/storage/gacetas/2026/06/30550/GacetaNo_30550_20260619.pdf",
      date: "19 juin 2026",
    },
    additionalSources: [
      {
        label: "Tipificarán fraude de paternidad con aumento por agravantes",
        publisher: "Asamblea Nacional de Panamá",
        url: "https://asamblea.gob.pa/Noticias/Actualidad/TIPIFICARAN-FRAUDE-DE-PATERNIDAD-CON-AUMENTO-POR-AGRAVANTES--",
        date: "juin 2026",
      },
    ],
    translations: {
      en: {
        title: "Panama creates a specific criminal offence for paternity fraud",
        summary:
          "In Panama, Law No. 535 published on June 19, 2026 creates a standalone criminal offence of paternity fraud. The law provides for 2 to 5 years in prison and 100 to 500 day-fines when a man is led, through deception or deliberate concealment, to acknowledge as his own a child who is not biologically his and to assume the corresponding legal, economic, and patrimonial responsibilities.",
        nuance:
          "This card concerns Panamanian criminal law as enacted in June 2026; it does not describe French law or a universal rule. The offence targets a specific form of deception tied to legal acknowledgement of a child and assumed responsibilities. The law also provides aggravated penalties when the fraud lasts more than five years, concerns two or more minors, or produces repeated economic benefit.",
        sourcePopulation:
          "Population measured by the sources: people concerned by Panamanian paternity acknowledgement, filiation and criminal law rules. The legal sources do not measure chromosomes.",
        tags: ["justice", "family", "paternity", "filiation", "Panama", "criminal law"],
      },
    },
    confidence: "forte",
    lastChecked: "25 juin 2026",
    nuance:
      "Cette fiche décrit le droit pénal panaméen adopté en juin 2026; elle ne vaut ni pour la France ni pour tous les pays. Le texte vise une tromperie ou dissimulation délibérée conduisant un homme à reconnaître un enfant non biologique et à en assumer les conséquences juridiques et économiques. La peine peut être aggravée si la fraude dure plus de cinq ans, concerne au moins deux mineurs ou procure un bénéfice économique répété.",
  },
  {
    id: "hommes-sorties-precoces",
    side: "hommes",
    domain: "Éducation",
    title: "Garçons plus touchés par les sorties précoces du système scolaire",
    metric: "9,5 % vs 5,6 %",
    summary:
      "En 2023, les sorties précoces du système scolaire concernent 9,5 % des hommes de 18 à 24 ans contre 5,6 % des femmes en France.",
    tags: ["éducation", "sociétal", "jeunesse"],
    source: {
      label: "Sorties précoces du système scolaire",
      publisher: "Insee",
      url: "https://www.insee.fr/fr/statistiques/3281681?sommaire=3281778",
      date: "6 janvier 2025",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'indicateur est fragile et l'Insee signale des précautions de comparaison. Il reste utile pour documenter un décrochage masculin relatif.",
  },
  {
    id: "hommes-bourses-stem-reservees-femmes",
    side: "hommes",
    domain: "Éducation",
    title: "Hommes exclus de certaines bourses STEM réservées aux femmes",
    metric: "15 000 €",
    summary:
      "Certains dispositifs d'aide scolaire ou professionnelle dans les STEM sont explicitement réservés aux femmes. Le programme STEM'Pulse indique par exemple que les profils éligibles sont des étudiantes STEM, entrepreneures ou femmes de plus de 45 ans en reconversion, avec une dotation étudiante pouvant atteindre 15 000 € au total.",
    tags: ["éducation", "bourses", "STEM", "orientation", "juridique"],
    source: {
      label: "FAQ - Bourse Fondation Siemens France - STEM'Pulse",
      publisher: "La Puissance du Lien / Fondation Siemens France",
      url: "https://www.lapuissancedulien.org/bourse-stem-pulse/faq",
      date: "2025-2026",
    },
    additionalSources: [
      {
        label: "Le Règlement - Bourse Fondation Siemens France - STEM'Pulse",
        publisher: "La Puissance du Lien / Fondation Siemens France",
        url: "https://www.lapuissancedulien.org/bourse-stem-pulse/le-reglement",
        date: "2025-2026",
      },
      {
        label: 'Bourses "Femmes en sciences"',
        publisher: "Fondation de l'Université d'Angers",
        url: "https://fondation.univ-angers.fr/fr/femmes-en-sciences-2/bourses-femmes-en-sciences.html",
        date: "consulté 2026",
      },
      {
        label: "Bourses sur critères sociaux : pour qui ?",
        publisher: "Étudiant.gouv",
        url: "https://www.etudiant.gouv.fr/fr/bourses-sur-criteres-sociaux-pour-qui-2980",
        date: "2026",
      },
      {
        label: "Les bourses sur critères sociaux (BCS)",
        publisher: "DREES",
        url: "https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/MS2025%20-%20Fiche%2032%20-%20Les%20bourses%20sur%20crit%C3%A8res%20sociaux%20%28BCS%29.pdf",
        date: "2025",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Cette fiche ne vise pas les bourses publiques sur critères sociaux du Crous, dont les critères officiels sont l'âge, la formation, les ressources, la composition familiale et l'éloignement. L'asymétrie porte sur des programmes ciblés femmes, souvent justifiés comme action positive dans des filières où elles sont sous-représentées: un homme ayant un profil scolaire, social ou financier comparable peut alors être exclu du dispositif par son sexe.",
  },
  {
    id: "hommes-esperance-vie-monde",
    side: "hommes",
    domain: "Santé",
    title: "Espérance de vie masculine plus courte dans presque tous les pays",
    metric: "quasi tous pays",
    summary:
      "Our World in Data suit l'écart d'espérance de vie à la naissance entre femmes et hommes: les femmes vivent plus longtemps que les hommes dans la quasi-totalité des pays documentés.",
    tags: ["santé", "mortalité", "monde", "sociétal"],
    source: {
      label: "Difference in female and male life expectancy at birth",
      publisher: "Our World in Data",
      url: "https://ourworldindata.org/grapher/difference-in-female-and-male-life-expectancy-at-birth",
      date: "données actualisées",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'écart reflète des facteurs biologiques, sociaux, professionnels et comportementaux. Il ne désigne pas une cause unique.",
  },
  {
    id: "hommes-suicide-monde",
    side: "hommes",
    domain: "Santé",
    title: "Hommes beaucoup plus exposés à la mort par suicide",
    metric: ">2x",
    summary:
      "L'OMS estime 727 000 décès par suicide en 2021. À l'échelle mondiale, les taux masculins sont plus de deux fois supérieurs aux taux féminins.",
    tags: ["santé", "suicide", "prévention", "monde"],
    source: {
      label: "Suicide worldwide in 2021: global health estimates",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/publications/i/item/9789240110069",
      date: "2021",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La prévention doit tenir compte du sexe mesuré par les sources sans réduire le suicide masculin à une seule explication culturelle ou individuelle.",
  },
  {
    id: "hommes-victimes-homicide-monde",
    side: "hommes",
    domain: "Violences",
    title: "Hommes majoritaires parmi les victimes d'homicide",
    metric: "80 %",
    summary:
      "En 2024, environ 80 % des victimes d'homicide dans le monde étaient des hommes ou des garçons. Les mêmes sources rappellent que les femmes et filles restent davantage exposées aux homicides commis dans la sphère intime ou familiale.",
    tags: ["violences", "sécurité", "homicide", "monde"],
    source: {
      label: "Femicides in 2024: global estimates of intimate partner/family member femicides",
      publisher: "UN Women / UNODC",
      url: "https://www.unwomen.org/sites/default/files/2025-11/femicides-in-2024-global-estimates-of-intimate-partner-family-member-femicides-en.pdf",
      date: "2024",
    },
    additionalSources: [
      {
        label: "137 women and girls killed every day by intimate partners or family members in 2024",
        publisher: "UNODC",
        url: "https://www.unodc.org/unodc/en/press/releases/2025/November/137-women-and-girls-killed-every-day-by-intimate-partners-or-family-members-in-2024.html",
        date: "25 novembre 2025",
      },
    ],
    confidence: "forte",
    lastChecked: "30 juin 2026",
    nuance:
      "Les profils de victimation diffèrent selon le contexte. Le brief 2024 d'UN Women et de l'UNODC indique qu'environ 11 % des homicides masculins sont attribués à un partenaire intime ou à un membre de la famille, contre près de 60 % des homicides de femmes et filles: l'asymétrie masculine est surtout documentée hors sphère intime.",
  },
  {
    id: "hommes-mortalite-travail-monde",
    side: "hommes",
    domain: "Travail",
    title: "Hommes davantage exposés à la mortalité liée au travail",
    metric: "51,4 vs 17,2",
    summary:
      "L'OIT estime près de 3 millions de décès liés au travail par an. La mortalité masculine atteint 51,4 pour 100 000 adultes en âge de travailler contre 17,2 chez les femmes.",
    tags: ["travail", "sécurité", "mortalité", "monde"],
    source: {
      label: "Nearly 3 million people die of work-related accidents and diseases",
      publisher: "Organisation internationale du Travail",
      url: "https://www.ilo.org/resource/news/nearly-3-million-people-die-work-related-accidents-and-diseases",
      date: "2023",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'écart tient notamment à la répartition sexuée des métiers dangereux et à l'exposition aux risques professionnels.",
  },
  {
    id: "hommes-accidents-route-monde",
    side: "hommes",
    domain: "Santé",
    title: "Hommes beaucoup plus exposés à la mortalité routière",
    metric: "3x",
    summary:
      "L'OMS indique que les hommes sont typiquement trois fois plus susceptibles que les femmes de mourir dans un accident de la route.",
    tags: ["santé", "sécurité", "route", "mortalité"],
    source: {
      label: "Road traffic injuries",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries",
      date: "2026",
    },
    confidence: "forte",
    lastChecked: "25 juin 2026",
    nuance:
      "Les comportements de conduite, les usages professionnels de la route et l'exposition kilométrique peuvent contribuer à l'écart.",
  },
  {
    id: "hommes-conscription",
    side: "hommes",
    domain: "Droits",
    title: "Service militaire obligatoire souvent ciblé sur les hommes",
    metric: "nombreux pays",
    summary:
      "De nombreux pays imposent encore un service militaire obligatoire visant surtout ou uniquement les hommes, avec des obligations civiques et militaires différenciées selon le sexe.",
    tags: ["droits", "conscription", "devoirs civiques", "international"],
    source: {
      label: "Countries with mandatory military service",
      publisher: "World Population Review",
      url: "https://worldpopulationreview.com/country-rankings/countries-with-mandatory-military-service",
      date: "2026",
    },
    confidence: "moyenne",
    lastChecked: "15 juin 2026",
    nuance:
      "Les règles varient fortement selon les pays, les exemptions et les situations de guerre. L'asymétrie juridique doit être vérifiée pays par pays.",
  },
  {
    id: "hommes-population-carcerale-monde",
    side: "hommes",
    domain: "Justice",
    title: "Hommes très majoritaires dans la population carcérale mondiale",
    metric: "94 %",
    summary:
      "L'UNODC estime qu'en 2023 les hommes représentaient presque 94 % de la population carcérale mondiale.",
    tags: ["justice", "prison", "monde", "droits"],
    source: {
      label: "Global Prison Population and Trends: A Focus on Rehabilitation",
      publisher: "UNODC",
      url: "https://www.unodc.org/documents/data-and-analysis/prison/Prison_brief_2025.pdf",
      date: "2023",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Ce chiffre ne dit pas à lui seul si les écarts viennent des comportements, du contrôle pénal, des normes sociales ou des décisions judiciaires.",
  },
  {
    id: "hommes-decrochage-garcons-monde",
    side: "hommes",
    domain: "Éducation",
    title: "Garçons massivement hors de l'école ou en redoublement",
    metric: "140 M",
    summary:
      "L'UNESCO estime que 140 millions de garçons sont hors de l'école dans le monde, contre 133 millions de filles. Elle souligne aussi que les garçons sont plus souvent à risque de redoublement, de non-progression et de non-achèvement dans de nombreux contextes.",
    tags: ["éducation", "jeunesse", "monde", "décrochage"],
    source: {
      label: "Boys' disengagement from education",
      publisher: "UNESCO",
      url: "https://www.unesco.org/en/gender-equality/education/boys",
      date: "consulté 2026",
    },
    additionalSources: [
      {
        label: "Gender equality and education",
        publisher: "UNESCO",
        url: "https://www.unesco.org/en/gender-equality/education",
        date: "consulté 2026",
      },
      {
        label:
          "What you need to know about UNESCO's global report on boys' disengagement in education",
        publisher: "UNESCO",
        url: "https://www.unesco.org/en/articles/what-you-need-know-about-unescos-global-report-boys-disengagement-education",
        date: "2022",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Le décrochage des garçons varie selon la pauvreté, le territoire, les conflits et les attentes sociales. Il ne contredit pas les obstacles spécifiques rencontrés par les filles ailleurs, notamment au primaire dans certains pays ou au secondaire dans des contextes de mariage précoce, pauvreté et insécurité.",
  },
  {
    id: "hommes-sans-abrisme",
    side: "hommes",
    domain: "Revenus",
    title: "Hommes plus souvent sans-abri dans la plupart des pays",
    metric: "majorité hommes",
    summary:
      "Our World in Data observe que dans la plupart des pays, les hommes sont plus susceptibles d'être sans-abri, dans beaucoup de pays, les femmes représentent 20 % à 40 % des personnes sans domicile.",
    tags: ["revenus", "logement", "précarité", "international"],
    source: {
      label: "Homelessness",
      publisher: "Our World in Data",
      url: "https://ourworldindata.org/homelessness",
      date: "données actualisées",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Les formes de sans-abrisme sont parfois moins visibles chez les femmes. La comparaison dépend fortement des définitions nationales.",
  },
  {
    id: "hommes-violence-partenaire-etats-unis",
    side: "hommes",
    domain: "Violences",
    title: "Hommes victimes de violence par partenaire intime",
    metric: "1 sur 3",
    summary:
      "Le CDC indique qu'environ un homme sur trois aux États-Unis a subi au cours de sa vie une violence sexuelle de contact, une violence physique ou du stalking par partenaire intime.",
    tags: ["violences", "partenaire intime", "santé", "États-Unis"],
    source: {
      label: "Intimate partner violence, sexual violence, and stalking among men",
      publisher: "CDC",
      url: "https://www.cdc.gov/intimate-partner-violence/about/intimate-partner-violence-sexual-violence-and-stalking-among-men.html",
      date: "données de vie entière",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Reconnaître les victimes masculines améliore l'accès à l'aide sans minimiser la gravité et la fréquence des violences subies par les femmes.",
  },
  {
    id: "hommes-violence-domestique-royaume-uni",
    side: "hommes",
    domain: "Violences",
    title: "Violence domestique au Royaume-Uni : victimes femmes et hommes",
    metric: "1,5 M vs 2,2 M",
    summary:
      "L'ONS estime à 1,5 million le nombre d'hommes et 2,2 millions le nombre de femmes victimes de violence domestique en Angleterre et au pays de Galles sur l'année se terminant en mars 2025, soit environ 1,5 femme victime pour 1 homme victime.",
    tags: ["femmes", "hommes", "violences", "violence domestique", "Royaume-Uni", "sécurité"],
    source: {
      label: "Domestic abuse victim characteristics, England and Wales",
      publisher: "Office for National Statistics",
      url: "https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice/articles/domesticabusevictimcharacteristicsenglandandwales/yearendingmarch2025",
      date: "2024/25",
    },
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Les hommes représentent environ 41 % des victimes annuelles estimées par l'ONS en 2024/25. Les enquêtes de victimation captent mieux une partie des violences non déclarées, mais le ratio brut ne décrit pas à lui seul la fréquence des violences répétées, la peur, le contrôle coercitif, les blessures ni l'accès aux services spécialisés.",
  },
  {
    id: "hommes-violences-conjugales-aides-specialisees",
    side: "hommes",
    domain: "Violences",
    title: "Hommes victimes orientés vers des aides moins spécialisées",
    metric: "4,4 % aidés",
    summary:
      "En France, une réponse ministérielle de 2025 confirme que le 3919 - Violences Femmes Info est dédié aux femmes, tandis que les hommes victimes sont orientés vers des dispositifs généralistes comme le 116 006 ou le 3039. Au Royaume-Uni, ManKind Initiative indique que les hommes représentent 41 % des victimes annuelles de violences domestiques dans les données ONS 2024/25, mais seulement 4,4 % des victimes accompagnées par les services locaux; l'association recense aussi 429 places de refuge ou hébergement sûr disponibles pour hommes en septembre 2025, dont 130 dédiées aux hommes. Au Canada, le refuge privé MASH d'Earl Silverman à Calgary a fermé en 2013 faute de financement public ou fédéral/provincial.",
    tags: ["violences conjugales", "aide aux victimes", "France", "Royaume-Uni", "Canada"],
    source: {
      label: "Ouverture du numéro 3919 aux hommes victimes de violences conjugales",
      publisher: "Assemblée nationale / Réponse ministérielle",
      url: "https://questions.assemblee-nationale.fr/dyn/17/questions/QANR5L17QE5235",
      date: "2025",
    },
    additionalSources: [
      {
        label: "116 006 - Numéro d'aide aux victimes",
        publisher: "Service-Public.fr",
        url: "https://lannuaire.service-public.gouv.fr/centres-contact/R167",
        date: "2025",
      },
      {
        label: "Site d'aide aux hommes victimes de violences conjugales",
        publisher: "SOS Hommes Battus France",
        url: "https://soshommesbattus.org/",
        date: "consulté 2026",
      },
      {
        label: "Statistics on Male Victims of Domestic Abuse",
        publisher: "ManKind Initiative",
        url: "https://mankind.org.uk/statistics/statistics-on-male-victims-of-domestic-abuse/",
        date: "2025",
      },
      {
        label: "Shelter for male victims of domestic abuse forced to close its doors",
        publisher: "CityNews Calgary",
        url: "https://calgary.citynews.ca/2013/03/21/shelter-for-male-victims-of-domestic-abuse-forced-to-close-its-doors/",
        date: "2013",
      },
      {
        label: "Domestic Violence (Police Response)",
        publisher: "Hansard / UK Parliament",
        url: "https://hansard.parliament.uk/commons/2014-04-10/debates/14041077000001/DomesticViolence%28PoliceResponse%29",
        date: "2014",
      },
      {
        label: "Erin Pizzey Excerpts - Domestic Violence Is Not A Gender Issue",
        publisher: "Sandra Orozco-Stapleton Foundation",
        url: "https://www.sossandra.org/erin-pizzey-excerpts",
        date: "2006",
      },
      {
        label: "The Respondent Episode 34: Erin Pizzey",
        publisher: "The Respondent",
        url: "https://www.therespondent.com/blogs/episodes/erin-pizzey",
        date: "consulté 2026",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "Le Royaume-Uni recense des places pour hommes et des lignes spécialisées existent. L'asymétrie documentée porte sur la rareté, la faible visibilité, le financement limité et le décalage entre la part d'hommes victimes et leur accès effectif aux services spécialisés. Les exemples Pizzey et Silverman sont des cas historiques de refuges masculins fragiles, pas une statistique mondiale exhaustive.",
  },
  {
    id: "hommes-agressions-sexuelles-minimisees",
    side: "hommes",
    angle: "récit_sur_le_sexe",
    domain: "Violences",
    title: "Hommes moins enclins à reconnaître certaines agressions sexuelles",
    metric: "48 % vs 60 %",
    summary:
      "Une enquête NSVRC/YouGov de 2017 indique que les hommes américains qualifient moins souvent que les femmes certaines conduites d'agression sexuelle: 48 % des hommes contre 60 % des femmes pour des remarques sexuelles non sollicitées, 67 % contre 79 % pour un rapport obtenu sous pression, et 56 % contre 72 % pour le voyeurisme. Des travaux sur les mythes du viol masculin montrent aussi que les hommes acceptent davantage ces mythes, surtout quand l'auteure est une femme.",
    tags: ["violences sexuelles", "consentement", "récit", "États-Unis"],
    source: {
      label: "New Data Reveals High Awareness Among U.S. Adults on What Constitutes Sexual Assault",
      publisher: "National Sexual Violence Resource Center / YouGov",
      url: "https://www.nsvrc.org/blog_post/new-data-reveals-high-awareness-among-us-adults-what-constitutes-sexual/",
      date: "2017",
    },
    additionalSources: [
      {
        label: "Acceptance of male rape myths among college men and women",
        publisher: "Sex Roles / Springer",
        url: "https://link.springer.com/article/10.1007/BF00290011",
        date: "1992",
      },
      {
        label: "Adult male victims of female-perpetrated sexual violence: Australian social media responses, myths and flipped expectations",
        publisher: "International Review of Victimology / SAGE",
        url: "https://journals.sagepub.com/doi/10.1177/02697580211048552",
        date: "2022",
      },
      {
        label: "Intimate partner violence, sexual violence, and stalking among men",
        publisher: "CDC",
        url: "https://www.cdc.gov/intimate-partner-violence/about/intimate-partner-violence-sexual-violence-and-stalking-among-men.html",
        date: "2024",
      },
      {
        label: "Understanding Male Socialization, Stigma, and Reactions to Sexual Violence",
        publisher: "National Sexual Violence Resource Center",
        url: "https://www.nsvrc.org/working-male-survivors-sexual-violence/understanding/",
        date: "consulté 2026",
      },
      {
        label: "Whom Would You Help? The Impact of Perpetrator and Victim Gender on Bystander Behavior During a Sexual Assault",
        publisher: "Violence Against Women / SAGE",
        url: "https://journals.sagepub.com/doi/10.1177/10778012241263104",
        date: "2024",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "L'enquête NSVRC mesure la reconnaissance de catégories d'agression sexuelle, pas l'acceptation d'un cas Instagram précis. Les sources portent sur une asymétrie de perception et de minimisation; elles ne mesurent ni toutes les situations de victimes masculines, ni la fréquence des agressions commises par des femmes.",
  },
  {
    id: "hommes-violences-sexuelles-sous-declaration",
    side: "hommes",
    domain: "Violences",
    title: "Hommes victimes de violences sexuelles très peu déclarées",
    metric: "16 %",
    summary:
      "Une étude américaine de 2024 utilisant les données NCVS 1992-2020 indique que seuls 16 % des hommes victimes de violences sexuelles ont signalé les faits aux forces de l'ordre. Au Canada, Justice Canada rapporte que 70 % des survivants masculins d'abus ou agressions sexuelles à l'âge adulte n'avaient pas signalé les faits, contre 59 % dans l'échantillon féminin. En Angleterre et au pays de Galles, Rape Crisis indique que 7 hommes violés sur 8 ne signalent pas les faits à la police, contre 5 femmes sur 6.",
    tags: ["violences sexuelles", "plainte", "sous-déclaration", "hommes"],
    source: {
      label: "Male Victims of Sexual Violence and Factors Associated With Reporting to Law Enforcement in the United States",
      publisher: "The Journal of Men's Studies / SAGE",
      url: "https://journals.sagepub.com/doi/abs/10.1177/10608265241249937",
      date: "2024",
    },
    additionalSources: [
      {
        label: "JustFacts - Sexual Assault",
        publisher: "Justice Canada",
        url: "https://www.justice.gc.ca/eng/rp-pr/jr/jf-pf/2019/apr01.html",
        date: "2019",
      },
      {
        label: "Rape, sexual assault and child sexual abuse statistics",
        publisher: "Rape Crisis England & Wales",
        url: "https://rapecrisis.org.uk/get-informed/statistics-sexual-violence/",
        date: "2025",
      },
      {
        label: "Understanding Male Socialization, Stigma, and Reactions to Sexual Violence",
        publisher: "National Sexual Violence Resource Center",
        url: "https://www.nsvrc.org/working-male-survivors-sexual-violence/understanding/",
        date: "consulté 2026",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "Les chiffres ne sont pas directement comparables à la fiche française sur les femmes: pays, périodes, définitions et enquêtes diffèrent. Ils montrent toutefois que la sous-déclaration masculine est massive et peut être plus forte, notamment à cause de la honte, des normes de virilité, du doute d'être cru et de la difficulté à nommer les faits comme violence sexuelle.",
  },
  {
    id: "hommes-viol-force-penetration-2018",
    side: "hommes",
    domain: "Justice",
    title: "Qualification du viol élargie aux victimes forcées à pénétrer",
    metric: "2018",
    summary:
      "Jusqu'au 6 août 2018, l'article 222-23 du Code pénal définissait le viol comme un acte de pénétration sexuelle commis sur la personne d'autrui. La loi du 3 août 2018 a ajouté les actes commis sur la personne de l'auteur, couvrant explicitement les situations où une victime est contrainte de pénétrer l'agresseur, configuration qui peut concerner notamment des hommes victimes d'une femme.",
    tags: ["violences sexuelles", "viol", "droit pénal", "France", "hommes"],
    source: {
      label: "Code pénal - Article 222-23, version antérieure à la loi du 3 août 2018",
      publisher: "Légifrance",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006417678/2002-01-01",
      date: "version en vigueur du 1er mars 1994 au 6 août 2018",
    },
    additionalSources: [
      {
        label: "LOI n° 2018-703 du 3 août 2018 renforçant la lutte contre les violences sexuelles et sexistes",
        publisher: "Légifrance",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000037284450",
        date: "3 août 2018",
      },
      {
        label: "Code pénal - Article 222-23, version issue de la loi du 3 août 2018",
        publisher: "Légifrance",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037289535/2018-08-06",
        date: "version en vigueur du 6 août 2018 au 23 avril 2021",
      },
      {
        label: "Code pénal - Article 222-23",
        publisher: "Légifrance",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000052535571",
        date: "version en vigueur depuis le 8 novembre 2025",
      },
      {
        label: "LOI n° 2006-399 du 4 avril 2006 renforçant la prévention et la répression des violences au sein du couple ou commises contre les mineurs",
        publisher: "Légifrance",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000422042",
        date: "4 avril 2006",
      },
    ],
    translations: {
      en: {
        title: "Rape qualification extended to victims forced to penetrate",
        summary:
          "Until 6 August 2018, Article 222-23 of the French Criminal Code defined rape as sexual penetration committed on another person's body. The Law of 3 August 2018 added acts committed on the perpetrator's body, explicitly covering situations in which a victim is forced to penetrate the perpetrator, a configuration that can notably concern male victims of a woman.",
        nuance:
          "Update tracked on 25 June 2026: this entry documents a legal qualification, not the prevalence of these cases. Before 2018, such acts could still fall under other sexual offences depending on the facts, but the rape definition was narrower. Marital rape follows a separate legal history and should not be confused with the 2018 extension.",
        sourcePopulation:
          "Population measured by the sources: French criminal law texts and versions of Article 222-23. The sources do not measure chromosomes.",
        tags: ["sexual violence", "rape", "criminal law", "France", "men"],
      },
    },
    confidence: "forte",
    lastChecked: "25 juin 2026",
    nuance:
      "Suivi ajouté le 25 juin 2026: cette fiche documente une qualification juridique, pas la fréquence de ces situations. Avant 2018, ces faits pouvaient relever d'autres infractions sexuelles selon les circonstances, mais la définition du viol était plus étroite. Le viol conjugal relève d'une chronologie juridique distincte et ne doit pas être confondu avec l'extension de 2018.",
  },
  {
    id: "hommes-mis-en-cause-violences-conjugales-france",
    side: "hommes",
    angle: "violence_exercée",
    domain: "Violences",
    title: "Hommes majoritaires parmi les mis en cause pour violences conjugales",
    metric: "85 %",
    summary:
      "En 2024, les services de sécurité ont enregistré 272 400 victimes de violences commises par partenaire ou ex-partenaire en France. Dans ces procédures, 85 % des personnes mises en cause sont des hommes.",
    tags: ["violences", "sécurité", "France", "conjugalité"],
    source: {
      label:
        "Violences conjugales enregistrées par les services de sécurité : quasi-stabilisation en 2024",
      publisher: "Ministère de l'Intérieur / SSMSI",
      url: "https://www.interieur.gouv.fr/actualites/communiques-de-presse/violences-conjugales-enregistrees-par-services-de-securite-quasi-stabilisation-en-2024",
      date: "23 octobre 2025",
    },
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La source porte sur les faits enregistrés et les mis en cause dans des procédures, pas sur l'ensemble des violences réellement commises. Cette fiche documente une asymétrie d'auteurs présumés, distincte des fiches sur les victimes.",
  },
  {
    id: "hommes-agresseurs-declares-violences-sexuelles-femmes-france",
    side: "hommes",
    angle: "violence_exercée",
    domain: "Violences",
    title: "Hommes quasi exclusifs parmi les agresseurs déclarés par les femmes victimes de violences sexuelles",
    metric: "99 %",
    summary:
      "Selon l'enquête VRS 2024 du SSMSI, 277 000 femmes majeures ont déclaré avoir été victimes de viols, tentatives de viol ou agressions sexuelles en 2023. Parmi les femmes victimes ayant renseigné cette information, 99 % déclarent que le ou les agresseurs étaient exclusivement de sexe masculin.",
    tags: ["violences sexuelles", "viols", "France", "violence exercée par les hommes sur les femmes"],
    source: {
      label: "Les violences sexistes et sexuelles en France en 2024",
      publisher: "Arrêtons les violences / SSMSI",
      url: "https://arretonslesviolences.gouv.fr/sites/default/files/2025-11/Lettre-violences-sexistes-et-sexuelles-novembre-2025.pdf",
      date: "novembre 2025",
    },
    additionalSources: [
      {
        label: "Mettre fin au déni et à l'impunité face aux viols et agressions sexuelles",
        publisher: "Haut Conseil à l'Égalité",
        url: "https://www.haut-conseil-egalite.gouv.fr/rapport-mettre-fin-au-deni-et-limpunite-face-aux-viols-et-agressions-sexuelles",
        date: "2025",
      },
    ],
    translations: {
      en: {
        title:
          "Men are almost exclusive among perpetrators reported by women victims of sexual violence",
        summary:
          "According to the SSMSI 2024 VRS survey, 277,000 adult women reported having been victims of rape, attempted rape or sexual assault in 2023. Among women victims who provided this information, 99% reported that the perpetrator or perpetrators were exclusively male.",
        nuance:
          "The main figure comes from a victimization survey and is based on statements by victims who reported the sex of the perpetrator. It covers rape, attempted rape and sexual assault reported by adult women; it does not measure all acts actually committed nor the chromosomes of perpetrators.",
        sourcePopulation:
          "Population measured by the source: women victims of rape, attempted rape or sexual assault who reported the sex of the perpetrator or perpetrators in the SSMSI 2024 VRS survey. The source does not measure chromosomes.",
        tags: ["sexual violence", "rape", "France", "violence perpetrated by men against women"],
      },
    },
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La donnée principale vient d'une enquête de victimation et repose sur les déclarations des victimes ayant renseigné le sexe de l'agresseur. Elle porte sur les viols, tentatives de viol et agressions sexuelles déclarés par des femmes majeures; elle ne mesure pas tous les faits réellement commis ni les chromosomes des auteurs.",
  },
  {
    id: "hommes-sexisme-hostile-hce-2025",
    side: "hommes",
    angle: "récit_sur_le_sexe",
    domain: "Droits",
    title: "Adhésion au sexisme hostile envers les femmes plus fréquente chez les hommes",
    metric: "23 % vs 12 %",
    summary:
      "Dans le baromètre HCE/Toluna Harris administré du 13 au 21 novembre 2025, l'analyse HCE-LAPSCO estime que 17 % des personnes de 15 ans et plus sont favorables au sexisme hostile. Cette adhésion concerne 23 % des hommes sondés et 12 % des femmes sondées, soit environ six millions d'hommes et trois millions et demi de femmes en France.",
    tags: ["sexisme", "stéréotypes", "France", "HCE", "opinion"],
    source: {
      label: "Note complète HCE-CNRS - Annexe Rapport Sexisme",
      publisher: "Haut Conseil à l'Égalité / LAPSCO-CNRS",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-03/Note%20comple%CC%80te%20HCE-CNRS%20Annexe%20Rapport%20Sexisme.pdf",
      date: "données novembre 2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Rapport 2026 sur l'état des lieux du sexisme en France : la menace masculiniste",
        publisher: "Haut Conseil à l'Égalité",
        url: "https://www.haut-conseil-egalite.gouv.fr/rapport-2026-sur-letat-des-lieux-du-sexisme-en-france-la-menace-masculiniste",
        date: "21 janvier 2026",
      },
      {
        label: "Baromètre Sexisme - Vague 5",
        publisher: "Toluna Harris Interactive / DGCS / HCE",
        url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/Rapport%20Toluna%20Harris%20-%20Barom%C3%A8tre%20sexisme%20Vague%205%20-%202025%20%28DGCS%20-%20HCE%29.pdf",
        date: "novembre 2025",
      },
      {
        label: "Baromètre Sexisme 2026 - données brutes",
        publisher: "data.gouv.fr / Haut Conseil à l'Égalité",
        url: "https://www.data.gouv.fr/datasets/barometre-sexisme-2026-1",
        date: "10 mars 2026",
      },
    ],
    translations: {
      en: {
        title: "Endorsement of hostile sexism toward women is more frequent among men",
        summary:
          "In the HCE/Toluna Harris survey conducted from 13 to 21 November 2025, the HCE-LAPSCO analysis estimates that 17% of people aged 15 and over are favourable to hostile sexism. This endorsement concerns 23% of surveyed men and 12% of surveyed women, corresponding to around six million men and three and a half million women in France.",
        nuance:
          "In this source, hostile sexism refers to negative, contemptuous or aggressive attitudes toward women. The indicator measures endorsement of opinion items in a representative survey; it does not measure hostile acts committed by each person, hostility toward men, anti-male statements by feminist actors, or parliamentary rhetoric. Women also endorse these items, but the measured level is higher among men. A symmetrical assessment of misandry or stigmatizing discourse toward all men would require other items and other sources.",
        sourcePopulation:
          "Population measured by the source: people aged 15 and over in France, with a men/women comparison in the November 2025 HCE/Toluna Harris survey. The source does not measure chromosomes.",
        tags: ["sexism", "stereotypes", "France", "HCE", "opinion"],
      },
    },
    confidence: "forte",
    lastChecked: "22 juin 2026",
    nuance:
      "Dans cette source, le sexisme hostile désigne des attitudes négatives, méprisantes ou agressives envers les femmes. L'indicateur mesure l'accord avec des items d'opinion dans un échantillon représentatif; il ne mesure pas des actes hostiles commis par chaque personne, l'hostilité envers les hommes, les propos anti-hommes de certains acteurs féministes, ni la rhétorique parlementaire. Des femmes adhèrent aussi à ces items, mais le niveau mesuré est plus élevé chez les hommes. Une mesure symétrique de la misandrie ou des discours stigmatisant tous les hommes nécessiterait d'autres items et d'autres sources.",
  },
  {
    id: "hommes-femmes-sexisme-paternaliste-hce-2025",
    side: "hommes",
    angle: "récit_sur_le_sexe",
    domain: "Droits",
    title: "Sexisme paternaliste mesuré chez les deux sexes, plus souvent chez les hommes",
    metric: "27 % vs 18 %",
    summary:
      "Dans le même baromètre HCE/Toluna Harris de novembre 2025, 23 % des personnes interrogées sont favorables au sexisme paternaliste. Il est mesuré chez 27 % des hommes sondés et 18 % des femmes sondées, soit environ 7,5 millions d'hommes et 5 millions de femmes en France.",
    tags: ["sexisme", "stéréotypes", "France", "HCE", "opinion"],
    source: {
      label: "Note complète HCE-CNRS - Annexe Rapport Sexisme",
      publisher: "Haut Conseil à l'Égalité / LAPSCO-CNRS",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-03/Note%20comple%CC%80te%20HCE-CNRS%20Annexe%20Rapport%20Sexisme.pdf",
      date: "données novembre 2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Rapport 2026 sur l'état des lieux du sexisme en France : la menace masculiniste",
        publisher: "Haut Conseil à l'Égalité",
        url: "https://www.haut-conseil-egalite.gouv.fr/rapport-2026-sur-letat-des-lieux-du-sexisme-en-france-la-menace-masculiniste",
        date: "21 janvier 2026",
      },
      {
        label: "Baromètre Sexisme - Vague 5",
        publisher: "Toluna Harris Interactive / DGCS / HCE",
        url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/Rapport%20Toluna%20Harris%20-%20Barom%C3%A8tre%20sexisme%20Vague%205%20-%202025%20%28DGCS%20-%20HCE%29.pdf",
        date: "novembre 2025",
      },
      {
        label: "Baromètre Sexisme 2026 - données brutes",
        publisher: "data.gouv.fr / Haut Conseil à l'Égalité",
        url: "https://www.data.gouv.fr/datasets/barometre-sexisme-2026-1",
        date: "10 mars 2026",
      },
    ],
    translations: {
      en: {
        title: "Paternalistic sexism is measured in both sexes, more often among men",
        summary:
          "In the same November 2025 HCE/Toluna Harris survey, 23% of respondents are favourable to paternalistic sexism. It is measured among 27% of surveyed men and 18% of surveyed women, corresponding to around 7.5 million men and 5 million women in France.",
        nuance:
          "This entry does not present paternalistic sexism as a property of one sex. It describes a frequency asymmetry in the survey: men are higher in proportion and in estimated volume, while a measurable share of women also endorse these norms. The source measures opinions, not individual behaviour or causality.",
        sourcePopulation:
          "Population measured by the source: people aged 15 and over in France, with a men/women comparison in the November 2025 HCE/Toluna Harris survey. The source does not measure chromosomes.",
        tags: ["sexism", "stereotypes", "France", "HCE", "opinion"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "Cette fiche ne présente pas le sexisme paternaliste comme une caractéristique d'un sexe. Elle décrit une asymétrie de fréquence dans l'enquête: les hommes sont plus nombreux en proportion et en volume estimé, tandis qu'une part mesurable de femmes adhère aussi à ces normes. La source mesure des opinions, pas des comportements individuels ni une causalité.",
  },
  {
    id: "hommes-consentement-rapports-sexuels-hce-2025",
    side: "hommes",
    angle: "violence_exercée",
    domain: "Violences",
    title: "Consentement sexuel : écarts entre désapprobation et situations déclarées",
    metric: "26 % / 24 %",
    summary:
      "Le rapport HCE 2026, à partir du baromètre administré en novembre 2025, indique que 26 % des hommes déclarent avoir déjà douté du consentement de leur partenaire. Il relève aussi que 24 % des hommes considèrent normal qu'une femme accepte un rapport sexuel par devoir ou pour faire plaisir, 17 % qu'une femme peut être convaincue après avoir dit non, et 15 % qu'une femme agressée sexuellement peut être en partie responsable de sa situation.",
    tags: ["consentement", "violences sexuelles", "France", "HCE", "opinion"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données novembre 2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Baromètre Sexisme - Vague 5",
        publisher: "Toluna Harris Interactive / DGCS / HCE",
        url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/Rapport%20Toluna%20Harris%20-%20Barom%C3%A8tre%20sexisme%20Vague%205%20-%202025%20%28DGCS%20-%20HCE%29.pdf",
        date: "novembre 2025",
      },
      {
        label: "Baromètre Sexisme 2026 - données brutes",
        publisher: "data.gouv.fr / Haut Conseil à l'Égalité",
        url: "https://www.data.gouv.fr/datasets/barometre-sexisme-2026-1",
        date: "10 mars 2026",
      },
    ],
    translations: {
      en: {
        title: "Sexual consent: gaps between disapproval and reported situations",
        summary:
          "The HCE 2026 report, based on the survey conducted in November 2025, states that 26% of men say they have already doubted their partner's consent. It also notes that 24% of men consider it normal for a woman to accept sex out of duty or to please her partner, 17% think a woman can be convinced after saying no, and 15% think a sexually assaulted woman can be partly responsible for her situation.",
        nuance:
          "The entry combines several survey items: some are self-reported situations and others are opinions. It does not describe all men, does not measure actual offences, and does not establish individual causality. The source uses survey categories for men and women and does not measure chromosomes.",
        sourcePopulation:
          "Population measured by the source: men surveyed in France in the November 2025 HCE/Toluna Harris barometer. The source does not measure chromosomes.",
        tags: ["consent", "sexual violence", "France", "HCE", "opinion"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "La fiche regroupe plusieurs items du baromètre: certains portent sur des situations déclarées, d'autres sur des opinions. Elle ne décrit pas tous les hommes, ne mesure pas les infractions réellement commises et n'établit pas une causalité individuelle. La source utilise les catégories d'enquête hommes/femmes et ne mesure pas les chromosomes.",
  },
  {
    id: "hommes-recits-antifeministes-hce-2025",
    side: "hommes",
    angle: "récit_sur_le_sexe",
    domain: "Droits",
    title: "Récits antiféministes plus déclarés chez les hommes",
    metric: "60 %",
    summary:
      "Dans le baromètre cité par le HCE, 60 % des hommes pensent que les féministes veulent que les femmes aient plus de pouvoir que les hommes, et 60 % estiment que les féministes ont des demandes exagérées envers les hommes. Le rapport indique aussi que 39 % des hommes, contre 25 % des femmes, estiment que le féminisme menace la place et le rôle des hommes dans la société.",
    tags: ["féminisme", "masculinisme", "opinion", "France", "HCE"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données novembre 2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Baromètre Sexisme - Vague 5",
        publisher: "Toluna Harris Interactive / DGCS / HCE",
        url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/Rapport%20Toluna%20Harris%20-%20Barom%C3%A8tre%20sexisme%20Vague%205%20-%202025%20%28DGCS%20-%20HCE%29.pdf",
        date: "novembre 2025",
      },
    ],
    translations: {
      en: {
        title: "Anti-feminist narratives are reported more often among men",
        summary:
          "In the barometer cited by the HCE, 60% of men think feminists want women to have more power than men, and 60% think feminists make excessive demands on men. The report also states that 39% of men, compared with 25% of women, think feminism threatens men's place and role in society.",
        nuance:
          "These figures measure agreement with opinion statements, not membership in a movement or intent. The comparison also shows that some women endorse the same statements, while the level measured among men is higher.",
        sourcePopulation:
          "Population measured by the source: people surveyed in France in the November 2025 HCE/Toluna Harris barometer, with several items reported for men and one men/women comparison. The source does not measure chromosomes.",
        tags: ["feminism", "masculinism", "opinion", "France", "HCE"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "Ces chiffres mesurent l'accord avec des affirmations d'opinion, pas l'appartenance à un mouvement ni une intention individuelle. La comparaison indique aussi qu'une partie des femmes adhère à certaines formulations, avec un niveau mesuré plus élevé chez les hommes.",
  },
  {
    id: "hommes-vocabulaire-masculinisme-pejoratif",
    side: "hommes",
    angle: "récit_sur_le_sexe",
    domain: "Droits",
    title: "Défense des hommes : pas de terme neutre stabilisé",
    metric: "mot manquant",
    summary:
      "Les sources lexicographiques et institutionnelles consultées ne donnent pas au masculinisme un statut symétrique au féminisme. Le féminisme est couramment défini par les droits ou l'égalité des femmes, notamment face aux violences et injustices qui les concernent, ce qui donne au mot un cadrage public plutôt légitimant. Il manque en revanche un terme français aussi stabilisé pour désigner les personnes, hommes ou femmes, qui défendent factuellement les hommes face aux injustices ou asymétries défavorables aux hommes sans rabaisser les femmes. Larousse, Le Robert, l'Académie française, le HCE et le Sénat rattachent surtout le masculinisme à des usages antiféministes, sexistes, réactionnels, virilistes ou misogynes, tandis que l'OQLF propose une définition plus large mais précise que le mot reste péjoratif.",
    tags: ["vocabulaire", "masculinisme", "féminisme", "dictionnaires", "représentations"],
    source: {
      label: "Grand dictionnaire terminologique - masculinisme",
      publisher: "Office québécois de la langue française / Grand dictionnaire terminologique",
      url: "https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/8396389/masculinisme",
      date: "2020",
    },
    additionalSources: [
      {
        label: "Définitions : masculinisme",
        publisher: "Larousse",
        url: "https://www.larousse.fr/dictionnaires/francais/masculinisme/49698",
        date: "consulté le 25 juin 2026",
      },
      {
        label: "Définition Le Robert : masculinisme",
        publisher: "Le Robert",
        url: "https://dictionnaire.lerobert.com/definition/masculinisme",
        date: "consulté le 25 juin 2026",
      },
      {
        label: "Dictionnaire de l'Académie française - masculinisme",
        publisher: "Académie française, 10e édition",
        url: "https://www.dictionnaire-academie.fr/article/B0M00085",
        date: "publié en juin 2026",
      },
      {
        label: "Rapport 2026 sur l'état des lieux du sexisme en France : la menace masculiniste",
        publisher: "Haut Conseil à l'Égalité",
        url: "https://www.haut-conseil-egalite.gouv.fr/rapport-2026-sur-letat-des-lieux-du-sexisme-en-france-la-menace-masculiniste",
        date: "21 janvier 2026",
      },
      {
        label: "Mascus : la nouvelle offensive contre les femmes",
        publisher: "Sénat, Délégation aux droits des femmes",
        url: "https://www.senat.fr/rap/r25-776-1/r25-776-1_mono.html",
        date: "23 juin 2026",
      },
      {
        label: "Définitions : féminisme",
        publisher: "Larousse",
        url: "https://www.larousse.fr/dictionnaires/francais/f%C3%A9minisme/33213",
        date: "consulté le 25 juin 2026",
      },
      {
        label: "Dictionnaire de l'Académie française - féminisme",
        publisher: "Académie française, 9e édition",
        url: "https://www.dictionnaire-academie.fr/article/A9F0434",
        date: "consulté le 25 juin 2026",
      },
      {
        label: "Définitions : misogyne",
        publisher: "Larousse",
        url: "https://www.larousse.fr/dictionnaires/francais/misogyne/51773",
        date: "consulté le 25 juin 2026",
      },
      {
        label: "Définitions : misandre",
        publisher: "Larousse",
        url: "https://www.larousse.fr/dictionnaires/francais/misandre/51743",
        date: "consulté le 25 juin 2026",
      },
      {
        label: "It’s time to revolutionise parental leave – for women, for families, for our future",
        publisher: "The Fawcett Society",
        url: "https://www.fawcettsociety.org.uk/blog/its-time-to-revolutionise-parental-leave-for-women-for-families-for-our-future",
        date: "2025",
      },
      {
        label: "Maternity, paternity and parental leave: Briefing for a new government",
        publisher: "Women's Budget Group",
        url: "https://www.wbg.org.uk/publication/maternity-paternity-and-parental-leave-briefing-for-a-new-government/",
        date: "17 juin 2024",
      },
      {
        label: "State of the World's Fathers",
        publisher: "Equimundo / MenCare",
        url: "https://www.equimundo.org/state-of-the-worlds-fathers-research/",
        date: "consulté le 25 juin 2026",
      },
      {
        label: "Alliance internationale MenEngage - page d'accueil",
        publisher: "MenEngage Alliance",
        url: "https://menengage.org/",
        date: "consulté le 25 juin 2026",
      },
    ],
    translations: {
      en: {
        title: "Defending men lacks a stabilized neutral term",
        summary:
          "The lexicographic and institutional sources consulted do not give masculinism a symmetrical status to feminism. Feminism is commonly defined through women's rights or equality, especially in relation to violence and injustices affecting women, which gives the word a broadly legitimating public framing. There is still no equally stabilized neutral French term for people, men or women, who factually defend men against injustices or asymmetries disadvantaging men without belittling women. Larousse, Le Robert, the Académie française, the HCE and the Senate mostly connect masculinism to anti-feminist, sexist, reactionary, virilist or misogynistic uses, while the OQLF gives a broader definition but notes that the word remains pejorative.",
        nuance:
          "This entry documents dictionary and terminology definitions, public reports by the HCE and the French Senate, plus a few examples of feminist or pro-feminist advocacy on fathers' leave and care. It does not measure the whole history of male advocacy groups, feminist movements, or every use of these words. Terminological marker used here: feminism = action against asymmetries disadvantaging girls and women; masculinism = action against asymmetries disadvantaging boys and men; misandry = hatred or contempt of men; misogyny = hatred or contempt of women. One should therefore avoid confusing feminism with misandry, or masculinism with misogyny. A claim focused on one sex is not automatically hatred of the other; the analysis changes when the discourse belittles, dehumanizes or seeks to remove rights. A dictionary definition centred on equality does not prove that all feminist spaces treat male-specific disadvantages symmetrically; a pejorative definition of masculinism does not prove that every defence of male vulnerabilities is misogynistic.",
        sourcePopulation:
          "Population measured by the sources: dictionary and terminology entries for the French words masculinisme, féminisme, misogyne and misandre, 2026 public reports by the HCE and the French Senate on institutional uses of masculinisme, plus public positions by feminist or pro-feminist organizations on fathers, parental leave and care. These sources do not measure chromosomes.",
        tags: ["vocabulary", "masculinism", "feminism", "dictionaries", "representations"],
      },
    },
    confidence: "forte",
    lastChecked: "5 juillet 2026",
    nuance:
      "Cette fiche documente des définitions de dictionnaires et de terminologie, les rapports publics 2026 du HCE et du Sénat, ainsi que quelques exemples d'acteurs féministes ou pro-féministes mobilisés sur le congé des pères et le soin. Elle ne mesure pas toute l'histoire des groupes de défense des hommes, des mouvements féministes ni tous les usages de ces mots. Repère terminologique utilisé ici : féminisme = combat contre les asymétries en défaveur des filles et des femmes; masculinisme = combat contre les asymétries en défaveur des garçons et des hommes; misandrie = haine ou mépris des hommes; misogynie = haine ou mépris des femmes. Il faut donc éviter de confondre féminisme avec misandrie, ou masculinisme avec misogynie. Une revendication centrée sur un sexe ne relève pas automatiquement de la haine de l'autre; l'analyse change quand le discours rabaisse, déshumanise ou vise le retrait de droits. Une définition du féminisme centrée sur l'égalité ne prouve pas que tous les espaces féministes traitent symétriquement les désavantages masculins; une définition péjorative du masculinisme ne prouve pas que toute défense des vulnérabilités masculines soit misogyne.",
  },
  {
    id: "hommes-perception-garde-enfants-hce-2025",
    side: "hommes",
    angle: "récit_sur_le_sexe",
    domain: "Justice",
    title: "Garde des enfants : perception d'un avantage aux mères et demandes des pères",
    metric: "64 % vs 48 %",
    summary:
      "Le rapport HCE indique que 64 % des hommes et 48 % des femmes estiment que les femmes sont avantagées par la justice pour obtenir la garde des enfants. Il met ce résultat en regard d'une étude du ministère de la Justice selon laquelle, parmi les demandes exprimées par les pères dans le cadre étudié, 58 % demandent une résidence principale chez la mère, 19 % une résidence alternée et 15 % une résidence principale chez eux; 93 % des demandes des pères ont été satisfaites.",
    tags: ["justice", "famille", "garde des enfants", "opinion", "France"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données novembre 2025, publication 2026",
    },
    additionalSources: [
      {
        label: "La résidence des enfants de parents séparés : de la demande des parents à la décision du juge",
        publisher: "Ministère de la Justice",
        url: "https://www.justice.gouv.fr/documentation/ressources/residence-enfants-parents-separes",
        date: "2013",
      },
    ],
    translations: {
      en: {
        title: "Child residence: perception of an advantage for mothers and fathers' requests",
        summary:
          "The HCE report states that 64% of men and 48% of women think women are advantaged by courts in obtaining child residence. It compares this with a Ministry of Justice study indicating that, among fathers' requests in the studied scope, 58% asked for the child's main residence to be with the mother, 19% for alternating residence and 15% for main residence with the father; 93% of fathers' requests were granted.",
        nuance:
          "The first figure is an opinion measure, while the second concerns a specific set of court-related requests and decisions. It does not settle every custody dispute and does not by itself measure all informal arrangements, negotiation pressures or family constraints before a court decision.",
        sourcePopulation:
          "Population measured by the sources: people surveyed in France on perceptions of family justice, and fathers' requests studied by the French Ministry of Justice. The sources do not measure chromosomes.",
        tags: ["justice", "family", "child residence", "opinion", "France"],
      },
    },
    confidence: "moyenne",
    lastChecked: "21 juin 2026",
    nuance:
      "Le premier chiffre est une mesure d'opinion, tandis que le second porte sur un ensemble précis de demandes et décisions judiciaires. Il ne tranche pas tous les conflits de garde et ne mesure pas à lui seul les arrangements informels, les pressions de négociation ou les contraintes familiales avant décision.",
  },
  {
    id: "hommes-attribution-laxisme-justice-violences-sexuelles",
    side: "hommes",
    angle: "récit_sur_le_sexe",
    domain: "Justice",
    title: "Violences sexuelles : le 'laxisme judiciaire' n'est pas imputable aux hommes",
    metric: "70 % / 63 %",
    summary:
      "En 2024, les femmes représentent 70 % des juges professionnels et 63 % des procureurs; le personnel des tribunaux et parquets est féminin à 81 %. Les greffiers et directeurs des services de greffe étaient féminisés à 88 % au 1er janvier 2018. Ces chiffres contredisent l'idée qu'un éventuel 'laxisme judiciaire' en matière de violences sexuelles serait mécaniquement décidé par un corps judiciaire masculin.",
    tags: ["justice", "violences sexuelles", "magistrats", "greffiers", "France"],
    source: {
      label: "Références Statistiques Justice 2025 - Les moyens et personnels de la justice",
      publisher: "Ministère de la Justice / SSER",
      url: "https://www.justice.gouv.fr/sites/default/files/2026-01/RSJ2025%20chapitre%201.pdf",
      date: "données 2024, publication 2026",
    },
    additionalSources: [
      {
        label: "Les greffiers et directeurs des services de greffes, des corps professionnels de la justice féminisés",
        publisher: "Ministère de la Justice / Infostat Justice",
        url: "https://www.justice.gouv.fr/documentation/etudes-et-statistiques/greffiers-directeurs-services-greffes-corps-professionnels-justice-feminises",
        date: "2019, mis à jour le 26 juillet 2024",
      },
      {
        label: "Références Statistiques Justice 2025 - Les violences sexuelles",
        publisher: "Ministère de la Justice / SSER",
        url: "https://www.justice.gouv.fr/sites/default/files/2026-01/RSJ2025%20chapitre%2014.pdf",
        date: "données 2024, publication 2026",
      },
      {
        label: "Les personnels de greffe",
        publisher: "Ministère de la Justice",
        url: "https://www.justice.gouv.fr/justice-france/acteurs-justice/personnels-greffe",
        date: "2022, mis à jour",
      },
    ],
    translations: {
      en: {
        title: "Sexual violence: alleged judicial leniency cannot be attributed to men",
        summary:
          "In 2024, women represented 70% of professional judges and 63% of prosecutors; court and prosecution office staff were 81% female. Clerks and court registry directors were 88% female on 1 January 2018. These figures contradict the idea that alleged judicial leniency in sexual violence cases is mechanically decided by a male judiciary.",
        nuance:
          "The data does not prove the opposite claim, that women are responsible for leniency. Registry staff do not decide guilt or sentencing, and sexual-violence cases move through police investigation, prosecution, instruction, evidentiary constraints, legal qualification, hearings and possible appeals. The point is narrower: blaming 'men in justice' as a group is not supported by the workforce composition data.",
        sourcePopulation:
          "Population measured by the sources: professional judges, prosecutors, court and prosecution office staff, clerks and registry directors in French justice statistics. The sources do not measure chromosomes.",
        tags: ["justice", "sexual violence", "judges", "clerks", "France"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "La donnée ne prouve pas l'argument inverse, selon lequel les femmes seraient responsables du laxisme. Les greffiers ne décident ni de la culpabilité ni de la peine, et les affaires de violences sexuelles passent par l'enquête, le parquet, parfois l'instruction, les contraintes de preuve, la qualification juridique, l'audience et les voies de recours. Le point est plus limité: attribuer la réponse judiciaire à des 'hommes de justice' comme groupe n'est pas étayé par la composition sexuée des effectifs.",
  },
  {
    id: "hommes-sanctions-penales-plus-lourdes",
    side: "hommes",
    domain: "Justice",
    title: "Hommes plus exposés aux sanctions pénales lourdes",
    metric: "41 % vs 18 %",
    summary:
      "En France, le ministère de la Justice indique que, pour les vols et recels entre 2018 et 2022, 41 % des hommes condamnés reçoivent une peine d'emprisonnement ferme ou partiellement ferme, contre 18 % des femmes condamnées pour le même type d'infractions. L'Insee conclut aussi que les femmes condamnées bénéficient de sanctions moins lourdes, et que les écarts ne disparaissent pas totalement après prise en compte du nombre d'infractions et des antécédents pour les atteintes aux biens ou aux personnes. Aux États-Unis, une étude sur les affaires fédérales estime qu'à infraction d'arrestation, antécédents et autres observables comparables, les hommes reçoivent en moyenne des peines 63 % plus longues que les femmes.",
    tags: ["justice", "peines", "prison", "France", "États-Unis"],
    source: {
      label: "Femmes et hommes devant la justice pénale",
      publisher: "Ministère de la Justice / SSER",
      url: "https://www.justice.gouv.fr/sites/default/files/2024-03/INFO%20RAPIDE%20JUSTICE-13.pdf",
      date: "2024",
    },
    additionalSources: [
      {
        label: "Un traitement judiciaire différent entre femmes et hommes délinquants",
        publisher: "Insee",
        url: "https://www.insee.fr/fr/statistiques/2586464?sommaire=2586548",
        date: "2017",
      },
      {
        label: "Estimating Gender Disparities in Federal Criminal Cases",
        publisher: "University of Michigan Law School",
        url: "https://repository.law.umich.edu/law_econ_current/57/",
        date: "2012",
      },
      {
        label: "2017 Demographic Differences in Federal Sentencing",
        publisher: "United States Sentencing Commission",
        url: "https://www.ussc.gov/research/research-reports/2017-demographic-differences-federal-sentencing",
        date: "2017",
      },
      {
        label: "Les logiques genrées des sanctions pénales",
        publisher: "INED",
        url: "https://www.ined.fr/fr/actualites/logiques-genrees-sanctions-penales",
        date: "2026",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "Cette fiche ne prouve pas une règle universelle mondiale. Pour parler de 'même délit', il faut contrôler la gravité exacte, le rôle dans l'affaire, la récidive, les antécédents, la situation pré-procès et les éléments de personnalité pris en compte par le juge. Les sources françaises et américaines documentent néanmoins une asymétrie robuste sur la prison et la sévérité des peines; l'INED note aussi que les femmes peuvent recevoir des amendes plus élevées lorsqu'elles sont condamnées à l'amende.",
  },
  {
    id: "hommes-conge-paternite-ocde",
    side: "hommes",
    domain: "Famille",
    title: "Pères limités par un congé paternité payé très court",
    metric: "2,4 sem.",
    summary:
      "Dans l'Organisation de coopération et de développement économiques (OCDE), le congé paternité payé reste court: la moyenne est d'environ 2,4 semaines en 2024.",
    tags: ["famille", "paternité", "travail", "OCDE"],
    source: {
      label: "Paid leave for fathers",
      publisher: "OCDE - Organisation de coopération et de développement économiques",
      url: "https://www.oecd.org/en/publications/paid-leave-for-fathers_07442bed-en/full-report.html",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Des congés plus longs et mieux indemnisés peuvent soutenir la coparentalité, mais leur usage dépend aussi des normes professionnelles et familiales.",
  },
  {
    id: "hommes-autonomie-corporelle-circoncision",
    side: "hommes",
    domain: "Autonomie",
    title: "Circoncision des garçons décidée avant leur consentement",
    metric: "36,7-38,7 %",
    summary:
      "Une étude PLOS One estime la prévalence mondiale de la circoncision masculine autour de 36,7 % à 38,7 %, souvent pour des raisons religieuses ou culturelles.",
    tags: ["autonomie corporelle", "santé", "religieux", "enfance"],
    source: {
      label: "Global prevalence of male circumcision",
      publisher: "PLOS One",
      url: "https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0298387",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le sujet implique santé publique, religion, consentement et droits de l'enfant. Les sources documentent un enjeu d'autonomie corporelle sans mesurer les motivations familiales au cas par cas.",
  },
  {
    id: "hommes-deces-professionnels-etats-unis-2024",
    side: "hommes",
    domain: "Travail",
    title: "Hommes très majoritaires parmi les décès professionnels aux États-Unis",
    metric: "91,9 %",
    summary:
      "Aux États-Unis, les femmes représentent 8,1 % des décès professionnels recensés en 2024, soit environ 91,9 % pour les hommes. Le risque global a fortement baissé depuis les années 1970, mais l'asymétrie masculine persiste.",
    tags: ["travail", "sécurité", "États-Unis", "mortalité"],
    source: {
      label: "National Census of Fatal Occupational Injuries in 2024",
      publisher: "BLS",
      url: "https://www.bls.gov/news.release/cfoi.nr0.htm",
      date: "2024",
    },
    additionalSources: [
      {
        label: "Commonly Used Statistics",
        publisher: "OSHA",
        url: "https://www.osha.gov/data/commonstats",
        date: "2026",
      },
    ],
    confidence: "forte",
    lastChecked: "30 juin 2026",
    nuance:
      "Dans les pays industrialisés, prévention, mécanisation et droit du travail ont réduit le risque depuis 1970. Les données récentes montrent néanmoins une surreprésentation masculine dans les accidents mortels au travail.",
  },
  {
    id: "hommes-ukraine-restrictions-sortie-2022-2025",
    side: "hommes",
    domain: "Conflits",
    title: "Hommes ukrainiens d'âge militaire limités à la frontière",
    metric: "18-60 ans",
    summary:
      "Après l'invasion russe du 24 février 2022, la loi martiale ukrainienne a fortement limité la sortie du territoire des hommes citoyens ukrainiens d'âge militaire, avec exceptions. En août 2025, la règle a été assouplie pour les 18-22 ans.",
    tags: ["conflits", "Ukraine", "conscription", "mobilité"],
    source: {
      label: "Labour-market integration of beneficiaries of temporary protection from Ukraine",
      publisher: "OECD / EMN",
      url: "https://www.oecd.org/content/dam/oecd/en/topics/policy-issues/migration/OECD-EMN%20Inform_%20Labour-market-integration-of-beneficiaries-of-temporary-protection-from-Ukraine.pdf",
      date: "2023",
    },
    additionalSources: [
      {
        label: "War in Ukraine: Government allows 18-to-22-year-olds to leave country once again",
        publisher: "Le Monde",
        url: "https://www.lemonde.fr/en/international/article/2025/08/28/war-in-ukraine-government-allows-18-to-22-year-olds-to-leave-country-once-again_6744802_4.html",
        date: "2025",
      },
      {
        label: "Ukraine emergency",
        publisher: "USA for UNHCR",
        url: "https://www.unrefugees.org/emergencies/ukraine/",
        date: "2026",
      },
    ],
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Cette fiche décrit un état daté des restrictions ukrainiennes. Les âges, exceptions et assouplissements évoluent et doivent être vérifiés au moment de lecture.",
  },
  {
    id: "femmes-ecart-salaire",
    side: "femmes",
    domain: "Revenus",
    title: "Salaire inférieur pour une femme à profil comparable à un homme",
    metric: "3,0-4,8 %",
    summary:
      "L'Insee distingue plusieurs niveaux de comparaison. En 2024, l'écart de salaire net en équivalent temps plein est de 14,0 % sur son champ principal récent, mais tombe à 3,6 % à même emploi dans le même établissement. Dans la fonction publique en 2022, les écarts en EQTP varient fortement selon les versants, mais se réduisent à 3,0 % dans l'État, 4,0 % dans l'hospitalière et 4,8 % dans la territoriale à profil identique.",
    tags: ["revenus", "travail", "sociétal", "juridique"],
    source: {
      label: "Les inégalités salariales entre les femmes et les hommes mesurées par l'Insee",
      publisher: "HCREP / Insee",
      url: "https://www.strategie-plan.gouv.fr/files/2025-03/04032025_HCREP-INSEE.pdf",
      date: "2025",
    },
    additionalSources: [
      {
        label: "Écart de salaire entre femmes et hommes en 2024",
        publisher: "Insee",
        url: "https://www.insee.fr/fr/statistiques/8743657",
        date: "2026",
      },
      {
        label:
          "À volume annuel de travail égal, le salaire net moyen de la fonction publique est inférieur de 3,7 % à celui du secteur privé",
        publisher: "Insee",
        url: "https://www.insee.fr/fr/statistiques/8386049",
        date: "2025",
      },
    ],
    translations: {
      en: {
        title: "The women-men pay gap is much smaller at comparable profile",
        summary:
          "Insee distinguishes several levels of comparison. In 2024, the net full-time-equivalent wage gap is 14.0% in its main recent scope, but falls to 3.6% for the same job in the same establishment. In the public sector in 2022, full-time-equivalent gaps vary widely across branches, but fall to 3.0% in central government, 4.0% in hospitals and 4.8% in local government at identical profile.",
        nuance:
          "The data is not a simple 'equal pay for equal work' measure. Raw gaps combine working time, occupations, sectors, hierarchical positions and access to very high wages. Gaps at comparable job or profile are much smaller, but they do not by themselves measure pay discrimination: they do not always capture experience, seniority, education, career interruptions or the mechanisms that steer people toward lower-paid occupations.",
        sourcePopulation:
          "Population measured by the source: women and men in Insee wage statistics. The source does not measure chromosomes.",
        tags: ["income", "work", "social", "legal"],
      },
    },
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La donnée ne correspond pas à un simple 'à travail égal'. Les écarts bruts agrègent volume de travail, métiers, secteurs, positions hiérarchiques et accès aux très hauts salaires. Les écarts à poste ou profil comparable sont nettement plus faibles, mais ne mesurent pas à eux seuls la discrimination salariale: ils ne captent pas toujours l'expérience, l'ancienneté, le diplôme, les interruptions de carrière ni les mécanismes d'orientation vers les métiers moins rémunérés.",
  },
  {
    id: "hommes-femmes-taxe-rose-prix-genres",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Revenus",
    title: "Taxe rose : des prix genrés existent, sans surcoût féminin généralisé",
    metric: "écarts mixtes",
    summary:
      "En France, l'avis du Conseil national de la consommation sur le marketing différencié indique que les relevés de prix réalisés sur un périmètre limité ont trouvé des différences tour à tour en défaveur des hommes et des femmes, sans faire ressortir de surcoût généralisé pour les femmes, sauf pour les crèmes hydratantes. Aux États-Unis, l'article publié en 2023 dans Marketing Science sur les produits de grande consommation ne trouve pas non plus de surcoût féminin systématique: certains écarts vont dans un sens, d'autres dans l'autre.",
    tags: ["femmes", "hommes", "taxe rose", "prix genrés", "marketing", "revenus"],
    source: {
      label: "Avis du Conseil national de la consommation - Marketing différencié",
      publisher: "Conseil national de la consommation / DGCCRF",
      url: "https://www.economie.gouv.fr/files/files/directions_services/dgccrf/boccrf/2017/17_02/avis-cnc-marketing.pdf",
      date: "13 décembre 2016",
    },
    additionalSources: [
      {
        label: "Gender-Based Pricing in Consumer Packaged Goods: A Pink Tax?",
        publisher: "Marketing Science / INFORMS",
        url: "https://doi.org/10.1287/mksc.2023.1452",
        date: "2023",
      },
      {
        label: "Gender-Related Price Differences for Goods and Services",
        publisher: "U.S. Government Accountability Office",
        url: "https://www.gao.gov/products/gao-18-500",
        date: "2018",
      },
      {
        label: "From Cradle to Cane: The Cost of Being a Female Consumer",
        publisher: "New York City Department of Consumer Affairs",
        url: "https://www.nyc.gov/assets/dca/downloads/pdf/partners/Study-of-Gender-Pricing-in-NYC.pdf",
        date: "2015",
      },
    ],
    translations: {
      en: {
        title: "Pink tax: gendered prices exist, without a generalized female surcharge",
        summary:
          "In France, the National Consumer Council opinion on differentiated marketing states that price checks on a limited scope found differences alternately disadvantaging men and women, without showing a generalized surcharge for women, except for moisturizing creams. In the United States, the 2023 Marketing Science article on consumer packaged goods likewise found no systematic female surcharge: some gaps favored women, others men.",
        nuance:
          "The pink tax is not a legal tax. The evidence supports a narrower claim: gendered marketing can create price differences for some similar products, but the direction varies by category. The 2023 Marketing Science article also reports that more than 80% of the products studied were gendered, while apples-to-apples comparisons with similar ingredients did not show a systematic premium for women's variants. Prices can also reflect packaging, formulation, volumes, services, brand positioning, demand and willingness to pay. Market segmentation may still rely on gender norms, so the phenomenon is neither imaginary nor universally one-sided.",
        sourcePopulation:
          "Population measured by the sources: gendered consumer products and services compared in France and the United States. The sources do not measure chromosomes.",
        tags: ["women", "men", "pink tax", "gendered prices", "marketing", "income"],
      },
    },
    confidence: "forte",
    lastChecked: "25 juin 2026",
    nuance:
      "La taxe rose n'est pas une taxe légale. Les sources soutiennent une conclusion plus étroite: le marketing genré peut créer des écarts de prix sur certains produits similaires, mais le sens varie selon les catégories. L'article publié en 2023 dans Marketing Science indique aussi que plus de 80 % des produits étudiés sont genrés, tout en ne trouvant pas de surcoût systématique pour les variantes féminines à ingrédients comparables. Les prix peuvent aussi refléter l'emballage, la composition, les volumes, la prestation, le positionnement de marque, la demande et la disposition à payer. La segmentation de marché peut néanmoins s'appuyer sur des normes de genre: le phénomène n'est donc ni imaginaire ni universellement à sens unique.",
  },
  {
    id: "femmes-temps-partiel",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Travail",
    title: "Femmes beaucoup plus souvent en emploi à temps partiel",
    metric: "26,8 % vs 8,7 %",
    summary:
      "En 2024, 26,8 % des femmes en emploi travaillent à temps partiel contre 8,7 % des hommes. Parmi les seuls salariés, 26,7 % des femmes et 7,9 % des hommes sont à temps partiel; 77,5 % des salariés à temps partiel sont des femmes.",
    tags: ["travail", "famille", "revenus", "sociétal", "hommes"],
    source: {
      label: "Emploi - Caractéristiques des emplois en 2024",
      publisher: "Insee",
      url: "https://www.insee.fr/fr/statistiques/8612530",
      date: "14 novembre 2024",
    },
    additionalSources: [
      {
        label: "Temps partiel - Emploi, chômage, revenus du travail",
        publisher: "Insee",
        url: "https://www.insee.fr/fr/statistiques/8376858?sommaire=8376908",
        date: "2025",
      },
      {
        label:
          "Fathers' Perceptions of the Availability of Flexible Working Arrangements: Evidence from the UK",
        publisher: "Work, Employment and Society / SAGE",
        url: "https://journals.sagepub.com/doi/10.1177/0950017020946687",
        date: "2021",
      },
      {
        label: "Paid leave for fathers",
        publisher: "OCDE",
        url: "https://www.oecd.org/en/publications/paid-leave-for-fathers_07442bed-en/full-report.html",
        date: "2025",
      },
    ],
    translations: {
      en: {
        title: "Women are much more often in part-time employment",
        summary:
          "In 2024, 26.8% of women in employment worked part-time, compared with 8.7% of men. Looking only at employees, 26.7% of women and 7.9% of men worked part-time; women made up 77.5% of part-time employees.",
        nuance:
          "This entry describes a gendered norm around work and care, not automatically a disadvantage experienced by every woman working part-time. Some part-time work is chosen and some is involuntary. Conversely, men may also be discouraged from reducing working time for family or professional reasons when employer culture values full-time availability, long hours or the breadwinner role.",
        sourcePopulation:
          "Population measured by the sources: women and men in employment in Insee labour-market statistics, plus employees and parents in the complementary sources. The source does not measure chromosomes.",
        tags: ["work", "family", "income", "social", "men"],
      },
    },
    confidence: "forte",
    lastChecked: "25 juin 2026",
    nuance:
      "Cette fiche décrit une norme genrée du travail et du soin, pas automatiquement un désavantage subi par chaque femme à temps partiel. Une partie du temps partiel est choisie, une partie subie. Inversement, des hommes peuvent aussi être découragés de réduire leur temps de travail pour raisons familiales ou professionnelles lorsque la culture d'entreprise valorise la disponibilité à temps plein, les longues heures ou le rôle de pourvoyeur principal.",
  },
  {
    id: "femmes-violences-conjugales",
    side: "femmes",
    domain: "Violences",
    title: "Femmes majoritaires parmi les victimes conjugales enregistrées",
    metric: "84 %",
    summary:
      "En 2024, les services de sécurité ont enregistré 272 400 victimes de violences commises par partenaire ou ex-partenaire. 84 % des victimes sont des femmes et seule une victime sur six porte plainte.",
    tags: ["violences", "sécurité", "juridique", "sociétal"],
    source: {
      label:
        "Violences conjugales enregistrées par les services de sécurité : quasi-stabilisation en 2024",
      publisher: "Ministère de l'Intérieur / SSMSI",
      url: "https://www.interieur.gouv.fr/actualites/communiques-de-presse/violences-conjugales-enregistrees-par-services-de-securite-quasi-stabilisation-en-2024",
      date: "23 octobre 2025",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Les données enregistrées dépendent du dépôt de plainte et des conditions d'accueil. Les enquêtes de victimation complètent ce tableau.",
  },
  {
    id: "femmes-violences-sexuelles",
    side: "femmes",
    domain: "Violences",
    title: "Femmes victimes de violences sexuelles très peu déclarées",
    metric: "7 % plainte",
    summary:
      "Le nombre de femmes majeures victimes de viols, tentatives de viol ou agressions sexuelles en 2023 est estimé à 277 000. Seules 7 % déclarent avoir porté plainte. Cette sous-déclaration n'est pas propre aux femmes: plusieurs sources internationales montrent aussi une sous-déclaration masculine massive, parfois plus forte selon les champs mesurés.",
    tags: ["violences", "justice", "santé", "sociétal", "hommes"],
    source: {
      label: "Les chiffres de référence sur les violences faites aux femmes",
      publisher: "Arrêtons les violences / SSMSI",
      url: "https://arretonslesviolences.gouv.fr/je-suis-professionnel/chiffres-de-reference-violences-faites-aux-femmes",
      date: "données 2023, consulté le 25 juin 2026",
    },
    additionalSources: [
      {
        label: "Les violences sexistes et sexuelles en France en 2024",
        publisher: "Arrêtons les violences / SSMSI",
        url: "https://arretonslesviolences.gouv.fr/sites/default/files/2025-11/Lettre-violences-sexistes-et-sexuelles-novembre-2025.pdf",
        date: "novembre 2025",
      },
      {
        label: "Lettre de l'Observatoire national des violences faites aux femmes",
        publisher: "Miprof / SSMSI",
        url: "https://arretonslesviolences.gouv.fr/sites/default/files/2024-03/Lettre-Observatoire-national-des-violences-faites-aux-femmes-Miprof-Mars-2024.pdf",
        date: "mars 2024",
      },
      {
        label: "L'enquête Vécu et ressenti en matière de sécurité (VRS)",
        publisher: "Ministère de l'Intérieur / SSMSI",
        url: "https://www.interieur.gouv.fr/Interstats/L-enquete-Vecu-et-ressenti-en-matiere-de-securite-VRS",
        date: "consulté le 25 juin 2026",
      },
      {
        label: "Male Victims of Sexual Violence and Factors Associated With Reporting to Law Enforcement in the United States",
        publisher: "The Journal of Men's Studies / SAGE",
        url: "https://journals.sagepub.com/doi/abs/10.1177/10608265241249937",
        date: "2024",
      },
      {
        label: "JustFacts - Sexual Assault",
        publisher: "Justice Canada",
        url: "https://www.justice.gc.ca/eng/rp-pr/jr/jf-pf/2019/apr01.html",
        date: "2019",
      },
    ],
    translations: {
      en: {
        title: "Sexual violence against women is very rarely reported",
        summary:
          "The number of adult women victims of rape, attempted rape or sexual assault in 2023 is estimated at 277,000. Only 7% say they filed a complaint. This under-reporting is not specific to women: several international sources also show massive under-reporting among male victims, sometimes higher depending on the measured scope.",
        nuance:
          "Update tracked on 25 June 2026: the main figure is a weighted estimate from the French VRS victimization survey for adult women living in ordinary housing within the survey scope. It is not a judicial count or an exact count of incidents: one victim may have experienced several incidents, and survey scope, weighting and statistical uncertainty matter. It does not measure men's reporting levels: male sexual violence is also very rarely reported, with international sources sometimes indicating even stronger under-reporting.",
        sourcePopulation:
          "Population measured by the source: adult women living in ordinary housing in the VRS victimization survey scope. The source does not measure chromosomes.",
        tags: ["violence", "justice", "health", "social", "men"],
      },
    },
    confidence: "forte",
    lastChecked: "25 juin 2026",
    nuance:
      "Suivi ajouté le 25 juin 2026: la donnée principale est une estimation pondérée issue de l'enquête de victimation VRS, sur les femmes majeures vivant en logement ordinaire dans le champ de l'enquête. Ce n'est ni un décompte judiciaire ni un nombre exact de faits: une même victime peut avoir subi plusieurs faits, et le champ, la pondération et l'incertitude statistique doivent être conservés. Elle ne mesure pas le niveau de déclaration des hommes: les violences sexuelles masculines sont elles aussi très peu signalées, avec des sources internationales indiquant parfois une sous-déclaration encore plus forte.",
  },
  {
    id: "femmes-perception-desavantage-hce-2025",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Droits",
    title: "Perception du sexisme comme désavantage plus forte chez les femmes",
    metric: "54 % vs 42 %",
    summary:
      "Dans le rapport HCE 2026, fondé notamment sur le baromètre administré en novembre 2025, 54 % des femmes estiment qu'il est désavantageux d'être une femme dans la société actuelle, contre 42 % des hommes. Chez les 15-24 ans, cette perception atteint 75 % des jeunes femmes contre 42 % des jeunes hommes.",
    tags: ["sexisme", "perception", "jeunes", "France", "HCE"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données novembre 2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Baromètre Sexisme - Vague 5",
        publisher: "Toluna Harris Interactive / DGCS / HCE",
        url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/Rapport%20Toluna%20Harris%20-%20Barom%C3%A8tre%20sexisme%20Vague%205%20-%202025%20%28DGCS%20-%20HCE%29.pdf",
        date: "novembre 2025",
      },
    ],
    translations: {
      en: {
        title: "Women more often perceive sexism as a disadvantage",
        summary:
          "In the HCE 2026 report, based in part on the survey conducted in November 2025, 54% of women think it is disadvantageous to be a woman in today's society, compared with 42% of men. Among 15-24 year-olds, this perception reaches 75% of young women compared with 42% of young men.",
        nuance:
          "This is a perception indicator, not a complete measurement of every disadvantage experienced by women or men. It is useful because the gap is measured by sex and age in the same survey, but it does not identify causes on its own.",
        sourcePopulation:
          "Population measured by the source: people aged 15 and over in France, with men/women and age comparisons in the November 2025 HCE/Toluna Harris survey. The source does not measure chromosomes.",
        tags: ["sexism", "perception", "young people", "France", "HCE"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "Il s'agit d'un indicateur de perception, pas d'une mesure complète de tous les désavantages vécus par les femmes ou les hommes. Il est utile parce que l'écart est mesuré par sexe et par âge dans la même enquête, mais il n'identifie pas à lui seul les causes.",
  },
  {
    id: "femmes-violences-sexuelles-transports-hce-2025",
    side: "femmes",
    domain: "Violences",
    title: "Femmes très majoritaires parmi les victimes dans les transports",
    metric: "91 %",
    summary:
      "Le rapport HCE indique que plus de six femmes sur dix déclarent avoir déjà été moins bien traitées en raison de leur sexe dans la rue ou les transports. Dans les transports en commun, 91 % des victimes de violences sexistes ou sexuelles sont des femmes; 3 400 victimes de violences sexuelles y ont été recensées en 2024, avec une sous-déclaration importante.",
    tags: ["transports", "espace public", "violences sexuelles", "France", "HCE"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données 2024-2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Lettre n°23 - Les violences sexistes et sexuelles dans les transports en commun",
        publisher: "Observatoire national des violences faites aux femmes / Miprof",
        url: "https://arretonslesviolences.gouv.fr/sites/default/files/2025-03/Lettre%2023%20Observatoire%20national%20des%20violences%20faites%20aux%20femmes.pdf",
        date: "mars 2025",
      },
    ],
    translations: {
      en: {
        title: "Women are a very large majority of victims in public transport",
        summary:
          "The HCE report states that more than six in ten women say they have already been treated worse because of their sex in the street or on transport. In public transport, 91% of victims of sexist or sexual violence are women; 3,400 victims of sexual violence in transport were recorded in 2024, with substantial under-reporting.",
        nuance:
          "The transport figures combine recorded incidents and survey-based reporting information. They document a strong victimization asymmetry in a specific setting, while recorded data remains dependent on reporting and police registration practices.",
        sourcePopulation:
          "Population measured by the sources: women surveyed on treatment in public space and recorded victims of sexist or sexual violence in public transport. The sources do not measure chromosomes.",
        tags: ["transport", "public space", "sexual violence", "France", "HCE"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "Les chiffres sur les transports combinent faits enregistrés et informations d'enquête sur le dépôt de plainte. Ils documentent une forte asymétrie de victimation dans un espace précis, mais les données enregistrées restent dépendantes du signalement et de l'enregistrement par les services compétents.",
  },
  {
    id: "femmes-sport-inegalites-hce-2025",
    side: "femmes",
    domain: "Revenus",
    title: "Sport : écarts de traitement, de revenus et de visibilité",
    metric: "226 M$ vs 1,9 Md$",
    summary:
      "Le HCE relève que 67 % de la population estime que les femmes ne sont pas traitées de manière équivalente dans le sport, et que 20 % des femmes disent en avoir personnellement fait l'expérience. Le rapport cite aussi un écart de rémunération de 23 % dans la branche sport en 2021, et un écart international très marqué entre les vingt athlètes féminines les mieux rémunérées en 2023 (226 millions de dollars) et le Top 20 masculin (1,9 milliard).",
    tags: ["sport", "revenus", "représentation", "France", "HCE"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données 2021-2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Femmes et sport : bâtir des carrières, conquérir l'égalité",
        publisher: "Haut Conseil à l'Égalité",
        url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2025-07/HCE-2025-RAPPORT-FEMMES-ET-SPORT-V3.pdf",
        date: "17 juillet 2025",
      },
    ],
    translations: {
      en: {
        title: "Sport: gaps in treatment, income and visibility",
        summary:
          "The HCE notes that 67% of the population think women are not treated equivalently in sport, and that 20% of women say they have personally experienced this. The report also cites a 23% wage gap in the sports branch in 2021, and a very large international gap between the top twenty paid female athletes in 2023 ($226 million) and the male Top 20 ($1.9 billion).",
        nuance:
          "Income and visibility gaps partly depend on audience levels, broadcasting rights, sponsorship, prize money, competition profitability and wider public demand; they therefore cannot, on their own, be attributed to direct discrimination or to individual responsibility of men. This market logic can produce different asymmetries across sectors. At the same time, demand can be shaped by media exposure, investment, broadcast slots, competition structure, sports narratives and cultural habits. This entry documents observed gaps and perceived-treatment indicators without isolating a single cause.",
        sourcePopulation:
          "Population measured by the sources: people surveyed in France about sport, women reporting personal experience, sports-sector wage data, and international elite athlete earnings. The sources do not measure chromosomes.",
        tags: ["sport", "income", "representation", "France", "HCE"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "Les écarts de revenus et de visibilité dépendent en partie de l'audience, des droits de diffusion, du sponsoring, des primes, de la rentabilité des compétitions et plus largement de la demande du public; ils ne permettent donc pas, à eux seuls, d'attribuer l'écart à une discrimination directe ou à une responsabilité individuelle des hommes. Cette logique de marché peut produire des asymétries différentes selon les secteurs. En parallèle, la demande peut être façonnée par l'exposition médiatique, les investissements, les horaires de diffusion, la structuration des compétitions, les récits sportifs et les habitudes culturelles. Cette fiche documente des écarts observés et des indicateurs de traitement perçu, sans isoler une cause unique.",
  },
  {
    id: "femmes-cybersexisme-hce-2025",
    side: "femmes",
    domain: "Numérique",
    title: "Cybersexisme : victimes majoritairement féminines selon le HCE",
    metric: "84 %",
    summary:
      "Le rapport HCE présente le cybersexisme comme la première forme de discours de haine en ligne dans son champ, avec 84 % des victimes étant des femmes. La perception du phénomène progresse davantage chez les femmes, à 64 %, que chez les hommes, à 56 %.",
    tags: ["numérique", "cybersexisme", "haine en ligne", "France", "HCE"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données 2025, publication 2026",
    },
    translations: {
      en: {
        title: "Cybersexism: victims are mostly women according to the HCE",
        summary:
          "The HCE report presents cybersexism as the leading form of online hate speech in its scope, with women accounting for 84% of victims. Perception of the phenomenon is rising more among women, at 64%, than among men, at 56%.",
        nuance:
          "The source describes a specific category of online hate and victimization. It should not be generalized to every form of cyberviolence, online conflict or platform moderation dispute.",
        sourcePopulation:
          "Population measured by the source: victims and survey respondents in the HCE discussion of cybersexism and online hate. The source does not measure chromosomes.",
        tags: ["digital", "cybersexism", "online hate", "France", "HCE"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "La source décrit une catégorie précise de haine en ligne et de victimation. Elle ne doit pas être généralisée à toutes les formes de cyberviolence, de conflit en ligne ou de contestation de la modération des plateformes.",
  },
  {
    id: "femmes-deepfakes-sexuels-hce-2025",
    side: "femmes",
    domain: "Numérique",
    title: "Deepfakes sexuels : contenus pornographiques visant surtout des femmes",
    metric: "99 %",
    summary:
      "Le rapport HCE indique que 96 % des contenus de deepfake ou hypertrucage à caractère sexuel sont des montages pornographiques, et que 99 % visent des femmes. Depuis la loi SREN de 2024, l'article 226-8-1 du code pénal sanctionne la diffusion non consentie d'un montage sexuel, avec une peine aggravée en cas de diffusion en ligne.",
    tags: ["numérique", "deepfake", "violences sexuelles", "droit pénal", "France"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "publication 2026",
    },
    additionalSources: [
      {
        label: "Article 226-8-1 du code pénal",
        publisher: "Légifrance",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049567458",
        date: "version en vigueur depuis 2024",
      },
    ],
    translations: {
      en: {
        title: "Sexual deepfakes: pornographic content mostly targeting women",
        summary:
          "The HCE report states that 96% of sexual deepfake or synthetic manipulation content consists of pornographic montages, and that 99% targets women. Since the 2024 SREN law, Article 226-8-1 of the French Criminal Code penalizes non-consensual dissemination of a sexual montage, with a higher penalty for online dissemination.",
        nuance:
          "The 99% figure concerns this specific category of sexual deepfake content. It does not describe all synthetic media or all online harms, and the legal note concerns French criminal law.",
        sourcePopulation:
          "Population measured by the sources: people targeted by sexual deepfake or synthetic manipulation content, and persons protected by French criminal law. The sources do not measure chromosomes.",
        tags: ["digital", "deepfake", "sexual violence", "criminal law", "France"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "Le chiffre de 99 % concerne cette catégorie précise de contenus sexuels hypertruqués. Il ne décrit pas l'ensemble des médias synthétiques ni l'ensemble des atteintes en ligne, et le rappel juridique concerne le droit pénal français.",
  },
  {
    id: "femmes-inegalites-familiales-hce-2025",
    side: "femmes",
    domain: "Famille",
    title: "Famille : traitement inégal déclaré plus souvent par les femmes",
    metric: "51 % vs 22 %",
    summary:
      "Dans le baromètre cité par le HCE, 51 % des femmes déclarent avoir déjà été moins bien traitées dans leur vie de famille, contre 22 % des hommes. Le rapport indique aussi que 68 % des personnes interrogées jugent normal que les femmes interrompent plus longtemps leur activité après une naissance, 40 % qu'elles cessent de travailler pour s'occuper des enfants, et 40 % des femmes déclarent un déséquilibre dans les tâches ménagères.",
    tags: ["famille", "travail domestique", "parentalité", "France", "HCE"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données novembre 2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Baromètre Sexisme - Vague 5",
        publisher: "Toluna Harris Interactive / DGCS / HCE",
        url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/Rapport%20Toluna%20Harris%20-%20Barom%C3%A8tre%20sexisme%20Vague%205%20-%202025%20%28DGCS%20-%20HCE%29.pdf",
        date: "novembre 2025",
      },
    ],
    translations: {
      en: {
        title: "Family life: unequal treatment is reported more often by women",
        summary:
          "In the barometer cited by the HCE, 51% of women say they have already been treated worse in family life, compared with 22% of men. The report also states that 68% of respondents consider it normal for women to interrupt work longer after a birth, 40% think women should stop working to care for children, and 40% of women report an imbalance in household tasks.",
        nuance:
          "This entry mixes personal experience and opinion items, so it should be read as a family-norm asymmetry rather than as one single causal mechanism. Some family expectations also constrain men, notably through the financial provider role.",
        sourcePopulation:
          "Population measured by the source: people surveyed in France in the November 2025 HCE/Toluna Harris barometer, with women/men comparisons and opinion items. The source does not measure chromosomes.",
        tags: ["family", "domestic work", "parenting", "France", "HCE"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "La fiche combine expériences personnelles et items d'opinion: elle doit donc être lue comme une asymétrie de normes familiales plutôt que comme un mécanisme causal unique. Certaines attentes familiales contraignent aussi les hommes, notamment à travers le rôle de pourvoyeur financier.",
  },
  {
    id: "femmes-vecu-situations-sexistes-hce-2025",
    side: "femmes",
    domain: "Violences",
    title: "Expériences sexistes déclarées par une large majorité de femmes",
    metric: "84 %",
    summary:
      "Le rapport HCE indique que 84 % des femmes ont déjà vécu au moins une situation sexiste. Il cite notamment le harcèlement dans l'espace public, les blagues ou commentaires sexistes, les sifflements ou interpellations à caractère sexuel, ainsi que des violences sexuelles ou pressions insistantes pour un rapport non désiré.",
    tags: ["sexisme", "harcèlement", "violences sexuelles", "France", "HCE"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données novembre 2025, publication 2026",
    },
    additionalSources: [
      {
        label: "Baromètre Sexisme - Vague 5",
        publisher: "Toluna Harris Interactive / DGCS / HCE",
        url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/Rapport%20Toluna%20Harris%20-%20Barom%C3%A8tre%20sexisme%20Vague%205%20-%202025%20%28DGCS%20-%20HCE%29.pdf",
        date: "novembre 2025",
      },
    ],
    translations: {
      en: {
        title: "A large majority of women report sexist experiences",
        summary:
          "The HCE report states that 84% of women have experienced at least one sexist situation. It cites harassment in public space, sexist jokes or comments, sexual whistling or catcalling, as well as sexual violence or insistent pressure for unwanted sex.",
        nuance:
          "This is self-reported survey data. The listed situations cover very different levels of severity, so the 84% figure should not be collapsed into the most serious forms alone.",
        sourcePopulation:
          "Population measured by the source: women surveyed in France in the November 2025 HCE/Toluna Harris barometer. The source does not measure chromosomes.",
        tags: ["sexism", "harassment", "sexual violence", "France", "HCE"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "Il s'agit de données déclaratives d'enquête. Les situations listées couvrent des niveaux de gravité très différents; le chiffre de 84 % ne doit donc pas être réduit aux seules formes les plus graves.",
  },
  {
    id: "femmes-assemblee-nationale-parite-2024",
    side: "femmes",
    domain: "Droits",
    title: "Assemblée nationale : part des députées en recul en 2024",
    metric: "36 %",
    summary:
      "Le rapport HCE indique que la part de femmes députées à l'Assemblée nationale est passée à 36 % après les élections législatives de 2024, contre 37 % en 2022 et 39 % en 2017.",
    tags: ["politique", "représentation", "parité", "France", "HCE"],
    source: {
      label: "Rapport 2026 sur l'état des lieux du sexisme en France",
      publisher: "Haut Conseil à l'Égalité",
      url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/2026-01/HCE-2026-STER-Rapport_Sexisme--v04.pdf",
      date: "données 2017-2024, publication 2026",
    },
    translations: {
      en: {
        title: "French National Assembly: women's share fell in 2024",
        summary:
          "The HCE report states that the share of women MPs in the French National Assembly fell to 36% after the 2024 legislative elections, compared with 37% in 2022 and 39% in 2017.",
        nuance:
          "This indicator concerns one institution and one electoral cycle. It documents representation, not the quality of parliamentary work or the positions held within the Assembly.",
        sourcePopulation:
          "Population measured by the source: women and men elected to the French National Assembly. The source does not measure chromosomes.",
        tags: ["politics", "representation", "parity", "France", "HCE"],
      },
    },
    confidence: "forte",
    lastChecked: "21 juin 2026",
    nuance:
      "L'indicateur concerne une institution et un cycle électoral précis. Il documente la représentation, pas la qualité du travail parlementaire ni la répartition des postes internes à l'Assemblée.",
  },
  {
    id: "femmes-ingenierie",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Éducation",
    title: "Femmes moins présentes dans l'ingénierie malgré une réussite scolaire élevée",
    metric: "24 %",
    summary:
      "En 2023, les femmes représentent 24 % des ingénieurs en activité et 29 % des ingénieurs diplômés de l'année. Cette sous-représentation relève surtout de l'orientation: les filles réussissent globalement mieux plusieurs jalons scolaires, mais restent moins présentes dans les trajectoires scientifiques et techniques.",
    tags: ["éducation", "travail", "orientation", "sociétal"],
    source: {
      label: "Observatoire des Femmes Ingénieures 2025",
      publisher: "Femmes Ingénieures / IESF",
      url: "https://www.femmes-ingenieures.org/offres/file_inline_src/82/82_P_38037_690cc4ba6342f_33.pdf",
      date: "2025",
    },
    additionalSources: [
      {
        label:
          "Filles et garçons sur le chemin de l'égalité, de l'école à l'enseignement supérieur, édition 2024",
        publisher: "DEPP / Ministère de l'Éducation nationale",
        url: "https://www.education.gouv.fr/depp/filles-et-garcons-sur-le-chemin-de-l-egalite-de-l-ecole-l-enseignement-superieur-edition-2024-413799",
        date: "2024",
      },
      {
        label: "Les bourses sur critères sociaux (BCS)",
        publisher: "DREES",
        url: "https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/MS2025%20-%20Fiche%2032%20-%20Les%20bourses%20sur%20crit%C3%A8res%20sociaux%20%28BCS%29.pdf",
        date: "2025",
      },
      {
        label: "Vers l'égalité femmes-hommes ? Chiffres clés 2022",
        publisher: "MESR / SIES",
        url: "https://www.enseignementsup-recherche.gouv.fr/sites/default/files/2022-03/esri---vers-l-galit-femmes-hommes---2022-17027.pdf",
        date: "2022",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La sous-représentation ne mesure pas à elle seule un désavantage subi ni une interdiction formelle. Les filles obtiennent de meilleurs résultats sur plusieurs indicateurs scolaires, notamment au DNB, au baccalauréat et dans l'accès au niveau master, mais pas uniformément en mathématiques. Les bourses sur critères sociaux dépendent des ressources et charges familiales: les femmes sont majoritaires parmi les bénéficiaires en général, mais l'écart femmes-hommes est faible ou nul en formation d'ingénieur selon les sources disponibles.",
  },
  {
    id: "femmes-separation-niveau-vie",
    side: "femmes",
    domain: "Famille",
    title: "Niveau de vie des femmes plus touché après séparation",
    metric: "-17 % vs -7 %",
    summary:
      "Dans l'étude Insee Occitanie, l'année de la séparation, le niveau de vie médian diminue de 17 % pour les femmes contre 7 % pour les hommes. L'écart reflète notamment la perte d'un niveau de vie de couple où les revenus du conjoint étaient mutualisés.",
    tags: ["famille", "revenus", "séparation", "sociétal"],
    source: {
      label:
        "Après une séparation, les femmes font face à davantage de difficultés que les hommes",
      publisher: "Insee",
      url: "https://www.insee.fr/fr/statistiques/8338430",
      date: "2025",
    },
    confidence: "moyenne",
    lastChecked: "3 juillet 2026",
    nuance:
      "L'Insee mesure le niveau de vie du ménage après séparation, pas un appauvrissement personnel au sens strict. Avant la séparation, le niveau de vie du foyer est calculé avec les revenus mis en commun; après la séparation, les revenus du conjoint ne bénéficient plus au nouveau ménage. L'Insee indique qu'avant rupture les femmes contribuent en moyenne à 36 % des revenus d'activité du ménage, leurs revenus d'activité étant souvent plus faibles que ceux de leur conjoint. L'autre facteur cité est la garde des enfants, plus souvent assumée par les mères, qui réduit le niveau de vie mesuré. Chez les femmes des ménages les plus modestes, une partie reprend ou augmente une activité: leur revenu d'activité individuel moyen passe de 607 à 707 euros l'année de la séparation, mais les autres revenus du ménage diminuent. Le champ reste l'Occitanie, pour des séparations observées entre 2014 et 2020; une fiche nationale serait préférable.",
  },
  {
    id: "femmes-discrimination-religieuse",
    side: "femmes",
    domain: "Religieux",
    title: "Candidate voilée discriminée à l'embauche",
    metric: "cas 2025",
    summary:
      "Le Défenseur des droits a constaté en 2025 une discrimination intersectionnelle directe liée aux convictions religieuses et au sexe dans un refus d'embauche visant une candidate portant le foulard.",
    tags: ["religieux", "travail", "juridique", "discrimination"],
    source: {
      label:
        "Décision 2025-069 relative à un refus d'embauche discriminatoire",
      publisher: "Défenseur des droits",
      url: "https://juridique.defenseurdesdroits.fr/doc_num.php?explnum_id=22735",
      date: "18 avril 2025",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "C'est une décision sur un cas précis. Elle sert d'exemple juridique sourcé, pas de mesure statistique générale.",
  },
  {
    id: "femmes-france-droit-vote-1944",
    side: "femmes",
    domain: "Droits",
    title: "Femmes privées du droit de vote en France jusqu'en 1944",
    metric: "1944/1945",
    summary:
      "En France, les femmes n'ont obtenu le droit de vote et d'éligibilité national qu'avec l'ordonnance du 21 avril 1944, avec un premier vote en 1945.",
    tags: ["droits", "France", "historique", "politique"],
    source: {
      label: "Histoire des droits des femmes",
      publisher: "Vie publique",
      url: "https://www.vie-publique.fr/eclairage/19590-histoire-des-droits-des-femmes-chronologie-de-la-revolution-nos-jours",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Cette fiche décrit une situation historique en France: elle ne décrit pas le droit actuel, mais explique une exclusion politique passée et documentée.",
  },
  {
    id: "femmes-france-compte-bancaire-travail-1965",
    side: "femmes",
    domain: "Droits",
    title: "Femmes mariées privées d'autonomie bancaire avant 1965",
    metric: "1965",
    summary:
      "Avant la loi du 13 juillet 1965, les femmes mariées en France étaient soumises à l'autorisation maritale pour ouvrir librement un compte, signer certains actes ou exercer une profession dans plusieurs situations.",
    tags: ["droits", "France", "historique", "autonomie économique"],
    source: {
      label: "La femme mariée avait le statut de mineure",
      publisher: "Gouvernement français",
      url: "https://www.info.gouv.fr/actualite/la-femme-mariee-avait-le-statut-de-mineure-au-meme-titre-que-les-enfants",
      date: "2025",
    },
    additionalSources: [
      {
        label: "Juillet 1965, la banque et les femmes",
        publisher: "BNP Paribas Histoire",
        url: "https://histoire.bnpparibas/temps-forts/juillet-1965-la-banque-et-les-femmes/",
        date: "2025",
      },
    ],
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Cette fiche décrit une règle abrogée en France. Le cas relève de l'historique du droit et non d'une contrainte contemporaine française.",
  },
  {
    id: "femmes-france-contraception-1967",
    side: "femmes",
    domain: "Santé",
    title: "Accès à la contraception restreint avant la loi Neuwirth",
    metric: "1920-1967",
    summary:
      "La loi du 31 juillet 1920 réprimait la propagande anticonceptionnelle. La loi Neuwirth du 28 décembre 1967 a abrogé ces interdictions et autorisé la fabrication, l'importation et la vente encadrée de produits, médicaments et objets contraceptifs, avec une application progressive les années suivantes.",
    tags: ["santé", "droits", "France", "historique", "contraception", "hommes"],
    source: {
      label: "Loi n° 67-1176 du 28 décembre 1967 relative à la régulation des naissances",
      publisher: "Légifrance",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000880754",
      date: "1967",
    },
    additionalSources: [
      {
        label: "Loi du 31 juillet 1920 réprimant la provocation à l'avortement et à la propagande anticonceptionnelle",
        publisher: "Légifrance",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000683983",
        date: "1920",
      },
      {
        label: "L'évolution des droits des femmes en France : chronologie",
        publisher: "Vie publique",
        url: "https://www.vie-publique.fr/eclairage/19590-histoire-des-droits-des-femmes-chronologie-de-la-revolution-nos-jours",
        date: "2024",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Le droit visait la contraception en général: moyens contraceptifs pour les hommes, comme les préservatifs, et moyens contraceptifs pour les femmes. L'asymétrie classée ici côté femmes tient surtout au fait que la grossesse, l'accouchement, l'avortement clandestin et une grande partie des conséquences sociales ou médicales pèsent directement sur les femmes. Les hommes pouvaient aussi subir une paternité non prévue ou des obligations familiales, et les femmes pouvaient être abandonnées par le père; ces effets relèvent davantage des fiches famille, filiation et niveau de vie après séparation que de l'interdiction historique de la contraception elle-même.",
  },
  {
    id: "femmes-france-ivg-1975-1979",
    side: "femmes",
    domain: "Santé",
    title: "IVG pénalisée en France avant la loi Veil",
    metric: "1975/1979",
    summary:
      "La loi Veil du 17 janvier 1975 a dépénalisé l'IVG en France, avant une confirmation définitive par la loi du 31 décembre 1979.",
    tags: ["santé", "droits", "France", "historique"],
    source: {
      label: "Histoire des droits des femmes",
      publisher: "Vie publique",
      url: "https://www.vie-publique.fr/eclairage/19590-histoire-des-droits-des-femmes-chronologie-de-la-revolution-nos-jours",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Cette fiche décrit une situation historique en France. Elle aide à lire l'évolution du droit reproductif sans confondre passé français et contraintes actuelles ailleurs.",
  },
  {
    id: "femmes-violences-physiques-sexuelles-monde",
    side: "femmes",
    domain: "Violences",
    title: "Femmes exposées aux violences conjugales physiques ou sexuelles",
    metric: "1 sur 3",
    summary:
      "L'OMS estime qu'environ une femme sur trois dans le monde a subi des violences physiques et/ou sexuelles par un partenaire intime, ou des violences sexuelles par un non-partenaire, au cours de sa vie. Cet indicateur ne mesure pas toutes les violences subies par sexe.",
    tags: ["violences", "santé", "monde", "prévention"],
    source: {
      label: "Violence against women",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/news-room/fact-sheets/detail/violence-against-women",
      date: "2024",
    },
    additionalSources: [
      {
        label: "Insécurité, victimation - France, portrait social",
        publisher: "Insee / SSMSI",
        url: "https://www.insee.fr/fr/statistiques/8242369?sommaire=8242421",
        date: "2024",
      },
      {
        label:
          "Violences conjugales enregistrées par les services de sécurité : quasi-stabilisation en 2024",
        publisher: "Ministère de l'Intérieur / SSMSI",
        url: "https://www.interieur.gouv.fr/actualites/communiques-de-presse/violences-conjugales-enregistrees-par-services-de-securite-quasi-stabilisation-en-2024",
        date: "2025",
      },
      {
        label:
          "Femicides in 2023: global estimates of intimate partner/family member femicides",
        publisher: "UN Women / UNODC",
        url: "https://www.unwomen.org/sites/default/files/2024-11/femicides-in-2023-global-estimates-of-intimate-partner-family-member-femicides-en.pdf",
        date: "2024",
      },
      {
        label: "Nearly 3 million people die of work-related accidents and diseases",
        publisher: "Organisation internationale du Travail",
        url: "https://www.ilo.org/resource/news/nearly-3-million-people-die-work-related-accidents-and-diseases",
        date: "2023",
      },
      {
        label: "Suicide worldwide in 2021: global health estimates",
        publisher: "Organisation mondiale de la Santé",
        url: "https://www.who.int/publications/i/item/9789240110069",
        date: "2021",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Cette fiche porte sur les violences intimes et sexuelles, pas sur l'ensemble des violences toutes catégories confondues. Les femmes sont nettement plus exposées aux violences sexuelles et conjugales dans les enquêtes disponibles, tandis que les hommes sont davantage exposés à d'autres violences ou morts violentes: homicides, violences publiques, risques professionnels, suicide et, selon les contextes, mobilisation militaire.",
  },
  {
    id: "femmes-prison-victimisation-sexuelle-etats-unis",
    side: "femmes",
    domain: "Violences",
    title: "Détenues plus exposées à la victimisation sexuelle en prison",
    metric: "5,7 % vs 4,0 %",
    summary:
      "Dans les prisons d'État et fédérales américaines en 2023-2024, le Bureau of Justice Statistics estime que 5,7 % des détenues femmes ont rapporté une victimisation sexuelle sur les douze derniers mois ou depuis leur admission, contre 4,0 % des détenus hommes. L'écart vient surtout des faits entre détenus: 4,1 % des détenues déclarent une victimisation par une autre personne détenue, contre 2,2 % des détenus hommes.",
    tags: ["violences sexuelles", "prison", "États-Unis", "détention"],
    source: {
      label: "Sexual Victimization in Prisons Reported by Inmates, 2023-24",
      publisher: "Bureau of Justice Statistics",
      url: "https://bjs.ojp.gov/library/publications/sexual-victimization-prisons-reported-inmates-2023-24",
      date: "2025",
    },
    additionalSources: [
      {
        label: "Full report: Sexual Victimization in Prisons Reported by Inmates, 2023-24",
        publisher: "Bureau of Justice Statistics",
        url: "https://bjs.ojp.gov/document/svpri2324.pdf",
        date: "2025",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La donnée porte sur des taux déclarés aux États-Unis, pas sur le nombre absolu mondial de viols. Comme les hommes sont beaucoup plus nombreux en prison, les nombres absolus peuvent être plus élevés côté masculin. La catégorie BJS est plus large que le viol au sens pénal français et inclut aussi les faits impliquant le personnel; pour ces derniers, l'écart hommes/femmes n'est pas statistiquement significatif.",
  },
  {
    id: "femmes-feminicides-monde-2024",
    side: "femmes",
    domain: "Violences",
    title: "Femmes et filles tuées par des proches ou partenaires",
    metric: "50 000",
    summary:
      "En 2024, environ 83 000 femmes et filles ont été tuées intentionnellement dans le monde, dont environ 50 000 par un partenaire intime ou un membre de la famille.",
    tags: ["violences", "féminicides", "famille", "monde"],
    source: {
      label: "137 women and girls killed every day by intimate partners or family members in 2024",
      publisher: "UNODC / ONU Femmes",
      url: "https://www.unodc.org/unodc/en/press/releases/2025/November/137-women-and-girls-killed-every-day-by-intimate-partners-or-family-members-in-2024.html",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La sphère intime et familiale pèse particulièrement dans les homicides de femmes. Cette lecture complète, sans l'effacer, le fait que les victimes d'homicide globales sont majoritairement masculines.",
  },
  {
    id: "femmes-violences-sexuelles-conflits",
    side: "femmes",
    domain: "Conflits",
    title: "Femmes et filles visées par les violences sexuelles liées aux conflits",
    metric: "9 788",
    summary:
      "Le rapport 2026 du Secrétaire général de l'ONU sur les violences sexuelles liées aux conflits indique 9 788 cas vérifiés en 2025. L'ONU décrit ces violences comme des faits liés aux conflits, pouvant inclure viol, esclavage sexuel, prostitution forcée, grossesse forcée, avortement forcé, stérilisation forcée ou mariage forcé. Les femmes et les filles restent les principales personnes touchées, même si la définition couvre aussi les hommes et les garçons.",
    tags: [
      "femmes",
      "filles",
      "violences sexuelles",
      "conflits",
      "guerre",
      "terrorisme",
      "monde",
    ],
    source: {
      label: "Conflict-related sexual violence: report of the Secretary-General (S/2026/321)",
      publisher: "Nations unies",
      url: "https://docs.un.org/S/2026/321",
      date: "2026",
    },
    additionalSources: [
      {
        label: "Conflict-related Sexual Violence",
        publisher: "Nations unies - Peacekeeping",
        url: "https://peacekeeping.un.org/en/conflict-related-sexual-violence",
        date: "consulté 2026",
      },
      {
        label: "Percentage of women killed in war doubled in 2023: UN report",
        publisher: "Nations unies - Genève",
        url: "https://www.ungeneva.org/en/news-media/news/2024/10/99495/percentage-women-killed-war-doubled-2023-un-report",
        date: "2024",
      },
      {
        label:
          "7 October 2023 terrorist attacks in Israel: Council sanctions three entities over widespread sexual and gender-based violence",
        publisher: "Conseil de l'Union européenne",
        url: "https://www.consilium.europa.eu/en/press/press-releases/2024/04/12/7-october-2023-terrorist-attacks-in-israel-council-sanctions-three-entities-over-widespread-sexual-and-gender-based-violence/",
        date: "2024",
      },
      {
        label:
          "Nigeria. Les violences de Boko Haram contre les femmes et les filles exigent une réponse de toute urgence",
        publisher: "Amnesty International",
        url: "https://www.amnesty.org/fr/latest/news/2021/03/nigeria-boko-haram-brutality-against-women-and-girls-needs-urgent-response-new-research/",
        date: "2021",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La formule attribuée à Patrick Cammaert sur le danger d'être une femme plutôt qu'un soldat doit être lue comme une alerte politique, pas comme un ratio universel. Les morts directes au combat, les morts civiles, les violences sexuelles, la détention et le déplacement forcé ne se comparent pas avec un indicateur unique. Cette fiche documente un risque sexospécifique: dans certains conflits, des acteurs armés utilisent les violences sexuelles contre des femmes et des filles comme tactique de guerre, de terreur, de contrôle ou d'humiliation. Des hommes et des garçons peuvent aussi être victimes de violences sexuelles liées aux conflits, notamment en détention, et les cas vérifiés sous-estiment probablement l'ampleur réelle à cause de la stigmatisation, de l'insécurité et des difficultés d'accès aux victimes.",
  },
  {
    id: "femmes-homicides-mineurs-condamnations",
    side: "femmes",
    angle: "violence_exercée",
    domain: "Violences",
    title: "Femmes majoritaires parmi les condamnés pour homicide volontaire sur mineur",
    metric: "70 %",
    summary:
      "L'ONDRP indique qu'entre 1996 et 2015, la Justice française a prononcé 325 condamnations pour homicide volontaire sur mineur de moins de 15 ans, dont 227 contre des femmes, soit 70 %. Le rapport interministériel de 2018 nuance le tableau intrafamilial: dans sa synthèse, pères et mères mis en cause sont à égalité dans les 45 dossiers étudiés, mais les néonaticides relèvent d'une situation particulière de mères accouchant seules.",
    tags: ["violences", "enfance", "condamnations", "France"],
    source: {
      label: "Les homicides volontaires sur mineur de 15 ans",
      publisher: "ONDRP / IHEMI",
      url: "https://www.ihemi.fr/sites/default/files/publications/files/2019-12/note_17_0.pdf",
      date: "2017",
    },
    additionalSources: [
      {
        label: "Mission sur les morts violentes d'enfants au sein des familles",
        publisher: "Ministère de la Justice",
        url: "https://www.justice.gouv.fr/sites/default/files/migrations/portail/art_pix/2018-044%20Rapport_Morts_violentes_enfants.pdf",
        date: "2018",
      },
      {
        label: "Pourquoi les meurtres d'enfants sont-ils majoritairement commis par des femmes ?",
        publisher: "20 Minutes",
        url: "https://www.20minutes.fr/societe/2158023-20171025-pourquoi-meurtres-enfants-majoritairement-commis-femmes",
        date: "2017",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Le 70 % porte sur des condamnations pour homicide volontaire sur mineur de moins de 15 ans, pas sur tous les décès violents d'enfants ni sur toutes les mises en cause. Le rapport Justice rappelle que la qualification pénale évolue, que les chiffres de police et de justice ne couvrent pas exactement le même champ, et que les pères sont notamment cités pour les morts de nourrissons victimes du syndrome du bébé secoué.",
  },
  {
    id: "femmes-violences-sexuelles-enfance",
    side: "femmes",
    domain: "Violences",
    title: "Filles victimes de violences sexuelles avant 18 ans",
    metric: "370 M+",
    summary:
      "L'UNICEF estime que plus de 370 millions de filles et femmes vivantes ont subi un viol ou une agression sexuelle avant l'âge de 18 ans.",
    tags: ["violences", "enfance", "santé", "monde"],
    source: {
      label: "Over 370 million girls and women globally subjected to rape or sexual assault as children",
      publisher: "UNICEF",
      url: "https://www.unicef.org/press-releases/over-370-million-girls-and-women-globally-subjected-rape-or-sexual-assault-children",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Les données sur les violences sexuelles sont sensibles à la sous-déclaration. Les estimations doivent être lues comme un ordre de grandeur minimal.",
  },
  {
    id: "femmes-mariage-enfants",
    side: "femmes",
    domain: "Droits",
    title: "Filles mariées pendant l'enfance",
    metric: "640 M",
    summary:
      "L'UNICEF estime qu'environ 640 millions de filles et femmes vivantes ont été mariées pendant l'enfance.",
    tags: ["droits", "enfance", "famille", "monde"],
    source: {
      label: "Is an end to child marriage within reach?",
      publisher: "UNICEF Data",
      url: "https://data.unicef.org/resources/is-an-end-to-child-marriage-within-reach/",
      date: "2023",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le mariage d'enfants touche aussi des garçons, mais il affecte les filles à une échelle et avec des conséquences spécifiques majeures.",
  },
  {
    id: "femmes-pression-virginite-avant-mariage",
    side: "femmes",
    domain: "Autonomie",
    title: "Femmes ciblées par la norme de virginité avant mariage",
    metric: "filles/femmes",
    summary:
      "L'OMS, ONU Droits humains et ONU Femmes appellent à interdire les tests de virginité et soulignent que l'attente sociale imposant aux filles et aux femmes de rester vierges avant le mariage repose sur des stéréotypes de contrôle de la sexualité féminine. L'UNFPA classe les tests de virginité parmi les pratiques néfastes et violations des droits humains; des études sur les doubles standards sexuels montrent aussi que la sexualité prénuptiale masculine peut être jugée plus favorablement que la sexualité prénuptiale féminine dans certains contextes.",
    tags: ["autonomie corporelle", "sexualité", "virginité", "mariage", "monde"],
    source: {
      label: "United Nations agencies call for ban on virginity testing",
      publisher: "OMS",
      url: "https://www.who.int/news/item/17-10-2018-united-nations-agencies-call-for-ban-on-virginity-testing",
      date: "2018",
    },
    additionalSources: [
      {
        label: "Confronting the silent and endemic crisis of harmful practices",
        publisher: "UNFPA",
        url: "https://www.unfpa.org/press/confronting-silent-and-endemic-crisis-harmful-practices",
        date: "2020",
      },
      {
        label:
          "Contradicting perceptions of women's and men's sexuality: evidence of gender double standards in Türkiye",
        publisher: "Sexuality & Culture / Springer",
        url: "https://repository.bilkent.edu.tr/items/6a6cb5db-94c2-4256-a2c8-86cb43180c57",
        date: "2023",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "Les sources ne mesurent pas toutes les sociétés ni tous les hommes, et elles ne couvrent pas toutes les formes de pression sexuelle. Les sources sur le nombre de partenaires sexuels ne concluent pas toutes à une pénalisation spécifiquement féminine; l'asymétrie la mieux documentée ici est l'attente de virginité prénuptiale et les pratiques de contrôle visant surtout les filles et les femmes.",
  },
  {
    id: "hommes-femmes-body-count-double-standard",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Autonomie",
    title: "Nombre de partenaires sexuels passés : résultats variables selon les études",
    metric: "5 331",
    summary:
      "Une étude Scientific Reports menée dans 11 pays auprès de 5 331 participants trouve que l'envie d'envisager une relation longue baisse quand le nombre de partenaires sexuels passés augmente, mais que les différences entre évaluateurs femmes et hommes sont minimales et inconsistantes. À l'inverse, une méta-analyse de 99 études conclut que certaines mesures d'attentes et d'évaluations conservent un double standard traditionnel favorable aux hommes, tandis qu'une étude américaine par vignettes trouve même des évaluations plus négatives des hommes pour les mêmes historiques sexuels.",
    tags: ["femmes", "hommes", "sexualité", "body count", "double standard", "récit", "monde"],
    source: {
      label:
        "Sexual partner number and distribution over time affect long-term partner evaluation",
      publisher: "Scientific Reports",
      url: "https://www.nature.com/articles/s41598-025-12607-1",
      date: "2025",
    },
    additionalSources: [
      {
        label:
          "He is a Stud, She is a Slut! A Meta-Analysis on the Continued Existence of Sexual Double Standards",
        publisher: "Personality and Social Psychology Review / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/31880971/",
        date: "2020",
      },
      {
        label: "The Impact of Sexual History and Relationship Type on Social Perceptions",
        publisher: "Sexuality & Culture / Springer",
        url: "https://link.springer.com/article/10.1007/s12119-024-10246-8",
        date: "2024",
      },
      {
        label:
          "Sexual (Double) Standards Revisited: Similarities and Differences in the Societal Evaluation of Male and Female Sexuality",
        publisher: "Social Psychological and Personality Science",
        url: "https://journals.sagepub.com/doi/10.1177/19485506241237288",
        date: "2025",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "Pour le nombre de partenaires passés, les résultats varient selon le protocole, le pays, le type de relation évaluée et la mesure utilisée. Certaines sources trouvent un double standard traditionnel, d'autres un effet surtout partagé, voire inversé. Les normes de pureté sexuelle visant les femmes sont documentées séparément dans la fiche sur la virginité avant mariage.",
  },
  {
    id: "hommes-femmes-peurs-consentement-sexuel",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Violences",
    title: "Consentement sexuel : peurs asymétriques en début de relation",
    metric: "56,1 % / 2-10 %",
    summary:
      "Les enquêtes sur les violences sexuelles montrent que les femmes victimes connaissent le plus souvent l'auteur: dans le NISVS 2016-2017, 56,1 % des victimes féminines de viol déclarent un agresseur faisant partie de leurs connaissances et 39,3 % un partenaire intime. En parallèle, les faux signalements d'agression sexuelle sont estimés minoritaires, souvent entre 2 % et 10 % des signalements, mais des études documentent une peur masculine d'être faussement accusé et son lien avec les pratiques de consentement explicite.",
    tags: [
      "femmes",
      "hommes",
      "sexualité",
      "consentement",
      "violences sexuelles",
      "fausses accusations",
      "peur sociale",
      "récit",
      "monde",
    ],
    source: {
      label: "The National Intimate Partner and Sexual Violence Survey: 2016/2017 Report on Sexual Violence",
      publisher: "CDC",
      url: "https://www.cdc.gov/nisvs/documentation/nisvsReportonSexualViolence.pdf",
      date: "2022",
    },
    additionalSources: [
      {
        label: "Risk perception for acquaintance sexual aggression: a social-cognitive perspective",
        publisher: "Aggression and Violent Behavior / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/25705115/",
        date: "2000",
      },
      {
        label: "Fear and Consent: An Exploratory Study of Fear of False Accusations of Sexual Assault and Consent-Seeking Practices",
        publisher: "Journal of School Violence / ERIC",
        url: "https://eric.ed.gov/?id=EJ1378168",
        date: "2023",
      },
      {
        label: "Sexual violence statistics",
        publisher: "National Sexual Violence Resource Center",
        url: "https://www.nsvrc.org/statistics/",
        date: "consulté 2026",
      },
      {
        label:
          "Perverting the Course of Justice and Wasting Police Time in Cases involving Allegedly False Allegations of Rape and / or Domestic Abuse",
        publisher: "Crown Prosecution Service",
        url: "https://www.cps.gov.uk/prosecution-guidance/perverting-course-justice-and-wasting-police-time-cases-involving-allegedly",
        date: "consulté 2026",
      },
      {
        label: "Fake sex abuse claims get British woman 8.5 year prison term",
        publisher: "Associated Press",
        url: "https://apnews.com/article/uk-fake-sex-abuse-claims-racial-tensions-8207569f6809f03f159e518065fcf26d",
        date: "2023",
      },
      {
        label: "Misconceptions of sexual crimes against adult victims: Barriers to justice",
        publisher: "Australian Institute of Criminology",
        url: "https://www.aic.gov.au/sites/default/files/2020-11/ti611_misconceptions_of_sexual_crimes_against_adult_victims.pdf",
        date: "2020",
      },
      {
        label: "Rapport d'information sur l'imprescriptibilité des violences commises sur les mineurs",
        publisher: "Assemblée nationale",
        url: "https://www.assemblee-nationale.fr/dyn/opendata/RINFANR5L17B2685.html",
        date: "2025",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "Cette fiche ne mesure pas une peur universelle chez toutes les femmes ou tous les hommes. Elle met en regard deux phénomènes distincts: un risque féminin documenté d'agression sexuelle par partenaire, connaissance ou rencontre, et une peur masculine d'accusation fausse ou contestée, socialement visible malgré la faible proportion estimée de faux signalements. L'ancienneté des faits peut compliquer l'établissement judiciaire pour les deux parties: preuves matérielles plus rares, souvenirs et témoins moins accessibles, corroboration plus difficile pour la plaignante et défense plus difficile pour la personne mise en cause. Les sources de procédure insistent sur une évaluation fondée sur les preuves, le contradictoire et la compréhension des délais de révélation, sans remplacer la preuve par l'émotion ou par des stéréotypes.",
  },
  {
    id: "femmes-mutilations-genitales",
    side: "femmes",
    domain: "Autonomie",
    title: "Filles et femmes victimes de mutilations génitales",
    metric: "230 M+",
    summary:
      "L'UNICEF estime que plus de 230 millions de filles et femmes ont subi une mutilation génitale féminine.",
    tags: ["autonomie corporelle", "santé", "violences", "monde"],
    source: {
      label: "Female genital mutilation: a global concern",
      publisher: "UNICEF Data",
      url: "https://data.unicef.org/resources/female-genital-mutilation-a-global-concern-2024/",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Cette fiche documente une atteinte grave à l'intégrité corporelle. Les contextes culturels n'effacent pas l'enjeu de droits et de santé.",
  },
  {
    id: "femmes-preference-garcons",
    side: "femmes",
    domain: "Droits",
    title: "Filles manquantes liées à la préférence pour les fils",
    metric: "142 M",
    summary:
      "L'UNFPA estime qu'environ 142 millions de filles manquent à cause de la préférence pour les fils, de la sélection sexuelle et de formes de négligence.",
    tags: ["droits", "enfance", "discrimination", "monde"],
    source: {
      label: "Son preference",
      publisher: "UNFPA",
      url: "https://www.unfpa.org/son-preference",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le chiffre renvoie à des déséquilibres démographiques et sociaux, pas à une caractéristique biologique des filles ou des garçons.",
  },
  {
    id: "femmes-filles-hors-ecole",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Éducation",
    title: "Enfants hors de l'école : estimations mondiales proches selon le sexe",
    metric: "133 M filles vs 140 M garçons",
    summary:
      "Les estimations UNESCO/GEM/UIS indiquent 273 millions d'enfants et jeunes hors de l'école dans le monde, dont 133 millions de filles et 140 millions de garçons.",
    tags: ["femmes", "hommes", "comparaison", "éducation", "jeunesse", "monde"],
    source: {
      label: "Gender equality and education",
      publisher: "UNESCO",
      url: "https://www.unesco.org/en/gender-equality/education",
      date: "consulté 2026",
    },
    additionalSources: [
      {
        label: "Out-of-school rate",
        publisher: "UNESCO / GEM Report / UIS",
        url: "https://www.unesco.org/en/education/view/outofschool",
        date: "consulté 2026",
      },
      {
        label: "Girls' education",
        publisher: "UNICEF",
        url: "https://www.unicef.org/education/girls-education",
        date: "2024",
      },
      {
        label: "Boys' disengagement from education",
        publisher: "UNESCO",
        url: "https://www.unesco.org/en/gender-equality/education/boys",
        date: "consulté 2026",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Les barrières genrées qui touchent les filles varient selon les pays et les niveaux scolaires. Dans le total mondial récent, les estimations UNESCO/GEM/UIS comptent légèrement plus de garçons hors de l'école et les sources signalent aussi des risques de décrochage spécifiques aux garçons.",
  },
  {
    id: "femmes-afghanistan-education",
    side: "femmes",
    domain: "Éducation",
    title: "Adolescentes privées d'enseignement secondaire en Afghanistan",
    metric: "2,2 M",
    summary:
      "L'UNESCO indique qu'en Afghanistan, 2,2 millions d'adolescentes sont privées d'enseignement secondaire depuis les restrictions imposées par les autorités talibanes, qui inscrivent leurs politiques dans leur interprétation de la charia et d'un système islamique dit pur.",
    tags: ["éducation", "droits", "Afghanistan", "jeunesse", "religieux"],
    source: {
      label: "Afghanistan's education crisis threatens future of entire generation",
      publisher: "UNESCO",
      url: "https://www.unesco.org/en/articles/new-report-warns-afghanistans-education-crisis-threatens-future-entire-generation",
      date: "2024",
    },
    additionalSources: [
      {
        label: "UNAMA report on the PVPV law",
        publisher: "UNAMA",
        url: "https://unama.unmissions.org/sites/default/files/unama_pvpv_report_10_april_2025_english.pdf",
        date: "2025",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "C'est un cas national extrême d'exclusion scolaire fondée sur le sexe. La cause documentée est institutionnelle et politico-religieuse: l'autorité talibane impose sa lecture de la charia. Il ne faut donc pas l'attribuer aux hommes comme sexe, ni la généraliser à tous les musulmans ou à tous les pays à majorité musulmane.",
  },
  {
    id: "femmes-mortalite-maternelle",
    side: "femmes",
    domain: "Santé",
    title: "Femmes mortes de causes maternelles évitables",
    metric: "260 000",
    summary:
      "En 2023, environ 260 000 femmes sont mortes pendant ou après une grossesse ou un accouchement, majoritairement de causes évitables.",
    tags: ["santé", "maternité", "mortalité", "monde"],
    source: {
      label: "Maternal mortality",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/news-room/fact-sheets/detail/maternal-mortality",
      date: "2023",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La mortalité maternelle dépend de l'accès aux soins, des conditions sanitaires, des inégalités économiques et de la qualité du suivi obstétrical.",
  },
  {
    id: "femmes-contraception-besoins-non-couverts",
    side: "femmes",
    domain: "Santé",
    title: "Femmes sans contraception moderne malgré un besoin",
    metric: "259 M",
    summary:
      "En 2024, l'UNFPA estime qu'environ 259 millions de femmes et adolescentes voulaient éviter ou retarder une grossesse sans utiliser de contraception moderne fiable.",
    tags: ["santé", "contraception", "droits", "monde"],
    source: {
      label: "Family planning",
      publisher: "UNFPA",
      url: "https://www.unfpa.org/family-planning",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'indicateur parle d'accès effectif à des moyens fiables, pas d'un choix uniforme des femmes concernées.",
  },
  {
    id: "femmes-iran-hijab-obligatoire",
    side: "femmes",
    domain: "Droits",
    title: "Femmes et filles soumises au hijab obligatoire en Iran",
    metric: "actuel",
    summary:
      "En Iran, la République islamique impose aux femmes et filles le hijab et un contrôle vestimentaire, avec des sanctions renforcées ou discutées dans les textes récents. Amnesty relie ces sanctions au droit iranien de la République islamique et à des obligations religieuses invoquées par l'État.",
    tags: ["droits", "Iran", "contrôle vestimentaire", "actuel", "religieux"],
    source: {
      label: "Iran: new compulsory veiling law intensifies oppression of women and girls",
      publisher: "Amnesty International",
      url: "https://www.amnesty.org/en/latest/news/2024/12/iran-new-compulsory-veiling-law-intensifies-oppression-of-women-and-girls/",
      date: "2024",
    },
    additionalSources: [
      {
        label: "Iran: Stop prosecuting women over dress code",
        publisher: "Human Rights Watch",
        url: "https://www.hrw.org/news/2018/02/24/iran-stop-prosecuting-women-over-dress-code",
        date: "2018",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La fiche concerne l'Iran comme régime théocratique et République islamique, pas les hommes comme sexe ni les musulmans en général. La cause documentée est politico-religieuse: l'État codifie et impose une interprétation religieuse du vêtement féminin. Les textes et modalités d'application doivent être suivis dans le temps.",
  },
  {
    id: "femmes-afghanistan-taliban-restrictions",
    side: "femmes",
    domain: "Droits",
    title: "Femmes afghanes exclues de pans entiers de la vie publique",
    metric: "2021+",
    summary:
      "Sous les autorités de facto talibanes, les femmes et filles subissent des restrictions sur l'éducation, le travail, la mobilité et la couverture du visage hors du domicile. UNAMA décrit ces règles comme liées à la volonté talibane d'imposer sa vision d'un système islamique et sa lecture de la charia.",
    tags: ["droits", "Afghanistan", "contrôle vestimentaire", "éducation", "religieux"],
    source: {
      label: "UNAMA report on the PVPV law",
      publisher: "UNAMA",
      url: "https://unama.unmissions.org/sites/default/files/unama_pvpv_report_10_april_2025_english.pdf",
      date: "2025",
    },
    additionalSources: [
      {
        label: "Afghanistan: focus on gender equality and women's rights",
        publisher: "ONU Femmes",
        url: "https://www.unwomen.org/en/articles/in-focus/afghanistan",
        date: "2026",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La fiche vise l'Afghanistan sous autorité talibane, pas les hommes comme sexe ni une religion ou une région entière. Les restrictions sont le produit d'un régime islamiste qui transforme une interprétation religieuse en normes d'État, appliquées par des institutions politiques et policières.",
  },
  {
    id: "femmes-arabie-saoudite-reformes-tutelle",
    side: "femmes",
    domain: "Droits",
    title: "Saoudiennes encore touchées par des restrictions de tutelle",
    metric: "2018/2019",
    summary:
      "L'Arabie saoudite a levé l'interdiction de conduire pour les femmes en 2018 et réformé en 2019 certaines restrictions de voyage pour les femmes de plus de 21 ans, mais des restrictions de tutelle persistent dans plusieurs domaines. HRW rappelle que le pays applique son interprétation de la charia comme droit national.",
    tags: ["droits", "Arabie saoudite", "partiellement réformé", "mobilité", "religieux"],
    source: {
      label: "Saudi Arabia: Important advances for Saudi women",
      publisher: "Human Rights Watch",
      url: "https://www.hrw.org/news/2019/08/02/saudi-arabia-important-advances-saudi-women",
      date: "2019",
    },
    additionalSources: [
      {
        label: "World Report 2021: Saudi Arabia",
        publisher: "Human Rights Watch",
        url: "https://www.hrw.org/world-report/2021/country-chapters/saudi-arabia",
        date: "2021",
      },
      {
        label: "Saudi Arabia: Law Enshrines Male Guardianship",
        publisher: "Human Rights Watch",
        url: "https://www.hrw.org/news/2023/03/08/saudi-arabia-law-enshrines-male-guardianship",
        date: "2023",
      },
      {
        label: "Saudi Arabia: New Personal Status Law Codifies Discrimination Against Women",
        publisher: "Amnesty International",
        url: "https://www.amnesty.org/en/wp-content/uploads/2024/01/MDE2364312023ENGLISH.pdf",
        date: "2023",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Le statut est partiellement réformé: ne pas présenter l'Arabie saoudite de 2026 comme identique à l'Iran ou à l'Afghanistan sans source actuelle précise. La cause documentée est un système juridique et politique qui incorpore une interprétation de la charia et de la tutelle masculine, pas une disposition naturelle des hommes comme sexe.",
  },
  {
    id: "femmes-etats-unis-dobbs-avortement",
    side: "femmes",
    domain: "Santé",
    title: "Américaines face à un accès à l'avortement très variable",
    metric: "2022+",
    summary:
      "Depuis Dobbs v. Jackson Women's Health Organization en 2022, les États américains peuvent interdire, restreindre ou protéger l'accès à l'avortement, ce qui rend l'accès très variable selon le lieu.",
    tags: ["santé", "droits", "États-Unis", "variable selon pays"],
    source: {
      label: "Dobbs v. Jackson Women's Health Organization",
      publisher: "Supreme Court of the United States",
      url: "https://www.supremecourt.gov/opinions/21pdf/19-1392_6j37.pdf",
      date: "2022",
    },
    additionalSources: [
      {
        label: "10 Things to Know About Abortion Access Since the Dobbs Decision",
        publisher: "KFF",
        url: "https://www.kff.org/womens-health-policy/10-things-to-know-about-abortion-access-since-the-dobbs-decision/",
        date: "2026",
      },
    ],
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Cette fiche est actuelle mais locale: elle décrit une variabilité entre États américains, pas une interdiction uniforme dans tous les États-Unis.",
  },
  {
    id: "femmes-canada-sterilisations-sans-consentement-autochtones",
    side: "femmes",
    domain: "Autonomie",
    title: "Femmes autochtones au Canada visées par des stérilisations sans consentement",
    metric: "1948-2025",
    summary:
      "Au Canada, des rapports parlementaires et documents fédéraux décrivent des stérilisations forcées ou contraintes touchant particulièrement des femmes autochtones. Une note de Health Canada évoquait en 2019 des litiges portant sur des cas allégués entre 1948 et le présent, et des travaux parlementaires rapportaient encore des incidents signalés en 2025.",
    tags: ["autonomie", "Canada", "santé", "consentement", "femmes autochtones"],
    source: {
      label: "The Scars that We Carry: Forced and Coerced Sterilization of Persons in Canada - Part II",
      publisher: "Standing Senate Committee on Human Rights",
      url: "https://publications.gc.ca/site/eng/9.913511/publication.html",
      date: "2022",
    },
    additionalSources: [
      {
        label: "Question Period Note: FORCED AND COERCED STERILIZATION",
        publisher: "Health Canada",
        url: "https://search.open.canada.ca/qpnotes/record/hc-sc%2CHC-2019-QP-00010",
        date: "2019",
      },
      {
        label: "Evidence No. 26 - Bill S-228 and forced or coerced sterilization",
        publisher: "Standing Committee on Indigenous and Northern Affairs",
        url: "https://publications.gc.ca/collections/collection_2026/parl/xc35-1/XC35-1-2-451-26-eng.pdf",
        date: "2026",
      },
    ],
    confidence: "forte",
    lastChecked: "25 juin 2026",
    nuance:
      "La fiche porte sur l'absence de consentement libre, préalable et éclairé dans des contextes médicaux, pas sur la stérilisation volontaire ni sur l'ensemble des politiques de contraception. Les travaux cités soulignent que d'autres groupes ont aussi été touchés, mais que les femmes autochtones reviennent de façon centrale dans les témoignages, les études parlementaires et les réponses publiques. Les sources documentent des signalements, enquêtes, litiges et témoignages, pas une mesure exhaustive de prévalence nationale.",
    translations: {
      en: {
        title: "Indigenous women in Canada targeted by non-consensual sterilizations",
        summary:
          "In Canada, parliamentary reports and federal documents describe forced or coerced sterilizations particularly affecting Indigenous women. A Health Canada note referred in 2019 to litigation over alleged cases between 1948 and the present, and parliamentary work still reported incidents raised in 2025.",
        nuance:
          "This entry concerns the absence of free, prior and informed consent in medical contexts, not voluntary sterilization or all contraception policies. The cited work notes that other groups were also affected, but Indigenous women are central in testimony, parliamentary studies and public responses. The sources document reports, investigations, litigation and testimony, not an exhaustive measure of national prevalence.",
        sourcePopulation: "Indigenous women and other persons affected by forced or coerced sterilization in Canada",
      },
    },
  },
  {
    id: "femmes-avortement-non-securise",
    side: "femmes",
    domain: "Santé",
    title: "Décès liés aux avortements non sécurisés",
    metric: "39 000/an",
    summary:
      "L'OMS indique que les avortements non sécurisés causent environ 39 000 décès par an et des millions d'hospitalisations évitables.",
    tags: ["santé", "droits", "mortalité", "monde"],
    source: {
      label: "Access to safe abortion critical for health of women and girls",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/news/item/09-03-2022-access-to-safe-abortion-critical-for-health-of-women-and-girls",
      date: "2022",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La fiche porte sur les conséquences sanitaires de l'absence d'accès sécurisé, indépendamment des débats juridiques et moraux nationaux.",
  },
  {
    id: "femmes-regles-cout-douleurs-ecole-sport",
    side: "femmes",
    domain: "Santé",
    title: "Règles : coût, douleurs et adaptations scolaires ou sportives",
    metric: "3 800 € / 40 %",
    summary:
      "Une estimation du Monde chiffre les protections et antidouleurs à environ 7,50 euros par cycle moyen, soit près de 3 800 euros sur une vie, hors consultations ou linge abîmé. En France, une étude relayée par l'Inserm indique qu'environ 90 % des femmes réglées de 18 à 49 ans déclarent des douleurs de règles et 40 % des douleurs modérées à sévères. Une synthèse 2024 sur activité physique et menstruations identifie aussi des barrières liées au cycle: douleur, inconfort, tabou, manque de connaissances, ressources insuffisantes et communication limitée avec les encadrants.",
    tags: ["santé", "règles", "douleur", "éducation", "sport", "coût", "France"],
    source: {
      label: "Combien les règles coûtent-elles dans la vie d'une femme ?",
      publisher: "Le Monde - Les Décodeurs",
      url: "https://www.lemonde.fr/les-decodeurs/article/2019/07/02/precarite-menstruelle-combien-coutent-ses-regles-dans-la-vie-d-une-femme_5484140_4355770.html",
      date: "2019",
    },
    additionalSources: [
      {
        label: "28 mai 2026 : Journée mondiale de l'hygiène menstruelle",
        publisher: "Ministère chargé de l'Égalité entre les femmes et les hommes",
        url: "https://www.egalite-femmes-hommes.gouv.fr/28-mai-2026-journee-mondiale-de-lhygiene-menstruelle",
        date: "2026",
      },
      {
        label: "C'est normal d'avoir mal pendant les règles, vraiment ?",
        publisher: "Inserm",
        url: "https://presse.inserm.fr/canal-detox/cest-normal-davoir-mal-pendant-les-regles-vraiment/",
        date: "2023",
      },
      {
        label: "Supporting women, girls and people who menstruate to participate in physical activity",
        publisher: "Health and Care Research Wales Evidence Centre / Cardiff University",
        url: "https://orca.cardiff.ac.uk/id/eprint/172396/1/Post-print_RES0035_HCRW-EC_Supporting%20people%20who%20menstruate_July%202024.pdf",
        date: "2024",
      },
      {
        label: "Omega-3 long chain polyunsaturated fatty acids as a potential treatment for reducing dysmenorrhoea pain",
        publisher: "Journal of Human Nutrition and Dietetics / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/37545015/",
        date: "2023",
      },
      {
        label: "Rapport d'information sur les menstruations",
        publisher: "Assemblée nationale",
        url: "https://www.assemblee-nationale.fr/dyn/15/rapports/ega/l15b2691_rapport-information",
        date: "2020",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "Le coût de 3 800 euros est une estimation basse fondée sur des hypothèses de cycle, de protections et d'antidouleurs; il varie selon les produits, le flux, l'âge des premières et dernières règles, les soins et les protections réutilisables. Toutes les personnes réglées ne ressentent pas les mêmes douleurs et le sport peut réduire certaines douleurs légères à modérées, mais les symptômes forts ne doivent pas être banalisés. Les pistes nutritionnelles, comme les oméga-3 ou une alimentation moins inflammatoire, existent dans la littérature mais ne remplacent pas l'accès à l'information, aux protections, à des aménagements raisonnables et à un avis médical en cas de douleurs importantes.",
  },
  {
    id: "femmes-endometriose",
    side: "femmes",
    domain: "Santé",
    title: "Femmes et filles massivement touchées par l'endométriose",
    metric: "190 M",
    summary:
      "L'OMS estime que l'endométriose touche environ 190 millions de femmes et filles en âge de procréer.",
    tags: ["santé", "douleur", "diagnostic", "monde"],
    source: {
      label: "Endometriosis",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/news-room/fact-sheets/detail/endometriosis",
      date: "2023",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'endométriose est souvent diagnostiquée tardivement. Le chiffre ne couvre pas toute l'expérience des douleurs et pertes de qualité de vie.",
  },
  {
    id: "femmes-menopause-soins",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Santé",
    title: "Soins sexospécifiques insuffisants des deux côtés",
    metric: "accès inégal",
    summary:
      "L'OMS souligne que l'information et l'accès aux soins liés à la ménopause restent insuffisants dans beaucoup de pays. Mais ce constat ne prouve pas un désavantage global féminin dans le recours aux soins: en France, l'Insee/Drees indique que les hommes consultent moins souvent médecins généralistes et spécialistes, et l'OCDE rappelle leur surmortalité prématurée.",
    tags: ["santé", "ménopause", "prévention", "soins", "femmes", "hommes"],
    source: {
      label: "Menopause fact sheet",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/news-room/fact-sheets/detail/menopause",
      date: "2024",
    },
    additionalSources: [
      {
        label: "Santé et recours aux soins",
        publisher: "Insee / Drees",
        url: "https://www.insee.fr/fr/statistiques/6047751?sommaire=6047805",
        date: "2022",
      },
      {
        label: "Which diseases affect men and women differently - and why this matters",
        publisher: "OCDE",
        url: "https://www.oecd.org/en/publications/2025/11/health-at-a-glance-2025_a894f72e/full-report/which-diseases-affect-men-and-women-differently-and-why-this-matters_c7602de9.html",
        date: "2025",
      },
      {
        label: "Dépistage du cancer de la prostate",
        publisher: "Institut national du cancer",
        url: "https://www.cancer.fr/professionnels-de-sante/prevention-et-depistages/depistage-et-detection-precoce/depistage-du-cancer-de-la-prostate",
        date: "consulté 2026",
      },
      {
        label: "Dépistage des cancers du sein",
        publisher: "Institut national du cancer",
        url: "https://jefaismondepistage.cancer.fr/cancers-du-sein/",
        date: "consulté 2026",
      },
      {
        label: "Movember men's health cause",
        publisher: "Movember",
        url: "https://us.movember.com/about/cause",
        date: "consulté 2026",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "La ménopause reste un angle documenté de sous-information et de formation médicale insuffisante. Sur le recours aux soins en général, les sources françaises indiquent que les hommes consultent moins souvent, sont moins captés par certains parcours de prévention et subissent une mortalité prématurée plus forte. L'absence de dépistage organisé du cancer de la prostate relève aussi d'une balance bénéfice-risque jugée insuffisante par les autorités, pas seulement d'un manque d'attention ou de budget.",
  },
  {
    id: "femmes-soin-non-remunere-emploi",
    side: "femmes",
    domain: "Travail",
    title: "Femmes tenues hors de l'emploi par le soin non rémunéré",
    metric: "708 M",
    summary:
      "L'OIT estime que 708 millions de femmes sont hors du marché du travail à cause de responsabilités de soin non rémunérées.",
    tags: ["travail", "famille", "soin", "monde"],
    source: {
      label: "Unpaid care work prevents 708 million women from participating in labour market",
      publisher: "Organisation internationale du Travail",
      url: "https://www.ilo.org/resource/news/unpaid-care-work-prevents-708-million-women-participating-labour-market",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le soin non rémunéré a une valeur sociale réelle. L'enjeu est sa répartition, sa reconnaissance et son impact sur l'autonomie économique.",
  },
  {
    id: "femmes-charge-domestique-soin",
    side: "femmes",
    domain: "Famille",
    title: "Femmes assumant beaucoup plus de soin non rémunéré",
    metric: "2,5x",
    summary:
      "ONU Femmes indique que les femmes et les filles passent plus de 2,5 fois plus de temps que les hommes au travail de soin non rémunéré.",
    tags: ["famille", "travail", "soin", "monde"],
    source: {
      label: "Care: a critical investment for gender equality",
      publisher: "ONU Femmes",
      url: "https://www.unwomen.org/en/news-stories/statement/2024/10/care-a-critical-investment-for-gender-equality-and-the-rights-of-women-and-girls",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le temps domestique varie selon les ménages et les pays. L'indicateur rend visible une charge souvent absente des revenus monétaires.",
  },
  {
    id: "femmes-droits-economiques-monde",
    side: "femmes",
    domain: "Droits",
    title: "Femmes privées d'une égalité complète de droits économiques",
    metric: "2/3",
    summary:
      "Selon Women, Business and the Law 2026, les femmes n'ont encore qu'environ deux tiers des droits économiques des hommes et 4 % vivent dans des économies proches de l'égalité juridique complète.",
    tags: ["droits", "économie", "travail", "monde"],
    source: {
      label: "Women, Business and the Law 2026",
      publisher: "Banque mondiale",
      url: "https://wbl.worldbank.org/en/publications/flagship-report",
      date: "2026",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La mesure porte sur les droits formels et leur environnement légal. L'application réelle peut être meilleure ou pire selon les institutions.",
  },
  {
    id: "femmes-representation-politique-monde",
    side: "femmes",
    domain: "Droits",
    title: "Femmes sous-représentées dans le pouvoir politique mondial",
    metric: "27,5 %",
    summary:
      "En 2026, les femmes occupent 27,5 % des sièges parlementaires mondiaux et environ un pays sur sept est dirigé par une femme.",
    tags: ["droits", "politique", "représentation", "monde"],
    source: {
      label: "Only 1 in 7 countries is led by a woman",
      publisher: "ONU Femmes",
      url: "https://www.unwomen.org/en/news-stories/press-release/2026/03/only-1-in-7-countries-is-led-by-a-woman-as-global-political-power-remains-dominated-by-men",
      date: "2026",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La représentation politique ne suffit pas à mesurer l'égalité, mais elle influence les priorités publiques et la visibilité des enjeux.",
  },
  {
    id: "femmes-dirigeantes-paix-essentialisme",
    side: "femmes",
    angle: "récit_sur_le_sexe",
    domain: "Conflits",
    title: "Dirigeantes femmes : le pouvoir n'implique pas automatiquement la paix",
    metric: "+27 %",
    summary:
      "Une étude NBER sur des monarchies européennes de 1480 à 1913 estime que les États gouvernés par des reines étaient 27 % plus susceptibles de participer à des guerres interétatiques que ceux gouvernés par des rois. Des exemples comme Catherine de Médicis lors de la Saint-Barthélemy ou Ranavalona I à Madagascar rappellent aussi que des femmes au pouvoir ont pu être associées à des violences politiques.",
    tags: ["conflits", "pouvoir", "récit", "historique"],
    source: {
      label: "Queens: Working Paper 23337",
      publisher: "NBER",
      url: "https://www.nber.org/system/files/working_papers/w23337/w23337.pdf",
      date: "2017",
    },
    additionalSources: [
      {
        label: "Massacre of St. Bartholomew's Day",
        publisher: "Britannica",
        url: "https://www.britannica.com/event/Massacre-of-Saint-Bartholomews-Day",
        date: "consulté 2026",
      },
      {
        label: "Ranavalona I",
        publisher: "Britannica",
        url: "https://www.britannica.com/biography/Ranavalona-I",
        date: "consulté 2026",
      },
      {
        label: "Operation Blue Star",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/Operation-Blue-Star",
        date: "2024",
      },
    ],
    confidence: "moyenne",
    lastChecked: "16 juin 2026",
    nuance:
      "La fiche compare des cas de pouvoir politique féminin à des épisodes de guerre ou de violence politique. Les résultats historiques européens ne se transposent pas mécaniquement aux démocraties contemporaines, et les responsabilités individuelles doivent être lues dans leur contexte institutionnel.",
  },
  {
    id: "femmes-espaces-non-mixtes-sexe",
    side: "femmes",
    domain: "Droits",
    title: "Espaces féminins non mixtes redéfinis par le sexe au Royaume-Uni",
    metric: "2025/2026",
    summary:
      "Après l'arrêt For Women Scotland du 16 avril 2025, l'EHRC indique que, pour l'Equality Act 2010, le sexe doit être interprété comme le sexe biologique enregistré à la naissance, même en cas de Gender Recognition Certificate. Son projet de code 2026 précise que des services peuvent demander la confirmation du sexe pour assurer une prestation séparée ou non mixte légale.",
    tags: ["droits", "espaces non mixtes", "Royaume-Uni", "actuel"],
    source: {
      label: "UK Supreme Court ruling on the meaning of sex in the Equality Act: our work",
      publisher: "Equality and Human Rights Commission",
      url: "https://www.equalityhumanrights.com/our-work/uk-supreme-court-ruling-meaning-sex-equality-act-our-work",
      date: "2026",
    },
    additionalSources: [
      {
        label: "Code of practice for services, public functions and associations",
        publisher: "Equality and Human Rights Commission",
        url: "https://www.equalityhumanrights.com/equality/equality-act-2010/codes-practice/code-practice-services-public-functions-and-0",
        date: "2026",
      },
    ],
    confidence: "forte",
    lastChecked: "16 juin 2026",
    nuance:
      "Cette fiche documente une asymétrie juridique et pratique autour de la non-mixité, de la vie privée, de la dignité et de la sécurité. Elle ne dit pas que les personnes trans seraient dangereuses par nature; elle signale que l'accès fondé sur l'identité de genre peut retirer aux femmes une garantie fondée sur le sexe dans certains espaces.",
  },
  {
    id: "femmes-traite-humaine",
    side: "femmes",
    domain: "Violences",
    title: "Femmes et filles majoritaires parmi les victimes de traite détectées",
    metric: "61 %",
    summary:
      "En 2022, l'UNODC indique que les femmes et filles représentaient 61 % des victimes de traite détectées dans le monde, les filles étant souvent exploitées sexuellement.",
    tags: ["violences", "traite humaine", "exploitation", "monde"],
    source: {
      label: "Global human trafficking report: detected victims up 25 per cent",
      publisher: "UNODC",
      url: "https://www.unodc.org/unodc/en/press/releases/2024/December/unodc-global-human-trafficking-report_-detected-victims-up-25-per-cent-as-more-children-are-exploited-and-forced-labour-cases-spike.html",
      date: "2022",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Les victimes détectées ne représentent pas toute la traite. Les formes d'exploitation diffèrent selon l'âge, le sexe, la région et le contrôle policier.",
  },
  {
    id: "femmes-violence-numerique",
    side: "femmes",
    domain: "Numérique",
    title: "Femmes visées par les violences facilitées par la technologie",
    metric: "16-58 %",
    summary:
      "Les études compilées par ONU Femmes estiment que 16 % à 58 % des femmes ont subi des violences facilitées par la technologie.",
    tags: ["numérique", "violences", "harcèlement", "monde"],
    source: {
      label: "Digital abuse, trolling, stalking and other forms of technology-facilitated violence",
      publisher: "ONU Femmes",
      url: "https://www.unwomen.org/en/articles/faqs/digital-abuse-trolling-stalking-and-other-forms-of-technology-facilitated-violence-against-women",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La fourchette large reflète des définitions et méthodes différentes. Le phénomène doit être lu avec prudence mais il est suffisamment documenté pour être visible.",
  },
];

const sourcePopulationLabels: Record<string, string> = {
  "hommes-accidents-travail":
    "Population mesurée par la source : sexe masculin / hommes, selon la sinistralité au travail. La source ne mesure pas les chromosomes.",
  "hommes-suicide":
    "Population mesurée par la source : hommes dans les statistiques françaises de décès. La source ne mesure pas les chromosomes.",
  "hommes-esperance-vie":
    "Population mesurée par la source : hommes et femmes dans les statistiques démographiques Insee. La source ne mesure pas les chromosomes.",
  "hommes-pensions-alimentaires":
    "Population mesurée par la source : père / parent débiteur dans des décisions de justice. La source ne mesure pas les chromosomes.",
  "hommes-residence-alternee":
    "Population mesurée par la source : enfants de parents séparés et situation parentale, l'asymétrie père/mère vient de publications statistiques. La source ne mesure pas les chromosomes.",
  "hommes-femme-principale-pourvoyeuse-satisfaction":
    "Population mesurée par les sources : personnes en couple hétérosexuel interrogées dans 9 pays européens dans l'European Social Survey (2004-2018), couples mariés co-résidents dans le UK Household Longitudinal Study et couples observés dans des données administratives françaises sur les séparations. Les sources utilisent les catégories women/men et ne mesurent pas les chromosomes.",
  "hommes-filiation-paternite-test-adn-judiciaire":
    "Population mesurée par les sources : personnes concernées par une procédure française de filiation, de contestation de paternité ou de test de paternité. Les sources juridiques ne mesurent pas les chromosomes.",
  "hommes-panama-fraude-paternite-crime-2026":
    "Population mesurée par les sources : personnes concernées par la reconnaissance de paternité, la filiation et le droit pénal panaméens. Les sources juridiques ne mesurent pas les chromosomes.",
  "hommes-sorties-precoces":
    "Population mesurée par la source : hommes et femmes de 18 à 24 ans. La source ne mesure pas les chromosomes.",
  "hommes-bourses-stem-reservees-femmes":
    "Population mesurée par les sources : candidates et bénéficiaires de programmes STEM ciblant les femmes, et étudiants dans les règles générales des bourses publiques. Les sources ne mesurent pas les chromosomes.",
  "hommes-esperance-vie-monde":
    "Population mesurée par la source : female-male difference / males dans les séries internationales. La source ne mesure pas les chromosomes.",
  "hommes-suicide-monde":
    "Population mesurée par la source : males / hommes dans les estimations OMS. La source ne mesure pas les chromosomes.",
  "hommes-victimes-homicide-monde":
    "Population mesurée par la source : men and boys / hommes et garçons dans les données homicide. La source ne mesure pas les chromosomes.",
  "hommes-mortalite-travail-monde":
    "Population mesurée par la source : men / women dans les estimations OIT. La source ne mesure pas les chromosomes.",
  "hommes-accidents-route-monde":
    "Population mesurée par la source : males / females dans la fiche OMS. La source ne mesure pas les chromosomes.",
  "hommes-conscription":
    "Population mesurée par la source : men / males selon les règles nationales recensées, à vérifier pays par pays. La source ne mesure pas les chromosomes.",
  "hommes-population-carcerale-monde":
    "Population mesurée par la source : men / male prisoners dans le brief UNODC. La source ne mesure pas les chromosomes.",
  "hommes-decrochage-garcons-monde":
    "Population mesurée par les sources : boys / garçons et girls / filles hors de l'école, redoublement et achèvement scolaire selon UNESCO/GEM/UIS. Les sources ne mesurent pas les chromosomes.",
  "hommes-sans-abrisme":
    "Population mesurée par la source : men / women selon les définitions nationales du sans-abrisme. La source ne mesure pas les chromosomes.",
  "hommes-violence-partenaire-etats-unis":
    "Population mesurée par la source : men / male victims dans l'enquête CDC. La source ne mesure pas les chromosomes.",
  "hommes-violence-domestique-royaume-uni":
    "Population mesurée par la source : males / females âgés de 16 ans et plus dans le CSEW. La source ne mesure pas les chromosomes.",
  "hommes-violences-conjugales-aides-specialisees":
    "Population mesurée par les sources : femmes et hommes victimes de violences conjugales, usagers de dispositifs d'aide aux victimes, victimes masculines accompagnées par des services locaux, places d'hébergement sûr au Royaume-Uni, et cas historiques Erin Pizzey/Earl Silverman. Les sources ne mesurent pas les chromosomes.",
  "hommes-agressions-sexuelles-minimisees":
    "Population mesurée par les sources : hommes et femmes adultes interrogés sur ce qui constitue une agression sexuelle, puis victimes hommes et femmes dans des études complémentaires. Les sources ne mesurent pas les chromosomes.",
  "hommes-violences-sexuelles-sous-declaration":
    "Population mesurée par les sources : hommes victimes de violences sexuelles dans l'enquête NCVS américaine, échantillons masculins et féminins de survivants au Canada, et victimes de viol en Angleterre et au pays de Galles. Les sources ne mesurent pas les chromosomes.",
  "hommes-viol-force-penetration-2018":
    "Population mesurée par les sources : textes du droit pénal français et versions successives de l'article 222-23 du Code pénal. Les sources ne mesurent pas les chromosomes.",
  "hommes-mis-en-cause-violences-conjugales-france":
    "Population mesurée par la source : personnes mises en cause femmes/hommes par les services de sécurité français. La source ne mesure pas les chromosomes.",
  "hommes-agresseurs-declares-violences-sexuelles-femmes-france":
    "Population mesurée par la source : femmes victimes de viols, tentatives de viol ou agressions sexuelles ayant renseigné le sexe du ou des agresseurs dans l'enquête VRS 2024 du SSMSI. La source ne mesure pas les chromosomes.",
  "hommes-sexisme-hostile-hce-2025":
    "Population mesurée par la source : personnes de 15 ans et plus en France, avec comparaison hommes/femmes dans le baromètre HCE/Toluna Harris de novembre 2025. La source ne mesure pas les chromosomes.",
  "hommes-femmes-sexisme-paternaliste-hce-2025":
    "Population mesurée par la source : personnes de 15 ans et plus en France, avec comparaison hommes/femmes dans le baromètre HCE/Toluna Harris de novembre 2025. La source ne mesure pas les chromosomes.",
  "hommes-consentement-rapports-sexuels-hce-2025":
    "Population mesurée par la source : hommes interrogés en France dans le baromètre HCE/Toluna Harris de novembre 2025. La source ne mesure pas les chromosomes.",
  "hommes-recits-antifeministes-hce-2025":
    "Population mesurée par la source : personnes interrogées en France dans le baromètre HCE/Toluna Harris de novembre 2025, avec plusieurs items rapportés pour les hommes et une comparaison hommes/femmes. La source ne mesure pas les chromosomes.",
  "hommes-vocabulaire-masculinisme-pejoratif":
    "Population mesurée par les sources : entrées de dictionnaires et de terminologie pour les mots français masculinisme, féminisme, misogyne et misandre, rapports publics 2026 du HCE et du Sénat sur les usages institutionnels de masculinisme, ainsi que prises de position publiques d'organisations féministes ou pro-féministes sur les pères, le congé parental et le soin. Ces sources ne mesurent pas les chromosomes.",
  "hommes-perception-garde-enfants-hce-2025":
    "Population mesurée par les sources : personnes interrogées en France sur les perceptions de la justice familiale, et demandes de pères étudiées par le ministère de la Justice. Les sources ne mesurent pas les chromosomes.",
  "hommes-attribution-laxisme-justice-violences-sexuelles":
    "Population mesurée par les sources : juges professionnels, procureurs, personnels des tribunaux et parquets, greffiers et directeurs des services de greffe dans les statistiques françaises de justice. Les sources ne mesurent pas les chromosomes.",
  "hommes-sanctions-penales-plus-lourdes":
    "Population mesurée par les sources : femmes et hommes mis en cause, poursuivis ou condamnés dans les statistiques pénales françaises, et personnes arrêtées ou condamnées dans les affaires fédérales américaines. Les sources ne mesurent pas les chromosomes.",
  "hommes-conge-paternite-ocde":
    "Population mesurée par la source : fathers / pères dans les politiques de congé. La source ne mesure pas les chromosomes.",
  "hommes-autonomie-corporelle-circoncision":
    "Population mesurée par la source : male circumcision / males dans les estimations de prévalence. La source ne mesure pas les chromosomes.",
  "hommes-deces-professionnels-etats-unis-2024":
    "Population mesurée par la source : women / men dans le recensement BLS des décès professionnels. La source ne mesure pas les chromosomes.",
  "hommes-ukraine-restrictions-sortie-2022-2025":
    "Population mesurée par les sources : men / male Ukrainian citizens d'âge militaire. La source ne mesure pas les chromosomes.",
  "femmes-ecart-salaire":
    "Population mesurée par la source : femmes et hommes dans les statistiques salariales Insee. La source ne mesure pas les chromosomes.",
  "hommes-femmes-taxe-rose-prix-genres":
    "Population mesurée par les sources : produits et services genrés comparés en France et aux États-Unis, avec catégories destinées aux femmes et aux hommes. Les sources ne mesurent pas les chromosomes.",
  "femmes-temps-partiel":
    "Population mesurée par les sources : femmes et hommes en emploi dans les statistiques Insee, et parents salariés interrogés sur l'accès perçu aux arrangements de travail flexibles. Les sources ne mesurent pas les chromosomes.",
  "femmes-violences-conjugales":
    "Population mesurée par la source : victimes femmes/hommes enregistrées par les services de sécurité. La source ne mesure pas les chromosomes.",
  "femmes-violences-sexuelles":
    "Population mesurée par la source : femmes majeures vivant en logement ordinaire dans le champ de l'enquête de victimation VRS. La source ne mesure pas les chromosomes.",
  "femmes-perception-desavantage-hce-2025":
    "Population mesurée par la source : personnes de 15 ans et plus en France, avec comparaisons hommes/femmes et par âge dans le baromètre HCE/Toluna Harris de novembre 2025. La source ne mesure pas les chromosomes.",
  "femmes-violences-sexuelles-transports-hce-2025":
    "Population mesurée par les sources : femmes interrogées sur leur traitement dans l'espace public et victimes enregistrées de violences sexistes ou sexuelles dans les transports en commun. Les sources ne mesurent pas les chromosomes.",
  "femmes-sport-inegalites-hce-2025":
    "Population mesurée par les sources : personnes interrogées sur le sport en France, femmes déclarant une expérience personnelle, données de rémunération de la branche sport et revenus internationaux du sport d'élite. Les sources ne mesurent pas les chromosomes.",
  "femmes-cybersexisme-hce-2025":
    "Population mesurée par la source : victimes et répondants dans les données citées par le HCE sur le cybersexisme et la haine en ligne. La source ne mesure pas les chromosomes.",
  "femmes-deepfakes-sexuels-hce-2025":
    "Population mesurée par les sources : personnes visées par des contenus de deepfake ou hypertrucage sexuel, et personnes protégées par le droit pénal français. Les sources ne mesurent pas les chromosomes.",
  "femmes-inegalites-familiales-hce-2025":
    "Population mesurée par la source : personnes interrogées en France dans le baromètre HCE/Toluna Harris de novembre 2025, avec comparaisons femmes/hommes et items d'opinion. La source ne mesure pas les chromosomes.",
  "femmes-vecu-situations-sexistes-hce-2025":
    "Population mesurée par la source : femmes interrogées en France dans le baromètre HCE/Toluna Harris de novembre 2025. La source ne mesure pas les chromosomes.",
  "femmes-assemblee-nationale-parite-2024":
    "Population mesurée par la source : femmes et hommes élus à l'Assemblée nationale française. La source ne mesure pas les chromosomes.",
  "femmes-homicides-mineurs-condamnations":
    "Population mesurée par la source : femmes et hommes condamnés par la Justice française pour homicide volontaire sur mineur de moins de 15 ans. La source ne mesure pas les chromosomes.",
  "femmes-espaces-non-mixtes-sexe":
    "Population mesurée par la source : femmes, hommes et personnes trans dans le cadre juridique britannique sur les services séparés ou non mixtes. La source raisonne en sexe légal/biologique au sens de l'Equality Act, pas par test chromosomique individuel.",
  "femmes-ingenierie":
    "Population mesurée par les sources : femmes ingénieures et diplômées selon l'enquête IESF, filles et garçons dans les statistiques DEPP de réussite et d'orientation, et bénéficiaires de bourses sur critères sociaux. Les sources ne mesurent pas les chromosomes.",
  "femmes-separation-niveau-vie":
    "Population mesurée par la source : femmes et hommes ayant connu une séparation entre 2014 et 2020, résidant en Occitanie l'année de la séparation et suivis dans l'échantillon démographique permanent de l'Insee. La source mesure le niveau de vie du ménage et les composantes du revenu disponible, pas les chromosomes.",
  "femmes-discrimination-religieuse":
    "Population mesurée par la source : candidate visée par une décision juridique liée au sexe et à la religion. La source ne mesure pas les chromosomes.",
  "femmes-france-droit-vote-1944":
    "Population mesurée par la source : femmes dans l'histoire du droit français. La source ne mesure pas les chromosomes.",
  "femmes-france-compte-bancaire-travail-1965":
    "Population mesurée par la source : femmes mariées dans le droit civil français. La source ne mesure pas les chromosomes.",
  "femmes-france-contraception-1967":
    "Population mesurée par les sources : personnes concernées par le droit français de la contraception et de la régulation des naissances, avec conséquences corporelles et sociales principalement documentées côté femmes. Les sources ne mesurent pas les chromosomes.",
  "femmes-france-ivg-1975-1979":
    "Population mesurée par la source : femmes concernées par le droit à l'IVG en France. La source ne mesure pas les chromosomes.",
  "femmes-violences-physiques-sexuelles-monde":
    "Population mesurée par les sources : femmes dans les enquêtes OMS sur violences conjugales physiques/sexuelles et violences sexuelles hors couple, avec sources comparatives sur victimations, homicides, travail et suicide. Les sources ne mesurent pas les chromosomes.",
  "femmes-prison-victimisation-sexuelle-etats-unis":
    "Population mesurée par la source : female inmates / male inmates dans les prisons d'État et fédérales américaines. La source ne mesure pas les chromosomes.",
  "femmes-feminicides-monde-2024":
    "Population mesurée par la source : women and girls / femmes et filles dans les données UNODC-ONU Femmes. La source ne mesure pas les chromosomes.",
  "femmes-violences-sexuelles-conflits":
    "Population mesurée par les sources : cas vérifiés de violences sexuelles liées aux conflits, victimes civiles par sexe dans les rapports ONU, et cas documentés par l'UE ou Amnesty dans certains conflits. Les sources ne mesurent pas les chromosomes.",
  "femmes-violences-sexuelles-enfance":
    "Population mesurée par la source : girls and women / filles et femmes vivantes selon UNICEF. La source ne mesure pas les chromosomes.",
  "femmes-mariage-enfants":
    "Population mesurée par la source : girls and women / filles et femmes mariées pendant l'enfance. La source ne mesure pas les chromosomes.",
  "femmes-pression-virginite-avant-mariage":
    "Population mesurée par les sources : girls and women / filles et femmes visées par les attentes sociales et pratiques de contrôle liées à la virginité, ainsi qu'adultes interrogés sur les doubles standards sexuels dans certaines enquêtes. Les sources ne mesurent pas les chromosomes.",
  "hommes-femmes-body-count-double-standard":
    "Population mesurée par les sources : participants femmes et hommes à des études sur l'évaluation d'historiques sexuels masculins et féminins, ainsi que corpus de 99 études sur les doubles standards sexuels. Les sources ne mesurent pas les chromosomes.",
  "hommes-femmes-peurs-consentement-sexuel":
    "Population mesurée par les sources : victimes femmes et hommes de violences sexuelles dans l'enquête NISVS, femmes étudiées dans la littérature sur la perception du risque d'agression sexuelle par connaissance, étudiants interrogés sur la peur de fausse accusation, signalements d'agression sexuelle étudiés dans les estimations de faux signalements, et dossiers anciens évoqués dans les sources judiciaires. Les sources ne mesurent pas les chromosomes.",
  "femmes-mutilations-genitales":
    "Population mesurée par la source : girls and women / filles et femmes ayant subi une MGF. La source ne mesure pas les chromosomes.",
  "femmes-preference-garcons":
    "Population mesurée par la source : missing girls / filles manquantes dans les estimations démographiques. La source ne mesure pas les chromosomes.",
  "femmes-filles-hors-ecole":
    "Population mesurée par les sources : filles et garçons hors de l'école selon les estimations UNESCO/GEM/UIS et UNICEF. Les sources ne mesurent pas les chromosomes.",
  "femmes-afghanistan-education":
    "Population mesurée par la source : adolescent girls / adolescentes en Afghanistan. La source ne mesure pas les chromosomes.",
  "femmes-mortalite-maternelle":
    "Population mesurée par la source : women mortes pendant ou après grossesse/accouchement. La source ne mesure pas les chromosomes.",
  "femmes-contraception-besoins-non-couverts":
    "Population mesurée par la source : women and adolescent girls / femmes et adolescentes. La source ne mesure pas les chromosomes.",
  "femmes-iran-hijab-obligatoire":
    "Population mesurée par la source : women and girls / femmes et filles en Iran. La source ne mesure pas les chromosomes.",
  "femmes-afghanistan-taliban-restrictions":
    "Population mesurée par les sources : women and girls / femmes et filles sous autorité talibane. La source ne mesure pas les chromosomes.",
  "femmes-arabie-saoudite-reformes-tutelle":
    "Population mesurée par les sources : Saudi women / femmes en Arabie saoudite. La source ne mesure pas les chromosomes.",
  "femmes-etats-unis-dobbs-avortement":
    "Population mesurée par les sources : women / personnes cherchant un avortement selon les catégories juridiques. La source ne mesure pas les chromosomes.",
  "femmes-canada-sterilisations-sans-consentement-autochtones":
    "Population mesurée par les sources : personnes ayant subi ou allégué une stérilisation forcée ou contrainte au Canada, avec un accent particulier sur les femmes autochtones dans les témoignages, les litiges et les travaux parlementaires. Les sources ne mesurent pas les chromosomes.",
  "femmes-avortement-non-securise":
    "Population mesurée par la source : women and girls dans la fiche OMS. La source ne mesure pas les chromosomes.",
  "femmes-regles-cout-douleurs-ecole-sport":
    "Population mesurée par les sources : femmes et filles ou personnes menstruées dans des estimations de coût, de douleurs menstruelles, de protections périodiques et de participation à l'activité physique. Les sources ne mesurent pas les chromosomes.",
  "femmes-endometriose":
    "Population mesurée par la source : women and girls of reproductive age / femmes et filles en âge de procréer. La source ne mesure pas les chromosomes.",
  "femmes-menopause-soins":
    "Population mesurée par les sources : femmes concernées par la ménopause selon l'OMS, femmes et hommes dans les statistiques françaises de recours aux soins, et hommes concernés par les enjeux prostate, testicule et santé mentale. Les sources ne mesurent pas les chromosomes.",
  "femmes-soin-non-remunere-emploi":
    "Population mesurée par la source : women / men âgés de 15 ans ou plus hors force de travail pour raisons de soin. La source ne mesure pas les chromosomes.",
  "femmes-charge-domestique-soin":
    "Population mesurée par la source : women and girls / men and boys dans les données ONU Femmes. La source ne mesure pas les chromosomes.",
  "femmes-droits-economiques-monde":
    "Population mesurée par la source : women / men dans les indicateurs juridiques Women, Business and the Law. La source ne mesure pas les chromosomes.",
  "femmes-representation-politique-monde":
    "Population mesurée par la source : women / femmes en responsabilités politiques. La source ne mesure pas les chromosomes.",
  "femmes-dirigeantes-paix-essentialisme":
    "Population mesurée par les sources : reines et femmes dirigeantes dans des travaux historiques et des exemples biographiques. Les sources ne mesurent pas les chromosomes.",
  "femmes-traite-humaine":
    "Population mesurée par la source : women and girls / femmes et filles parmi les victimes détectées. La source ne mesure pas les chromosomes.",
  "femmes-violence-numerique":
    "Population mesurée par la source : women / femmes dans des études aux méthodes variables. La source ne mesure pas les chromosomes.",
};

type ClaimMeta = {
  pays_ou_zone: string;
  regionScope?: string;
  periode_debut: string;
  periode_fin?: string | null;
  statut_temporel: StatutTemporel;
  intensite_contextuelle: string;
  legalType?: string;
};

const claimMetadata: Record<string, ClaimMeta> = {
  "hommes-accidents-travail": {
    pays_ou_zone: "France",
    periode_debut: "2022",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "santé et sécurité au travail",
  },
  "hommes-suicide": {
    pays_ou_zone: "France",
    periode_debut: "2023",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "santé publique",
  },
  "hommes-esperance-vie": {
    pays_ou_zone: "France",
    periode_debut: "2025",
    statut_temporel: "persistant",
    intensite_contextuelle: "moyenne",
    legalType: "démographie",
  },
  "hommes-pensions-alimentaires": {
    pays_ou_zone: "France",
    periode_debut: "2013",
    statut_temporel: "données insuffisantes",
    intensite_contextuelle: "moyenne",
    legalType: "droit familial",
  },
  "hommes-residence-alternee": {
    pays_ou_zone: "France",
    periode_debut: "2023",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "droit familial",
  },
  "hommes-femme-principale-pourvoyeuse-satisfaction": {
    pays_ou_zone: "Royaume-Uni, France et 9 pays européens",
    regionScope: "Europe",
    periode_debut: "2004",
    periode_fin: "2018",
    statut_temporel: "persistant",
    intensite_contextuelle: "moyenne",
    legalType: "revenus relatifs, satisfaction et stabilité du couple",
  },
  "hommes-filiation-paternite-test-adn-judiciaire": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    periode_fin: "2026",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "filiation, contestation de paternité et expertise biologique",
  },
  "hommes-panama-fraude-paternite-crime-2026": {
    pays_ou_zone: "Panama",
    regionScope: "Amérique centrale",
    periode_debut: "2026",
    periode_fin: "2026",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "droit pénal de la filiation et reconnaissance de paternité",
  },
  "hommes-sorties-precoces": {
    pays_ou_zone: "France",
    periode_debut: "2023",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "éducation",
  },
  "hommes-bourses-stem-reservees-femmes": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    periode_fin: "2026",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "aides scolaires et action positive",
  },
  "hommes-decrochage-garcons-monde": {
    pays_ou_zone: "Monde",
    periode_debut: "2024",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "éducation",
  },
  "hommes-accidents-route-monde": {
    pays_ou_zone: "Monde",
    regionScope: "Monde",
    periode_debut: "2026",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "sécurité routière",
  },
  "hommes-deces-professionnels-etats-unis-2024": {
    pays_ou_zone: "États-Unis",
    regionScope: "Amérique du Nord",
    periode_debut: "1970",
    periode_fin: "2024",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "santé et sécurité au travail",
  },
  "hommes-ukraine-restrictions-sortie-2022-2025": {
    pays_ou_zone: "Ukraine",
    regionScope: "Europe",
    periode_debut: "2022",
    periode_fin: "2025",
    statut_temporel: "lié à une crise",
    intensite_contextuelle: "extrême",
    legalType: "loi martiale et mobilité",
  },
  "hommes-violences-conjugales-aides-specialisees": {
    pays_ou_zone: "France, Royaume-Uni et Canada",
    regionScope: "Europe et Amérique du Nord",
    periode_debut: "1971",
    periode_fin: "2025",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "aide aux victimes et violences conjugales",
  },
  "hommes-agressions-sexuelles-minimisees": {
    pays_ou_zone: "États-Unis",
    regionScope: "Amérique du Nord",
    periode_debut: "2017",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "violences sexuelles et perception sociale",
  },
  "hommes-violences-sexuelles-sous-declaration": {
    pays_ou_zone: "États-Unis, Canada et Angleterre/Pays de Galles",
    regionScope: "Amérique du Nord et Europe",
    periode_debut: "1992",
    periode_fin: "2025",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "signalement des violences sexuelles",
  },
  "hommes-viol-force-penetration-2018": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "1994",
    periode_fin: "2018",
    statut_temporel: "partiellement réformé",
    intensite_contextuelle: "forte",
    legalType: "définition pénale du viol",
  },
  "hommes-mis-en-cause-violences-conjugales-france": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2024",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "violences conjugales enregistrées",
  },
  "hommes-agresseurs-declares-violences-sexuelles-femmes-france": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2023",
    periode_fin: "2024",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "viols, tentatives de viol et agressions sexuelles",
  },
  "hommes-sexisme-hostile-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "baromètre d'opinion et stéréotypes sexistes",
  },
  "hommes-femmes-sexisme-paternaliste-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "baromètre d'opinion et stéréotypes sexistes",
  },
  "hommes-consentement-rapports-sexuels-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "baromètre d'opinion, consentement et violences sexuelles",
  },
  "hommes-recits-antifeministes-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "baromètre d'opinion et représentations du féminisme",
  },
  "hommes-vocabulaire-masculinisme-pejoratif": {
    pays_ou_zone: "Francophonie",
    regionScope: "France et Québec",
    periode_debut: "2020",
    periode_fin: "2026",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "lexicographie et représentations publiques",
  },
  "hommes-perception-garde-enfants-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2013",
    periode_fin: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "perception de la justice familiale et résidence des enfants",
  },
  "hommes-attribution-laxisme-justice-violences-sexuelles": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2018",
    periode_fin: "2024",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "composition des personnels de justice et violences sexuelles",
  },
  "hommes-sanctions-penales-plus-lourdes": {
    pays_ou_zone: "France et États-Unis",
    regionScope: "Europe et Amérique du Nord",
    periode_debut: "2011",
    periode_fin: "2022",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "peines pénales et emprisonnement",
  },
  "hommes-femmes-taxe-rose-prix-genres": {
    pays_ou_zone: "France et États-Unis",
    regionScope: "Europe et Amérique du Nord",
    periode_debut: "2015",
    periode_fin: "2018",
    statut_temporel: "persistant",
    intensite_contextuelle: "faible à moyenne",
    legalType: "prix genrés et marketing différencié",
  },
  "femmes-separation-niveau-vie": {
    pays_ou_zone: "Occitanie (France)",
    regionScope: "Europe",
    periode_debut: "2014",
    periode_fin: "2020",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "niveau de vie du ménage après séparation",
  },
  "femmes-france-droit-vote-1944": {
    pays_ou_zone: "France",
    periode_debut: "1789",
    periode_fin: "1945",
    statut_temporel: "historique",
    intensite_contextuelle: "forte",
    legalType: "droits politiques",
  },
  "femmes-france-compte-bancaire-travail-1965": {
    pays_ou_zone: "France",
    periode_debut: "1804",
    periode_fin: "1965",
    statut_temporel: "historique",
    intensite_contextuelle: "forte",
    legalType: "droit civil et bancaire",
  },
  "femmes-france-contraception-1967": {
    pays_ou_zone: "France",
    periode_debut: "1920",
    periode_fin: "1967",
    statut_temporel: "historique",
    intensite_contextuelle: "forte",
    legalType: "santé reproductive",
  },
  "femmes-france-ivg-1975-1979": {
    pays_ou_zone: "France",
    periode_debut: "1920",
    periode_fin: "1979",
    statut_temporel: "historique",
    intensite_contextuelle: "forte",
    legalType: "santé reproductive",
  },
  "femmes-iran-hijab-obligatoire": {
    pays_ou_zone: "Iran",
    regionScope: "Moyen-Orient",
    periode_debut: "1979",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "contrôle vestimentaire",
  },
  "femmes-afghanistan-taliban-restrictions": {
    pays_ou_zone: "Afghanistan",
    regionScope: "Asie centrale",
    periode_debut: "2021",
    statut_temporel: "actuel",
    intensite_contextuelle: "extrême",
    legalType: "contrôle vestimentaire et mobilité",
  },
  "femmes-arabie-saoudite-reformes-tutelle": {
    pays_ou_zone: "Arabie saoudite",
    regionScope: "Moyen-Orient",
    periode_debut: "2018",
    statut_temporel: "partiellement réformé",
    intensite_contextuelle: "moyenne",
    legalType: "tutelle et mobilité",
  },
  "femmes-etats-unis-dobbs-avortement": {
    pays_ou_zone: "États-Unis",
    regionScope: "Amérique du Nord",
    periode_debut: "2022",
    statut_temporel: "variable selon pays",
    intensite_contextuelle: "forte",
    legalType: "santé reproductive",
  },
  "femmes-canada-sterilisations-sans-consentement-autochtones": {
    pays_ou_zone: "Canada",
    regionScope: "Amérique du Nord",
    periode_debut: "1948",
    periode_fin: "2025",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "consentement médical et santé reproductive",
  },
  "femmes-homicides-mineurs-condamnations": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "1996",
    periode_fin: "2015",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "homicide volontaire sur mineur de moins de 15 ans",
  },
  "femmes-violences-sexuelles": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2023",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "enquête de victimation et violences sexuelles",
  },
  "femmes-perception-desavantage-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "baromètre d'opinion et perception des désavantages",
  },
  "femmes-violences-sexuelles-transports-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2024",
    periode_fin: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "violences sexistes et sexuelles dans les transports",
  },
  "femmes-sport-inegalites-hce-2025": {
    pays_ou_zone: "France et monde",
    regionScope: "Europe et monde",
    periode_debut: "2021",
    periode_fin: "2025",
    statut_temporel: "persistant",
    intensite_contextuelle: "moyenne",
    legalType: "sport, revenus et représentation",
  },
  "femmes-cybersexisme-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "cybersexisme et haine en ligne",
  },
  "femmes-deepfakes-sexuels-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2024",
    periode_fin: "2026",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "deepfakes sexuels et droit pénal",
  },
  "femmes-inegalites-familiales-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "baromètre d'opinion, famille et travail domestique",
  },
  "femmes-vecu-situations-sexistes-hce-2025": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "situations sexistes déclarées et violences sexuelles",
  },
  "femmes-assemblee-nationale-parite-2024": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2017",
    periode_fin: "2024",
    statut_temporel: "en baisse",
    intensite_contextuelle: "moyenne",
    legalType: "représentation politique",
  },
  "femmes-prison-victimisation-sexuelle-etats-unis": {
    pays_ou_zone: "États-Unis",
    regionScope: "Amérique du Nord",
    periode_debut: "2023",
    periode_fin: "2024",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "victimisation sexuelle en détention",
  },
  "femmes-violences-sexuelles-conflits": {
    pays_ou_zone: "Monde",
    regionScope: "Monde",
    periode_debut: "2021",
    periode_fin: "2026",
    statut_temporel: "lié à une crise",
    intensite_contextuelle: "extrême",
    legalType: "violences sexuelles liées aux conflits",
  },
  "femmes-filles-hors-ecole": {
    pays_ou_zone: "Monde",
    periode_debut: "2024",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "éducation",
  },
  "femmes-menopause-soins": {
    pays_ou_zone: "Monde, France et OCDE",
    regionScope: "Monde",
    periode_debut: "2019",
    periode_fin: "2025",
    statut_temporel: "persistant",
    intensite_contextuelle: "moyenne",
    legalType: "accès aux soins et prévention",
  },
  "femmes-regles-cout-douleurs-ecole-sport": {
    pays_ou_zone: "France et pays comparables",
    regionScope: "Europe",
    periode_debut: "2019",
    periode_fin: "2026",
    statut_temporel: "persistant",
    intensite_contextuelle: "moyenne",
    legalType: "santé menstruelle, éducation et sport",
  },
  "femmes-pression-virginite-avant-mariage": {
    pays_ou_zone: "Monde",
    regionScope: "Monde",
    periode_debut: "2018",
    periode_fin: "2023",
    statut_temporel: "persistant",
    intensite_contextuelle: "forte",
    legalType: "autonomie corporelle et normes sexuelles",
  },
  "hommes-femmes-body-count-double-standard": {
    pays_ou_zone: "Monde",
    regionScope: "Monde",
    periode_debut: "2020",
    periode_fin: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "normes sexuelles et réputation",
  },
  "hommes-femmes-peurs-consentement-sexuel": {
    pays_ou_zone: "Monde, États-Unis et Royaume-Uni",
    regionScope: "Monde",
    periode_debut: "2000",
    periode_fin: "2025",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "consentement, violences sexuelles et fausses accusations",
  },
  "femmes-espaces-non-mixtes-sexe": {
    pays_ou_zone: "Royaume-Uni",
    regionScope: "Europe",
    periode_debut: "2025",
    periode_fin: "2026",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "services séparés ou non mixtes fondés sur le sexe",
  },
  "femmes-dirigeantes-paix-essentialisme": {
    pays_ou_zone: "Europe",
    regionScope: "Europe, avec exemples comparatifs hors Europe",
    periode_debut: "1480",
    periode_fin: "1913",
    statut_temporel: "historique",
    intensite_contextuelle: "moyenne",
    legalType: "leadership politique et guerre",
  },
};

function inferZone(claim: RawClaim) {
  const text = `${claim.title} ${claim.summary} ${claim.tags.join(" ")}`;
  if (text.includes("États-Unis")) return "États-Unis";
  if (text.includes("Royaume-Uni") || text.includes("Angleterre")) return "Royaume-Uni";
  if (text.includes("OCDE")) return "OCDE";
  if (text.includes("Afghanistan")) return "Afghanistan";
  if (text.includes("Iran")) return "Iran";
  if (text.includes("Arabie saoudite")) return "Arabie saoudite";
  if (text.includes("Ukraine")) return "Ukraine";
  if (text.includes("monde") || text.includes("mondial") || text.includes("mondiale")) return "Monde";
  return "France";
}

function inferStatus(claim: RawClaim): StatutTemporel {
  const text = `${claim.title} ${claim.summary} ${claim.tags.join(" ")}`.toLowerCase();
  if (text.includes("historique")) return "historique";
  if (text.includes("variable")) return "variable selon pays";
  if (text.includes("partiellement")) return "partiellement réformé";
  if (text.includes("crise") || text.includes("conflit") || text.includes("guerre")) {
    return "lié à une crise";
  }
  if (claim.confidence === "à vérifier") return "données insuffisantes";
  return "actuel";
}

function buildClaim(claim: RawClaim): Claim {
  const explicit = claimMetadata[claim.id];
  const pays_ou_zone = explicit?.pays_ou_zone ?? inferZone(claim);
  const statut_temporel = explicit?.statut_temporel ?? inferStatus(claim);
  const periode_debut = explicit?.periode_debut ?? claim.source.date;
  const periode_fin = explicit?.periode_fin ?? null;
  const sourcePopulation = sourcePopulationLabels[claim.id] ?? "";
  const methodNote =
    claim.side === "hommes"
      ? "Dans isora, l'axe masculin suit la définition éditoriale Homme = personne XY. La source conserve toutefois son libellé statistique propre et ne mesure pas les chromosomes sauf indication contraire."
      : "Dans isora, l'axe féminin suit la définition éditoriale Femme = personne XX. La source conserve toutefois son libellé statistique propre et ne mesure pas les chromosomes sauf indication contraire.";

  return {
    ...claim,
    angle: claim.angle ?? "désavantage_subi",
    sourcePopulation,
    categorie_isora: claim.side === "hommes" ? "Homme (XY)" : "Femme (XX)",
    libelle_source: sourcePopulation,
    mesure_chromosomes: false,
    theme: claim.domain,
    pays_ou_zone,
    periode_debut,
    periode_fin,
    statut_temporel,
    intensite_contextuelle: explicit?.intensite_contextuelle ?? "moyenne",
    fait_resume: claim.summary,
    source_url: claim.source.url,
    date_consultation: claim.lastChecked,
    countryScope: pays_ou_zone,
    regionScope: explicit?.regionScope ?? (pays_ou_zone === "Monde" ? "Monde" : ""),
    periodStart: periode_debut,
    periodEnd: periode_fin,
    currentStatus: statut_temporel,
    legalType: explicit?.legalType ?? claim.domain.toLowerCase(),
    methodNote,
  };
}

export const claims: Claim[] = rawClaims.map(buildClaim);

export const tagLabels = Array.from(
  new Set(claims.flatMap((claim) => claim.tags)),
).sort((a, b) => a.localeCompare(b, "fr"));

export const domains = Array.from(new Set(claims.map((claim) => claim.domain)));
