# Searchora — Design System 2026

Source de vérité absolue pour toute l'UI. Ne pas inventer, ne pas dévier.
Stack : Next.js (App Router) + Tailwind 4 (tokens via `@theme` dans `src/app/globals.css`).
Les tokens historiques (`brand`, `text-primary`, `surface-*`, `border`) sont mappés sur cette palette — les utiliser via Tailwind (`bg-brand`, `text-text-secondary`, …).

## Tokens couleur

| Token | Valeur | Usage | Tailwind |
|---|---|---|---|
| `--ink` | `#0E1726` | texte principal | `text-text-primary` / `text-ink` |
| `--ink-soft` | `#51617A` | texte secondaire | `text-text-secondary` / `text-ink-soft` |
| `--paper` | `#F5F9FE` | fond de page (blanc bleuté) | `bg-paper` |
| `--paper-2` | `#E9F1FA` | surfaces secondaires, bandeaux | `bg-surface-secondary` / `bg-paper-2` |
| `--line` | `#D8E4F2` | bordures | `border-border` / `border-line` |
| `--blue` | `#2E8BFF` | actions, liens, accents | `bg-brand` / `text-blue` |
| `--blue-deep` | `#1568DF` | hover des actions | `bg-brand-hover` / `bg-blue-deep` |
| `--mark` | `#BDE2FF` | surligneur signature (mots-clés, citations) | `bg-mark` |
| `--mark-soft` | `#E3F1FF` | fonds d'icônes, chips | `bg-mark-soft` / `bg-brand-50` |
| `--ok` | `#1E9E6A` | succès | `text-ok` |

Fond sombre (sections CTA) : `#0C1A2E` avec halo radial `rgba(46,139,255,.5)` → classe `.cta-dark`.
Radius : **14px** pour les cards, **999px** pour les boutons pill. Rien d'autre.
Largeur max contenu : **1180px** (`.container-wide`).

## Typographie (Google Fonts)

- Titres h1–h3 : **"Bricolage Grotesque"**, graisses 600–800, letter-spacing -0.02em à -0.03em
- Corps : **"Instrument Sans"**, graisses 400–600
- Labels / données / eyebrows : **"IBM Plex Mono"**, uppercase, letter-spacing .1em à .14em, 11–13px (`.font-mono`, classe `.eyebrow`)
- h1 : `clamp(40px, 5.2vw, 64px)`, line-height 1.04
- h2 : `clamp(30px, 3.6vw, 44px)`, line-height 1.1

## Composants canoniques

- **Bouton primaire** : pill, fond `--blue`, texte blanc, ombre `0 10px 24px -8px rgba(46,139,255,.55)` ; hover = fond `--blue-deep` + `translateY(-2px)` + ombre renforcée → `<Button variant="primary">`
- **Bouton secondaire** : pill, fond blanc, bordure `--line` ; hover = bordure et texte `--blue` + `translateY(-2px)` → `<Button variant="secondary">`
- **Card** : fond `#fff`, bordure 1px `--line`, radius 14px, padding 32px ; hover = bordure `--blue`, `translateY(-4px)`, ombre `0 20px 40px -22px rgba(21,104,223,.35)` → `<Card>`
- **Eyebrow** : IBM Plex Mono uppercase couleur `--blue`, précédé d'un tiret horizontal de 22px → classe `.eyebrow` / `<SectionLabel>`
- **Surligneur signature `.mk`** : fond `--mark` derrière UN mot-clé du h1, légèrement incliné (skew -4deg), animé scaleX 0→1 depuis la gauche au chargement. Une fois par page minimum, trois fois maximum.
- **Chip** : IBM Plex Mono 11.5px, pill, bordure `--line` ; variante active = bordure `--blue`, fond `--mark-soft` → classes `.chip` / `.chip-active`
- **Icônes** : SVG inline trait 1.6px `stroke="currentColor"` (lucide-react `strokeWidth={1.6}`), dans pastille 46×46px radius 12px fond `--mark-soft` bordure `#C9E2FB` (classe `.icon-tile`) ; hover de la card parente = pastille fond `--blue`, icône blanche.
  **INTERDIT** : emojis, icônes pleines, images bitmap pour les icônes.
- **Coches/croix de listes** : SVG trait 2.4px, vert `--ok` / rouge `#B33`. Jamais les caractères ✓ ✕.

## Animations

- Easing unique : `cubic-bezier(.2,.8,.2,1)` (`--ease`)
- Arrivée de page : cascade nav → eyebrow → h1 → paragraphe → CTA → preuves, délais 150ms puis +120ms par élément, `translateY(22px)→0` + fade → classe `.cascade` sur le parent
- Panneaux visuels : entrée `scale(.97)→1` + fade, délai 450ms → classe `.panel-in`
- Reveals au scroll : IntersectionObserver threshold .12, `translateY(24px)→0`, stagger 90ms entre éléments frères → `<AnimatedSection>` (prop `stagger` pour les grilles)
- **OBLIGATOIRE** : `prefers-reduced-motion: reduce` → tout visible immédiatement, zéro animation
- Maximum une séquence orchestrée par page. Pas d'animation sur chaque bloc de texte.

## Qualité minimale

- Responsive : breakpoints 1180 / 960 / 720px, mobile irréprochable
- `:focus-visible` : outline 2px `--blue`, offset 3px, sur tout élément interactif (défini globalement)
- Contraste AA sur tous les textes
- Formulaires : validation inline, message d'erreur clair sous le champ, jamais `alert()`
- Copy : sentence case, verbes d'action, pas de lorem ipsum, pas de jargon
- i18n : tout texte UI passe par `t('…')` (`src/lib/i18n`), clés en parité en/fr/es

## Structure commune des pages

- Nav sticky translucide (backdrop-blur) et footer : composants partagés (`src/components/layout/`), identiques partout
- Chaque page ouvre sur : eyebrow mono + h1 avec un mot surligné `.mk` + sous-titre `--ink-soft`
- Corriger au passage : stats sans valeurs, sections dupliquées, liens morts (`#`)

## Interdits absolus

- Emojis dans l'UI
- Gradients multicolores, néon, glassmorphism lourd
- Plus d'une police display
- Radius autres que 14px / 999px

## Déploiement

Production = Firebase App Hosting, rollout automatique à chaque push sur `main`.
Config env dans `apphosting.yaml`, secrets LLM dans Cloud Secret Manager.
