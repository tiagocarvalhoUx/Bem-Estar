# 🔧 Criar Índice para Sessões

## Erro

```
The query requires an index for pomodoro_sessions
```

## Solução

### Opção 1: Link Direto (MAIS FÁCIL)

Clique no link que aparece no erro do console:

```
https://console.firebase.google.com/v1/r/project/bem-star-eb9a0/firestore/indexes?create_composite=...
```

### Opção 2: Criar Manualmente

1. Acesse: https://console.firebase.google.com/project/bem-star-eb9a0/firestore/indexes
2. Clique em **Create Index**
3. Preencha:
   - Collection ID: `pomodoro_sessions`
   - Campo 1: `userId` → Order: **Ascending**
   - Campo 2: `completedAt` → Order: **Descending**
   - Query scope: **Collection**
4. Clique em **Create Index**
5. Aguarde 2-5 minutos

## Resultado

Após criar, as sessões do Pomodoro serão carregadas corretamente e aparecerão nas estatísticas.
