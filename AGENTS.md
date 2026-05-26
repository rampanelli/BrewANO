# AGENTS.md — BrewANO

## Repositórios
- **BrewUNO** (original): https://github.com/rampanelli/BrewUNO — branch `iaBrew-1.02`
- **BrewANO** (principal): https://github.com/rampanelli/BrewANO — branch `master`

## Versionamento
- Contador no `platformio.ini`: `-D Version=\"1.01BXXX\"`
- Incrementar a cada push para GitHub
- Atualizar também em `interface/src/containers/About.js`

## Ícones e Imagens — Dimensões

| Arquivo | Dimensão | Uso |
|---|---|---|
| `app/logo.png` | 154×34 px | Logo na AppBar (clássico: tamanho natural; moderno: height=32px) |
| `app/icon.png` | 256×256 px | Ícone PWA (manifest.json) |
| `favicon.ico` | 16×16 px / 32 bits | Ícone da aba do navegador |
| `images/pump-on.png` | 90×60 px | Botão de bomba ligada (Brew day) |
| `images/pump-off.png` | 90×60 px | Botão de bomba desligada (Brew day) |

**Atenção:** Manter proporções exatas ao criar novos ícones para não distorcer o layout.

## Estrutura do Projeto
```
BrewUNO/
├── platformio.ini          # Versão, flash, build flags
├── src/                    # Código C++ (ESP8266 Arduino)
│   ├── main.cpp            # Setup, WiFi, SPIFFS, Alexa
│   └── BrewUNO/            # Serviços: Brew, Mash, Boil, PID, Sensores
├── data/                   # Arquivos para upload SPIFFS
│   ├── www/                # Interface web compilada
│   ├── lang/               # Arquivos de idioma JSON (14 idiomas)
│   └── config/             # Configurações padrão (WiFi, sensores, etc.)
└── interface/              # Frontend React
    ├── src/
    │   ├── components/     # MenuAppBar, ModernMenuAppBar, BrewStatusGadget, RecipeList, RecipeEditor
    │   ├── containers/     # Brew, BrewConfiguration, WiFiConfiguration, etc.
    │   ├── forms/          # BrewSettingsForm, WiFiSettingsForm, etc.
    │   ├── language/       # 14 arquivos JSON de tradução
    │   └── context/        # LayoutContext (tema, idioma)
    └── public/             # index.html, ícones, imagens

## Comandos
```bash
# Build da interface web
cd interface && npm run build

# Upload para ESP8266
pio run --target upload      # firmware
pio run --target uploadfs    # sistema de arquivos SPIFFS
```

## Idiomas
14 idiomas: en, pt-BR, es, de, fr, it, ja, ru-RU, nl, pl, sv, no, da, cs

## Layouts
- **Clássico** (padrão anterior): tema escuro com drawer lateral, gráficos de velocímetro (PieChart)
- **Moderno** (padrão atual): tema escuro roxo/âmbar com top navbar, gráficos de barra
- Toggle entre layouts no menu Settings e no drawer/AppBar
- Preferência salva em `localStorage` (`brewuno_modern_layout`)
