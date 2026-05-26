# BrewANO — Changelog

## Versão 1.01B137 (atual)

### Suporte Multilíngue (14 idiomas)
- Inglês (en), Português (pt-BR), Espanhol (es), Alemão (de), Francês (fr)
- Italiano (it), Japonês (ja), Russo (ru-RU), Holandês (nl), Polonês (pl)
- Sueco (sv), Norueguês (no), Dinamarquês (da), Tcheco (cs)
- Arquivos JSON servidos via SPIFFS com carregamento sob demanda
- Troca de idioma propaga instantaneamente em toda a interface via LayoutContext

### Importação de Receitas
- **BeerSmith** (.bsmx) — XML com MashStep/Hop
- **BeerXML** (.xml) — XML padrão cervejeiro
- **BeerSmith JSON** — exportação JSON do BeerSmith
- **BrewFather JSON** — exportação JSON do BrewFather
- Importação de múltiplos arquivos simultâneos (seleção múltipla)
- Salvamento sequencial (async/await) para não sobrecarregar o ESP8266
- Feedback visual de sucesso/parcial/falha por receita
- Botão dedicado na aba Recipes

### Interface Web — Novo Layout Moderno
- Tema escuro roxo/âmbar (#7c3aed / #f59e0b) com cards arredondados
- Navbar superior com abas compactas: Brew | Settings | Recipes | WiFi | AP | NTP | OTA | About
- Layout clássico preservado como opção (drawer lateral + velocímetro)
- Toggle entre layouts via botão no menu e nas configurações
- Preferência salva em localStorage
- Gauges modernos com barras de progresso coloridas (verde/azul/vermelho)

### Correções e Melhorias
- **SPIFFS**: auto-formatação em caso de falha na montagem após mudança de partição
- **WiFi**: detecção e correção de arquivos de configuração corrompidos
- **Sensores**: auto-seleção do 1º sensor como Main, 2º como Sparge, demais como Aux 1-3
- **Temperatura**: exibição com 2 casas decimais
- **Títulos**: removidos títulos duplicados nos menus de configuração
- **Pump**: painel renomeado para "Pump" com campos "Pump ON time" / "Pump OFF time"
- **About**: versão do firmware exibida na página
- **Importação**: tratamento robusto de erros, salvamento sequencial
- **Mobile**: compatibilidade com navegadores desktop e mobile

### Estabilidade
- Partição SPIFFS padrão (sem ldscript) para compatibilidade com mkspiffs
- JS comprimido via gzip (660KB total no SPIFFS)
- Auto-formatação de SPIFFS em primeiro boot após flashing
- Tratamento de erro em todas as operações fetch
- Fallback para inglês em caso de falha no carregamento de idioma

---

## Histórico de Versões
| Versão | Descrição |
|--------|-----------|
| 1.01B137 | Gzip JS + partição padrão, 660KB SPIFFS |
| 1.01B135 | JS sem compressão para compatibilidade mobile universal |
| 1.01B134 | Importação sequencial com async/await e tratamento de erro |
| 1.01B131 | Reativação do gzip + partição 2MB SPIFFS |
| 1.01B130 | Importação multi-arquivo na aba Recipes |
| 1.01B128 | Remoção de gzip para compatibilidade iOS Safari |
