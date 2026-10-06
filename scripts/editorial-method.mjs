function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEditorialMethodHtml({ siteUrl, css, header, faviconLinks, updatedDate }) {
  const baseUrl = String(siteUrl).replace(/\/+$/, "");
  const pageUrl = `${baseUrl}/methode/`;
  const title = "isora - méthode éditoriale et vérification des sources";
  const description =
    "Comment isora sélectionne ses sources, précise les populations et les périodes, distingue les observations des causes et corrige ses fiches.";
  const parsedUpdatedDate = new Date(`${updatedDate}T12:00:00Z`);
  const visibleUpdatedDate = Number.isNaN(parsedUpdatedDate.getTime())
    ? updatedDate
    : new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Paris",
      }).format(parsedUpdatedDate);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "isora",
        url: `${baseUrl}/`,
        logo: `${baseUrl}/isora.svg`,
      },
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: "fr-FR",
        dateModified: updatedDate,
        about: { "@id": `${baseUrl}/#organization` },
        publisher: { "@id": `${baseUrl}/#organization` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "isora", item: `${baseUrl}/` },
          { "@type": "ListItem", position: 2, name: "Méthode", item: pageUrl },
        ],
      },
    ],
  };

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="isora" />
    <meta property="og:site_name" content="isora" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="alternate" type="application/json" title="Dataset public isora" href="/isora-dataset.json" />
    <link rel="alternate" type="text/plain" title="isora pour IA et agents" href="/llms.txt" />
${faviconLinks}
    <title>${escapeHtml(title)}</title>
    <style>${css}
      .editorial-method-main { grid-template-columns: minmax(0, 1fr); max-width: 900px; }
      .editorial-method-main .section p + p { margin-top: 16px; }
    </style>
    <script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>
  </head>
  <body>
    ${header}

    <section class="hero">
      <div class="wrap hero-inner">
        <p class="kicker">Sources, périmètre et corrections</p>
        <h1>La méthode éditoriale d’<em>isora</em></h1>
        <p class="lead"><em>isora</em> est un référentiel de synthèse sur les asymétries documentées selon le sexe. Les fiches et les articles rapprochent des données existantes avec leurs sources, leur population mesurée et leurs limites. Ils ne constituent pas des recherches primaires.</p>
      </div>
    </section>

    <main class="wrap editorial-method-main">
      <article>
        <section class="section" aria-labelledby="sources">
          <h2 id="sources">Des sources identifiables et consultables</h2>
          <p>La recherche privilégie les publications originales, les statistiques publiques, les textes de droit et les institutions qui produisent les données. Une fiche cite au moins une source externe. Les articles de veille réunissent plusieurs documents pour présenter le résultat principal, son contexte et ses limites.</p>
          <p>Une notice institutionnelle qui décrit la même étude ne constitue pas une confirmation indépendante. Un témoignage ou une vidéo peut signaler une question à vérifier, mais ne suffit pas à établir une statistique générale. Les liens sources permettent de retrouver le document et de vérifier ce qu’il mesure.</p>
        </section>

        <section class="section" aria-labelledby="perimetre">
          <h2 id="perimetre">Conserver l’indicateur, la population et la période</h2>
          <p>Chaque fiche précise un pays ou une zone, une période, une population mesurée et une nuance. La date de publication d’un rapport peut différer de la période de collecte des données. Une étude publiée récemment ne décrit donc pas nécessairement la situation actuelle de chaque pays.</p>
          <p>Une comparaison femmes-hommes doit porter sur le même indicateur, le même périmètre et la même période. Un taux global ne permet pas de reconstruire deux taux selon le sexe. La part d’un groupe parmi les cas, le risque au sein de ce groupe, un écart en points et un rapport de fréquences sont des mesures distinctes.</p>
          <p>Les catégories de la source restent visibles : par exemple personnes interrogées, personnes en emploi, victimes déclarées ou faits enregistrés. Une enquête déclarative, des données administratives et des estimations modélisées ne mesurent pas la même chose.</p>
        </section>

        <section class="section" aria-labelledby="interpretation">
          <h2 id="interpretation">Décrire les écarts sans attribuer une cause non démontrée</h2>
          <p>Une différence observée ne démontre pas, à elle seule, sa cause. Une corrélation entre deux variables ne prouve pas que l’une produit l’autre. Les résultats moyens d’un groupe ne décrivent pas chaque personne et ne suffisent pas à attribuer des intentions.</p>
          <p>Les nuances précisent ce qui est mesuré, ce qui ne l’est pas et les limites de la comparaison : taille ou sélection de l’échantillon, couverture géographique, déclaration, signalement, définitions ou hétérogénéité des études. Un résultat groupé international n’est pas présenté comme un résultat identique dans chacun des pays.</p>
          <p>La même exigence de preuve s’applique aux asymétries concernant les femmes et les hommes. Le classement d’une fiche décrit le sujet documenté ; il ne constitue pas une appréciation de toutes les personnes d’un sexe.</p>
        </section>

        <section class="section" aria-labelledby="categories">
          <h2 id="categories">Convention éditoriale et catégories des sources</h2>
          <p>Dans le périmètre éditorial d’<em>isora</em>, « femme » désigne une personne XX et « homme » une personne XY. Cette convention est explicitée dans le <a href="/lexique/">lexique</a>.</p>
          <p>La plupart des sources citées parlent de femmes et d’hommes, de sexe déclaré, de sexe assigné ou de catégories administratives sans mesurer les chromosomes. <em>isora</em> conserve leurs libellés et précise la population réellement mesurée. Ces données ne sont pas transformées en preuve chromosomique stricte.</p>
          <p>Le lexique présente aussi les définitions propres au site lorsqu’elles diffèrent du vocabulaire d’une source. Le titre exact du document demeure identifiable ; une définition éditoriale n’est pas attribuée à son auteur.</p>
        </section>

        <section class="section" aria-labelledby="confiance">
          <h2 id="confiance">Un niveau de confiance accompagné de limites</h2>
          <p>Les fiches indiquent un niveau de confiance et une date de dernière vérification. Le niveau de confiance exprime une appréciation éditoriale du dossier cité ; ce n’est ni une probabilité calculée ni une garantie d’absence d’erreur.</p>
          <p>Une confiance forte n’efface pas les limites de la source ou du périmètre. Pour évaluer un chiffre, il faut lire ensemble la mesure, la population, la période, la nuance et les documents cités. Les données peuvent être révisées quand une source plus précise devient disponible.</p>
        </section>

        <section class="section" aria-labelledby="ia">
          <h2 id="ia">Une veille et une rédaction assistées par IA</h2>
          <p>Des outils d’intelligence artificielle peuvent assister la recherche documentaire, la synthèse, la rédaction et les vérifications techniques. La veille automatisée peut publier après les contrôles prévus par le projet ; une relecture humaine systématique de chaque publication n’est pas garantie.</p>
          <p>Une réponse d’IA n’est pas une source probante. Les affirmations publiées doivent pouvoir être rapprochées des documents externes cités. Les contrôles techniques du site vérifient notamment la structure des contenus et leur génération ; ils ne remplacent pas la vérification d’un résultat dans sa source.</p>
        </section>

        <section class="section" aria-labelledby="corrections">
          <h2 id="corrections">Signaler une correction ou proposer une source</h2>
          <p>Depuis le <a href="/">référentiel interactif</a>, ouvrez la fiche concernée puis utilisez son bouton « Contester ». Indiquez le point à corriger, la population ou la période concernée et, si possible, le lien vers le document qui justifie la correction. Le bouton « Proposer une asymétrie » permet de soumettre un nouveau sujet.</p>
          <p>Une proposition ne devient pas automatiquement une fiche publiée. Une correction de donnée ou de périmètre doit être documentée dans la fiche, avec la source ou la nuance utile et une date de vérification mise à jour. Un article associé peut apporter du contexte sans signifier que toutes les données de la fiche ont été remplacées.</p>
        </section>

        <section class="section" aria-labelledby="citation">
          <h2 id="citation">Citer une fiche sans perdre son contexte</h2>
          <p>Les <a href="/fiches/">fiches</a>, les <a href="/blog/">articles</a> et le <a href="/isora-dataset.json">dataset public</a> exposent les informations de référence. Pour reprendre une synthèse, citez <em>isora</em> et la page concernée. Pour une affirmation factuelle, consultez aussi la source primaire et conservez l’indicateur, le pays ou la zone, la période, la population et la limite d’interprétation.</p>
        </section>
      </article>
    </main>

    <footer class="wrap method">
      <p>Méthode mise à jour le <time datetime="${escapeHtml(updatedDate)}">${escapeHtml(visibleUpdatedDate)}</time>. Retrouvez les définitions dans le <a href="/lexique/">lexique d’<em>isora</em></a>.</p>
    </footer>
    <script src="/isora-soft-navigation.js" defer></script>
  </body>
</html>
`;
}
