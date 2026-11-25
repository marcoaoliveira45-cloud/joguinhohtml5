# HTML Run

Um jogo de corrida pixelado com tema HTML5. Pule as tags para sobreviver e aumentar sua pontuação.

## Como jogar

- Abra `index.html` no navegador ou publique o repositório pelo GitHub Pages.
- Aperte **Espaço**, **Seta para cima** ou **W** para pular.
- No celular, toque no jogo.
- Use o botão **Começar jogo** para iniciar ou reiniciar.

## Placar ao vivo (Supabase)

O jogo funciona sem configurar o placar. Para compartilhar pontuações em tempo real entre os visitantes:

1. Crie um projeto gratuito em [supabase.com](https://supabase.com/).
2. No **SQL Editor** do projeto, abra e execute todo o conteúdo de [`supabase-setup.sql`](./supabase-setup.sql). Isso cria a tabela, aplica as políticas de acesso e adiciona a tabela à publicação de Realtime.
3. A URL do projeto e a chave pública Publishable já estão em `supabase-config.js`. A chave pública é apropriada para o navegador; nunca use a chave secreta `service_role` ou `sb_secret`.
4. Publique o site novamente. Os jogadores escolhem um apelido, e as dez maiores pontuações aparecem e se atualizam ao vivo.

Como o jogo e o envio de pontos acontecem no navegador, este placar de demonstração não impede pontuações manipuladas.

A cada 1.000 pontos, o jogo sobe um nível: a velocidade aumenta e os obstáculos aparecem com intervalos menores. Tags no chão e pássaros no céu exigem pulos em momentos diferentes. A cada 4.000 pontos começa uma fase noturna de 1.000 pontos, com céu estrelado, lua e meteoros que caem do céu.