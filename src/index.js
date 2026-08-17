export default {
  // Point d'entrée HTTP (quand on visite l'URL du Worker)
  async fetch(request, env, ctx) {
    return new Response("Service Full Remote Jobs opérationnel.", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },

  // Point d'entrée Cron (déclenché automatiquement chaque matin à 6h00 UTC)
  async scheduled(event, env, ctx) {
    console.log("Exécution planifiée du rafraîchissement des jobs...");
    // Votre logique d'ingestion sera exécutée ici
  },
};
