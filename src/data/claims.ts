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
  categorie_sexedata: "Homme (XY)" | "Femme (XX)";
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
  | "categorie_sexedata"
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
    lastChecked: "15 juin 2026",
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
      "En 2023, environ 80 % des victimes d'homicide dans le monde étaient des hommes. Le même rapport souligne que les femmes sont davantage tuées dans la sphère intime ou familiale.",
    tags: ["violences", "sécurité", "homicide", "monde"],
    source: {
      label: "Femicides in 2023: global estimates of intimate partner/family member femicides",
      publisher: "UN Women / UNODC",
      url: "https://www.unwomen.org/sites/default/files/2024-11/femicides-in-2023-global-estimates-of-intimate-partner-family-member-femicides-en.pdf",
      date: "2023",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Les profils de victimation diffèrent selon le contexte. Ce chiffre documente une exposition masculine forte à la violence létale hors sphère intime.",
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
      date: "2023",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
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
      "Les règles varient fortement selon les pays, les exemptions et les situations de guerre. La fiche documente une asymétrie juridique à vérifier pays par pays.",
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
    metric: "132 M",
    summary:
      "L'UNESCO signale 132 millions de garçons hors de l'école et indique que les garçons redoublent davantage au primaire dans 130 pays disposant de données.",
    tags: ["éducation", "jeunesse", "monde", "décrochage"],
    source: {
      label: "What you need to know about UNESCO's global report on boys' disengagement in education",
      publisher: "UNESCO",
      url: "https://www.unesco.org/en/articles/what-you-need-know-about-unescos-global-report-boys-disengagement-education",
      date: "2022",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le décrochage des garçons varie selon la pauvreté, le territoire, les conflits et les attentes sociales. Il ne contredit pas les obstacles spécifiques rencontrés par les filles ailleurs.",
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
    title: "Victimes masculines de violence domestique au Royaume-Uni",
    metric: "1,5 M",
    summary:
      "L'ONS estime à 1,5 million le nombre d'hommes victimes de violence domestique en Angleterre et au pays de Galles sur l'année se terminant en mars 2025.",
    tags: ["violences", "violence domestique", "Royaume-Uni", "sécurité"],
    source: {
      label: "Domestic abuse victim characteristics, England and Wales",
      publisher: "Office for National Statistics",
      url: "https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice/articles/domesticabusevictimcharacteristicsenglandandwales/yearendingmarch2025",
      date: "2024/25",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Les enquêtes de victimation captent mieux une partie des violences non déclarées. Les dynamiques de contrôle et de gravité doivent être analysées finement.",
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
      "Le sujet implique santé publique, religion, consentement et droits de l'enfant. La fiche documente un enjeu d'autonomie corporelle sans juger les familles.",
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
      label: "Commonly Used Statistics",
      publisher: "OSHA",
      url: "https://www.osha.gov/data/commonstats",
      date: "2024",
    },
    additionalSources: [
      {
        label: "National Census of Fatal Occupational Injuries in 2024",
        publisher: "BLS",
        url: "https://www.bls.gov/news.release/cfoi.nr0.htm",
        date: "2024",
      },
    ],
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Dans les pays industrialisés, prévention, mécanisation et droit du travail ont réduit le risque depuis 1970. La fiche documente la persistance actuelle d'un risque mortel très masculin.",
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
      "Cette fiche est datée: elle ne doit pas être lue comme une règle intemporelle pour tous les hommes ukrainiens. Les âges, exceptions et assouplissements doivent être vérifiés au moment de lecture.",
  },
  {
    id: "femmes-ecart-salaire",
    side: "femmes",
    domain: "Revenus",
    title: "Femmes moins payées que les hommes dans le privé",
    metric: "15 %",
    summary:
      "Dans le secteur privé, l'Insee mesure en 2022 un salaire en équivalent temps plein inférieur de 15 % pour les femmes. En 2024, le salaire net moyen mensuel privé est de 2 510 euros pour les femmes contre 2 890 euros pour les hommes.",
    tags: ["revenus", "travail", "sociétal", "juridique"],
    source: {
      label: "L'essentiel sur les salaires",
      publisher: "Insee",
      url: "https://www.insee.fr/fr/statistiques/7457170",
      date: "2026",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'écart agrège temps partiel, métiers, positions hiérarchiques, entreprises et discriminations possibles. L'écart à poste comparable est plus réduit.",
  },
  {
    id: "femmes-temps-partiel",
    side: "femmes",
    domain: "Travail",
    title: "Femmes beaucoup plus souvent salariées à temps partiel",
    metric: "26,6 % vs 7,8 %",
    summary:
      "En 2023, 26,6 % des femmes salariées sont à temps partiel contre 7,8 % des hommes. Les femmes représentent 77,9 % des salariés à temps partiel.",
    tags: ["travail", "famille", "revenus", "sociétal"],
    source: {
      label: "Temps partiel - Emploi, chômage, revenus du travail",
      publisher: "Insee",
      url: "https://www.insee.fr/fr/statistiques/7767077?sommaire=7767424",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Une partie est choisie, une partie subie. Les raisons familiales sont nettement plus souvent citées par les femmes.",
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
    metric: "277 000",
    summary:
      "Le nombre de femmes majeures victimes de viols, tentatives de viol ou agressions sexuelles en 2023 est estimé à 277 000. Seules 7 % déclarent avoir porté plainte.",
    tags: ["violences", "justice", "santé", "sociétal"],
    source: {
      label: "Les chiffres de référence sur les violences faites aux femmes",
      publisher: "Arrêtons les violences / SSMSI",
      url: "https://arretonslesviolences.gouv.fr/je-suis-professionnel/chiffres-de-reference-violences-faites-aux-femmes",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Il s'agit d'une estimation minimale sur les personnes vivant en logement ordinaire dans le champ de l'enquête.",
  },
  {
    id: "femmes-ingenierie",
    side: "femmes",
    domain: "Éducation",
    title: "Femmes sous-représentées dans l'ingénierie",
    metric: "24 %",
    summary:
      "En 2023, les femmes représentent 24 % des ingénieurs en activité et 29 % des ingénieurs diplômés de l'année, selon l'Observatoire des Femmes Ingénieures basé sur l'enquête IESF.",
    tags: ["éducation", "travail", "orientation", "sociétal"],
    source: {
      label: "Observatoire des Femmes Ingénieures 2025",
      publisher: "Femmes Ingénieures / IESF",
      url: "https://www.femmes-ingenieures.org/offres/file_inline_src/82/82_P_38037_690cc4ba6342f_33.pdf",
      date: "2025",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La sous-représentation combine orientation scolaire, stéréotypes, recrutement, fidélisation et accès aux responsabilités.",
  },
  {
    id: "femmes-separation-niveau-vie",
    side: "femmes",
    domain: "Famille",
    title: "Femmes plus appauvries après une séparation",
    metric: "-17 % vs -7 %",
    summary:
      "Dans l'étude Insee Occitanie, l'année de la séparation, le niveau de vie médian diminue de 17 % pour les femmes contre 7 % pour les hommes. La pauvreté touche alors 26 % des femmes séparées contre 18 % des hommes.",
    tags: ["famille", "revenus", "séparation", "sociétal"],
    source: {
      label:
        "Après une séparation, les femmes font face à davantage de difficultés que les hommes",
      publisher: "Insee",
      url: "https://www.insee.fr/fr/statistiques/8338430",
      date: "2025",
    },
    confidence: "moyenne",
    lastChecked: "15 juin 2026",
    nuance:
      "L'étude porte sur l'Occitanie. Elle est cohérente avec d'autres travaux, mais une fiche nationale serait préférable.",
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
      "Cette fiche décrit une règle abrogée en France. Elle sert à distinguer l'historique du droit actuel et ne doit pas être présentée comme une contrainte contemporaine française.",
  },
  {
    id: "femmes-france-contraception-1967",
    side: "femmes",
    domain: "Santé",
    title: "Contraception interdite ou restreinte en France avant 1967",
    metric: "1967",
    summary:
      "La loi Neuwirth du 28 décembre 1967 a autorisé la contraception en France, avec une application progressive les années suivantes.",
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
      "La restriction est historique en France, mais l'accès réel à la contraception dépend encore de l'information, du coût, de l'offre de soins et du territoire.",
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
    title: "Femmes exposées aux violences physiques ou sexuelles",
    metric: "1 sur 3",
    summary:
      "L'OMS estime qu'environ une femme sur trois dans le monde a subi des violences physiques et/ou sexuelles au cours de sa vie.",
    tags: ["violences", "santé", "monde", "prévention"],
    source: {
      label: "Violence against women",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/news-room/fact-sheets/detail/violence-against-women",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'indicateur agrège des formes de violence et des contextes très différents. Il documente un problème de santé publique massif.",
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
    domain: "Éducation",
    title: "Filles hors de l'école",
    metric: "119 M",
    summary:
      "L'UNICEF estime qu'environ 119 millions de filles sont hors de l'école dans le monde.",
    tags: ["éducation", "jeunesse", "monde", "droits"],
    source: {
      label: "Girls' education",
      publisher: "UNICEF",
      url: "https://www.unicef.org/education/girls-education",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'accès des filles à l'école varie fortement selon les pays, la pauvreté, les conflits et les normes familiales.",
  },
  {
    id: "femmes-afghanistan-education",
    side: "femmes",
    domain: "Éducation",
    title: "Adolescentes privées d'enseignement secondaire en Afghanistan",
    metric: "2,2 M",
    summary:
      "L'UNESCO indique qu'en Afghanistan, 2,2 millions d'adolescentes sont privées d'enseignement secondaire.",
    tags: ["éducation", "droits", "Afghanistan", "jeunesse"],
    source: {
      label: "Afghanistan's education crisis threatens future of entire generation",
      publisher: "UNESCO",
      url: "https://www.unesco.org/en/articles/new-report-warns-afghanistans-education-crisis-threatens-future-entire-generation",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "C'est un cas national extrême d'exclusion scolaire fondée sur le sexe. Il ne doit pas être généralisé mécaniquement à tous les pays.",
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
      "En Iran, des obligations de port du hijab et de contrôle vestimentaire sont imposées aux femmes et filles, avec des sanctions renforcées ou discutées dans les textes récents.",
    tags: ["droits", "Iran", "contrôle vestimentaire", "actuel"],
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
    lastChecked: "15 juin 2026",
    nuance:
      "La fiche concerne l'Iran et ne doit pas être généralisée à tous les pays à majorité musulmane. Les textes et modalités d'application doivent être suivis dans le temps.",
  },
  {
    id: "femmes-afghanistan-taliban-restrictions",
    side: "femmes",
    domain: "Droits",
    title: "Femmes afghanes exclues de pans entiers de la vie publique",
    metric: "2021+",
    summary:
      "Sous les autorités de facto talibanes, les femmes et filles subissent des restrictions sur l'éducation, le travail, la mobilité et la couverture du visage hors du domicile.",
    tags: ["droits", "Afghanistan", "contrôle vestimentaire", "éducation"],
    source: {
      label: "UNAMA report on the PVPV law",
      publisher: "UNAMA",
      url: "https://unama.unmissions.org/sites/default/files/unama_pvpv_report_10_april_2025_english.pdf",
      date: "2025",
    },
    additionalSources: [
      {
        label: "Afghanistan",
        publisher: "ONU Femmes",
        url: "https://www.unwomen.org/en/articles/in-focus/afghanistan",
        date: "2026",
      },
    ],
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "La fiche vise l'Afghanistan sous autorité talibane, pas une religion ou une région entière. Les restrictions doivent être documentées par pays et par autorité.",
  },
  {
    id: "femmes-arabie-saoudite-reformes-tutelle",
    side: "femmes",
    domain: "Droits",
    title: "Saoudiennes encore touchées par des restrictions de tutelle",
    metric: "2018/2019",
    summary:
      "L'Arabie saoudite a levé l'interdiction de conduire pour les femmes en 2018 et réformé en 2019 certaines restrictions de voyage pour les femmes de plus de 21 ans, mais des restrictions de tutelle persistent dans plusieurs domaines.",
    tags: ["droits", "Arabie saoudite", "partiellement réformé", "mobilité"],
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
    ],
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le statut est partiellement réformé: ne pas présenter l'Arabie saoudite de 2026 comme identique à l'Iran ou à l'Afghanistan sans source actuelle précise.",
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
    domain: "Santé",
    title: "Soins liés à la ménopause insuffisamment accessibles",
    metric: "accès inégal",
    summary:
      "L'OMS souligne que l'information et l'accès aux soins liés à la ménopause restent insuffisants dans beaucoup de pays.",
    tags: ["santé", "ménopause", "soins", "monde"],
    source: {
      label: "Menopause",
      publisher: "Organisation mondiale de la Santé",
      url: "https://www.who.int/news-room/fact-sheets/detail/menopause",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Le sujet relève de la qualité de vie, de l'information médicale et de la prise en compte de la santé des femmes à tous les âges.",
  },
  {
    id: "femmes-ecart-salaire-monde",
    side: "femmes",
    domain: "Revenus",
    title: "Femmes moins payées que les hommes dans le monde",
    metric: "20 %",
    summary:
      "L'OIT indique que les femmes gagnent en moyenne environ 20 % de moins que les hommes dans le monde.",
    tags: ["revenus", "travail", "monde", "sociétal"],
    source: {
      label: "Gender pay gap",
      publisher: "Organisation internationale du Travail",
      url: "https://www.ilo.org/resource/other/gender-pay-gap",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "L'écart mondial agrège des marchés du travail très différents. Il complète les fiches nationales sans les remplacer.",
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
    id: "femmes-conflits-proximite",
    side: "femmes",
    domain: "Conflits",
    title: "Femmes et filles vivant près de conflits meurtriers",
    metric: "676 M",
    summary:
      "En 2024, ONU Femmes estime qu'environ 676 millions de femmes et filles vivaient à moins de 50 km d'un conflit meurtrier.",
    tags: ["conflits", "sécurité", "droits", "monde"],
    source: {
      label: "Facts and figures: Women, peace, and security",
      publisher: "ONU Femmes",
      url: "https://www.unwomen.org/en/articles/facts-and-figures/facts-and-figures-women-peace-and-security",
      date: "2024",
    },
    confidence: "forte",
    lastChecked: "15 juin 2026",
    nuance:
      "Les conflits exposent aussi massivement les hommes à la conscription, aux blessures et à la mort. Cette fiche cible les risques et besoins spécifiques des femmes et filles civiles.",
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
  "hommes-sorties-precoces":
    "Population mesurée par la source : hommes et femmes de 18 à 24 ans. La source ne mesure pas les chromosomes.",
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
    "Population mesurée par la source : boys / garçons et men / hommes dans le rapport UNESCO. La source ne mesure pas les chromosomes.",
  "hommes-sans-abrisme":
    "Population mesurée par la source : men / women selon les définitions nationales du sans-abrisme. La source ne mesure pas les chromosomes.",
  "hommes-violence-partenaire-etats-unis":
    "Population mesurée par la source : men / male victims dans l'enquête CDC. La source ne mesure pas les chromosomes.",
  "hommes-violence-domestique-royaume-uni":
    "Population mesurée par la source : males / females âgés de 16 ans et plus dans le CSEW. La source ne mesure pas les chromosomes.",
  "hommes-mis-en-cause-violences-conjugales-france":
    "Population mesurée par la source : personnes mises en cause femmes/hommes par les services de sécurité français. La source ne mesure pas les chromosomes.",
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
  "femmes-temps-partiel":
    "Population mesurée par la source : femmes et hommes salariés dans les statistiques Insee. La source ne mesure pas les chromosomes.",
  "femmes-violences-conjugales":
    "Population mesurée par la source : victimes femmes/hommes enregistrées par les services de sécurité. La source ne mesure pas les chromosomes.",
  "femmes-violences-sexuelles":
    "Population mesurée par la source : femmes majeures en enquête de victimation. La source ne mesure pas les chromosomes.",
  "femmes-ingenierie":
    "Population mesurée par la source : femmes ingénieures et diplômées selon l'enquête IESF. La source ne mesure pas les chromosomes.",
  "femmes-separation-niveau-vie":
    "Population mesurée par la source : femmes et hommes séparés dans les données Insee. La source ne mesure pas les chromosomes.",
  "femmes-discrimination-religieuse":
    "Population mesurée par la source : candidate visée par une décision juridique liée au sexe et à la religion. La source ne mesure pas les chromosomes.",
  "femmes-france-droit-vote-1944":
    "Population mesurée par la source : femmes dans l'histoire du droit français. La source ne mesure pas les chromosomes.",
  "femmes-france-compte-bancaire-travail-1965":
    "Population mesurée par la source : femmes mariées dans le droit civil français. La source ne mesure pas les chromosomes.",
  "femmes-france-contraception-1967":
    "Population mesurée par la source : femmes dans l'histoire des droits reproductifs français. La source ne mesure pas les chromosomes.",
  "femmes-france-ivg-1975-1979":
    "Population mesurée par la source : femmes concernées par le droit à l'IVG en France. La source ne mesure pas les chromosomes.",
  "femmes-violences-physiques-sexuelles-monde":
    "Population mesurée par la source : women / femmes dans les enquêtes de prévalence OMS. La source ne mesure pas les chromosomes.",
  "femmes-feminicides-monde-2024":
    "Population mesurée par la source : women and girls / femmes et filles dans les données UNODC-ONU Femmes. La source ne mesure pas les chromosomes.",
  "femmes-violences-sexuelles-enfance":
    "Population mesurée par la source : girls and women / filles et femmes vivantes selon UNICEF. La source ne mesure pas les chromosomes.",
  "femmes-mariage-enfants":
    "Population mesurée par la source : girls and women / filles et femmes mariées pendant l'enfance. La source ne mesure pas les chromosomes.",
  "femmes-mutilations-genitales":
    "Population mesurée par la source : girls and women / filles et femmes ayant subi une MGF. La source ne mesure pas les chromosomes.",
  "femmes-preference-garcons":
    "Population mesurée par la source : missing girls / filles manquantes dans les estimations démographiques. La source ne mesure pas les chromosomes.",
  "femmes-filles-hors-ecole":
    "Population mesurée par la source : girls / filles hors de l'école selon UNICEF. La source ne mesure pas les chromosomes.",
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
  "femmes-avortement-non-securise":
    "Population mesurée par la source : women and girls dans la fiche OMS. La source ne mesure pas les chromosomes.",
  "femmes-endometriose":
    "Population mesurée par la source : women and girls of reproductive age / femmes et filles en âge de procréer. La source ne mesure pas les chromosomes.",
  "femmes-menopause-soins":
    "Population mesurée par la source : women / personnes concernées par la ménopause selon l'OMS. La source ne mesure pas les chromosomes.",
  "femmes-ecart-salaire-monde":
    "Population mesurée par la source : women / men dans les indicateurs OIT. La source ne mesure pas les chromosomes.",
  "femmes-soin-non-remunere-emploi":
    "Population mesurée par la source : women / men âgés de 15 ans ou plus hors force de travail pour raisons de soin. La source ne mesure pas les chromosomes.",
  "femmes-charge-domestique-soin":
    "Population mesurée par la source : women and girls / men and boys dans les données ONU Femmes. La source ne mesure pas les chromosomes.",
  "femmes-droits-economiques-monde":
    "Population mesurée par la source : women / men dans les indicateurs juridiques Women, Business and the Law. La source ne mesure pas les chromosomes.",
  "femmes-representation-politique-monde":
    "Population mesurée par la source : women / femmes en responsabilités politiques. La source ne mesure pas les chromosomes.",
  "femmes-conflits-proximite":
    "Population mesurée par la source : women and girls / femmes et filles vivant près d'un conflit. La source ne mesure pas les chromosomes.",
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
  "hommes-sorties-precoces": {
    pays_ou_zone: "France",
    periode_debut: "2023",
    statut_temporel: "actuel",
    intensite_contextuelle: "moyenne",
    legalType: "éducation",
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
  "hommes-mis-en-cause-violences-conjugales-france": {
    pays_ou_zone: "France",
    regionScope: "Europe",
    periode_debut: "2024",
    statut_temporel: "actuel",
    intensite_contextuelle: "forte",
    legalType: "violences conjugales enregistrées",
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
    categorie_sexedata: claim.side === "hommes" ? "Homme (XY)" : "Femme (XX)",
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
