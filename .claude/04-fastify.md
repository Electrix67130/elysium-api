# Fastify — Design patterns

## Plugin system

- Chaque module = plugin Fastify via `fastify-plugin` (`fp()`) pour eviter l'encapsulation
- Auto-charge via `@fastify/autoload` depuis `src/modules/` (maxDepth: 1)
- Ordre dans `app.ts` : security plugins > infrastructure > modules
- Ne jamais acceder a `fastify.db` avant que le plugin database soit enregistre

## Decorators et augmentation de types

- `fastify.db` (Knex instance) — decore par le plugin database
- `fastify.authenticate` (preHandler JWT) — decore par le plugin jwt
- `request.user` (payload JWT : `sub`, `email`) — disponible apres `authenticate`
- Nouveaux decorateurs : augmenter `FastifyInstance` dans un fichier de declaration `.d.ts`

```ts
declare module 'fastify' {
  interface FastifyInstance {
    db: Knex;
    authenticate: preHandlerHookHandler;
  }
  interface FastifyRequest {
    user: { sub: string; email: string };
  }
}
```

## Lifecycle hooks

- `preHandler` pour authentification et autorisation
- `onRequest` reserve aux plugins infra — jamais de logique metier
- Rate limiting global (100 req/min) dans `app.ts`

## Route typing

- Typer les generics de route pour les params, querystring, et body :

```ts
fastify.get<{
  Params: { id: string };
  Querystring: { page?: string; limit?: string };
}>('/entities/:id', async (request, reply) => {
  const { id } = request.params;
});
```

## Reponses

- Reponse succes : retourner directement l'objet (Fastify serialise en JSON)
- Reponse paginee : `{ data: T[], meta: { total, page, limit, totalPages } }`
- Reponse erreur : `{ statusCode, error, message }` (gere par error-handler)
- Codes HTTP : 200 (OK), 201 (Created), 204 (Deleted), 400 (Validation), 401 (Unauthorized), 404 (Not Found)
- Ne jamais retourner de donnees sensibles (`password_hash`, tokens internes)

## WebSocket

- Plugin dedie : `src/plugins/websocket.ts`
- Logique WS dans `WsHandler` (classe separee, pas un plugin)
- `ConnectionManager` : mapping userId <-> WebSocket connections
- Auth WS via query params (`token` + `api_key`), pas les headers
- Le WsHandler instancie ses propres services via `new XxxService(db)`
- Try/catch dans le WsHandler pour le parsing des messages — renvoyer erreur structuree au client

## Gestion d'erreurs

- **Pas de try/catch dans les routes HTTP** : error-handler global gere tout
- `reply.notFound('Message')`, `reply.badRequest('Message')` etc. (via `@fastify/sensible`)
- Les erreurs Zod : `{ statusCode: 400, error: 'Validation Error', message: { champ: 'description' } }`
- Les erreurs inconnues : 500 generique (detail loge, pas expose au client)
