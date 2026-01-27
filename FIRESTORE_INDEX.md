# 🔧 Configurar Índice do Firestore

## Problema

Erro ao carregar histórico de humor:

```
The query requires an index
```

## Solução Rápida

### Opção 1: Clique no Link Direto (MAIS FÁCIL)

O console mostra um link direto no erro. **Clique nele** e o Firebase criará o índice automaticamente:

```
https://console.firebase.google.com/v1/r/project/bem-star-eb9a0/firestore/indexes?create_composite=...
```

### Opção 2: Criar Manualmente

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto: **bem-star-eb9a0**
3. No menu lateral esquerdo, clique em **Firestore Database**
4. Na parte superior da tela, você verá **4 ABAS**:
   - **Data** (dados das coleções)
   - **Rules** (regras de segurança)
   - **Indexes** ← **CLIQUE AQUI**
   - **Usage** (uso)
5. Na aba **Indexes**, clique no botão **Create Index** (azul no canto superior direito)

**Configure o índice:**

- Collection ID: `mood_entries`
- Fields to index:
  1. Campo: `userId` → Order: **Ascending**
  2. Campo: `timestamp` → Order: **Descending**
- Query scope: **Collection**

6. Clique em **Create Index**
7. Aguarde 2-5 minutos até o status mudar de "Building" para "Enabled"

## ⚠️ Importante

Se não encontrar a aba "Indexes":

- Certifique-se de estar em **Firestore Database** (não "Realtime Database")
- Verifique se está no projeto correto (bem-star-eb9a0)
- As 4 abas ficam logo abaixo do título "Cloud Firestore"

## Verificação

Após criar o índice, recarregue o app. O erro deve desaparecer e o histórico de humor será carregado corretamente.
