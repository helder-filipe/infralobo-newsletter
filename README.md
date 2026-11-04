# Newsletter interna mensal · Infralobo

Plataforma estática para criar uma newsletter interna mensal respeitando a paleta institucional da Infralobo.

## Funcionalidades
- Uma notícia principal em destaque e **0 a 10 notícias adicionais**.
- Imagens por URL HTTPS, campos de edição e pré-visualização responsiva.
- Pré-visualização com cinco linhas e botão **Ver mais / Ver menos**.
- Guardar automaticamente no navegador e importar/exportar edições em JSON.
- Exportação HTML e **.eml compatível com Outlook**, com o texto completo de todas as notícias (sem truncagem).
- Impressão / gravação em PDF pelo navegador.

## Execução
Abrir `index.html` num navegador ou servir como site estático. Não necessita de dependências nem de compilação.

## Publicação na Vercel
Importar este repositório para um projeto Vercel com Framework Preset **Other**. O diretório de saída é a raiz do repositório.

## Nota importante sobre o Outlook
Para que as imagens sejam apresentadas no e-mail, utilizar URLs HTTPS publicamente acessíveis e estáveis. O ficheiro .eml abre como mensagem no Outlook, mas o comportamento pode variar entre versões: confirmar remetente, destinatários e imagens antes do envio. O HTML do e-mail contém **todos os textos na íntegra**; os botões interativos «Ver mais» são usados apenas na pré-visualização web.

## Identidade visual
Paleta: #386641, #6A994E, #A7C957. O lettering presente neste protótipo é texto estilizado, **não é o logótipo oficial**. Substituir por um PNG institucional aprovado (fundo transparente) antes da distribuição final.
