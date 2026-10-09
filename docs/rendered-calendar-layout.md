# Rendered calendar layout and today marker

The layout suite mounts the actual page with `react-dom/client`, real React hooks, published shared components and the consumer override stylesheet. The existing front harness serves actual frontend route handlers against existing contract-checked BFF mocks. The three executable today-marker/timer tests remain intact; the source-spelling integration guard is replaced by observing the real date controls after bootstrap, selection changes and switching to week view.

Computed styles cover real sidebar commands, drawer opening/closing, month/week event markup, upcoming scroll-region preparation, main overflow/insets, typography and explicitly supplied density contexts. Selection changes are observed on rendered controls while today's marker remains independent. The shadow token declaration is checked in supplied light/dark contexts; JSDOM retains the variable reference on cards, so this does not prove resolved native shadows or settings persistence.

Parsed CSSOM policies retain the media-to-selector association, bounded tracks/list heights, mobile insets, fallback footer, small-text tokens and focus outlines. These are configuration policies. JSDOM simplifies nested CSS math and does not reliably expand outline shorthand into computed longhands; numeric/color outline properties are therefore checked from the parsed shorthand. It does not evaluate media queries, compile Tailwind, measure layout/scrolling or implement native hit-testing. Separate browser checks are required on integrated main and refreshed local-current.

JSDOM is a development-only dependency, pinned to the published `30.1.1`. Use a runtime supported by its package engines, for example Node `24.19.0`; CI uses `24.21.0`. Existing production dependencies, contracts, application styles and accessibility controls remain unchanged. Synthetic test data and clock are isolated from the delivered runtime.

```sh
node --test --test-concurrency=1 tests/calendar-rendered-layout.test.cjs tests/calendar-responsive-layout.test.cjs tests/calendar-today-marker.test.cjs
```
