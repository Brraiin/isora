      (() => {
        const input = document.querySelector("[data-post-search]");
        const cards = Array.from(document.querySelectorAll("[data-post-card]"));
        const empty = document.querySelector("[data-post-empty]");
        if (!input || cards.length === 0) return;
        const normalize = (value) =>
          String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const update = () => {
          const query = normalize(input.value.trim());
          let visible = 0;
          for (const card of cards) {
            const matches = !query || normalize(card.dataset.search || card.textContent).includes(query);
            card.hidden = !matches;
            if (matches) visible += 1;
          }
          if (empty) empty.hidden = visible !== 0;
        };
        input.addEventListener("input", update);
      })();
