# Voto Simulado Brasil

Primeira versão estática e responsiva de uma urna fictícia. Não é serviço oficial, não tem vínculo com o TSE e não realiza votação real.

## Arquivos
- `index.html`: estrutura da página
- `styles.css`: visual responsivo
- `app.js`: interação, contagem local e configuração Pix

## Testar no computador
Abra `index.html` em um navegador moderno. Para testar o botão de copiar Pix, publique o site via HTTPS.

## Configurar o Pix
1. Abra `app.js`.
2. Localize `const PIX_KEY = "";`.
3. Insira entre aspas a chave que você decidiu divulgar. Recomenda-se chave aleatória e conferir o nome exibido no banco.
4. Salve e teste. Não inclua senhas, códigos de acesso ou dados bancários privados.
A chave Pix fica pública no código do site; use apenas uma chave destinada a receber contribuições públicas.

## Publicar grátis usando GitHub Pages
1. Crie uma conta no GitHub em https://github.com/.
2. Crie um repositório público chamado `voto-simulado-brasil`.
3. Envie os três arquivos (`index.html`, `styles.css`, `app.js`) para a raiz do repositório.
4. No repositório, abra **Settings → Pages**.
5. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main`, pasta `/(root)` e salve.
6. Aguarde a publicação; o GitHub mostrará o endereço do site na área Pages.
A interface do GitHub pode mudar. Se usar GitHub Pages, confirme os termos atuais do serviço antes de publicar.

## Alternativa: Cloudflare Pages
Acesse https://pages.cloudflare.com/ e siga o fluxo para criar um projeto Pages a partir do repositório Git ou fazer upload dos arquivos estáticos, conforme as opções disponíveis na sua conta.

## Limitações importantes
- Os números e resultados ficam no `localStorage` do navegador de cada visitante. Não são agregados entre pessoas, dispositivos ou navegadores.
- Para um total compartilhado entre todos os visitantes, seria necessário um backend ou serviço de banco de dados, com medidas de privacidade, proteção contra abuso e uma explicação clara do método de contagem.
- Não apresentar os resultados como pesquisa eleitoral, previsão confiável ou resultado oficial.
- Publique um aviso visível de independência e simulação, já incluído na página.
