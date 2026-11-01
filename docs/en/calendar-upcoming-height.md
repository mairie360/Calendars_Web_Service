# Upcoming events card height

On wide screens, a short upcoming-events list used to stretch to the full calendar grid height. The card now keeps its natural content height. A long list is limited by both its available grid row and the existing viewport-derived cap; its content scrolls inside the card. Statistics remain first, and the calendar, sidebar width and event actions keep their existing arrangement.

Native local checks cover confirmed empty, one-event and thirty-event responses at 1920× 1080, month/week views, keyboard list scrolling and opening an event. The short card measures 263.25 px instead of 694.5 px; the empty card 87 px and the long card 560 px. Long-list checks at 390× 844, 768× 1024, 1280× 720 and 1920× 512 retain separate scrolling and show no horizontal overflow of the document or actual content main. These synthetic responses are confined to an isolated local QA data copy.

One old source-only test asserted the stretching CSS itself (`max-height: none` and a growing flex child). It passed while the short-card defect was visible. That assertion is removed; rendered geometry and interactions provide the relevant before/after evidence. Other existing tests, contract boundaries, security policies and coverage thresholds are preserved. This is a partial replacement under MAIR-437, not completion of the cross-frontend audit.

The cached local-demo Calendar stopped after startup with a TypeError. An isolated copy compiles successfully. Its copied Login needed one identical duplicate className removed before compilation, then still refused the simulated sign-in response after local cookie configuration. Original reference sources and data remain preserved; no connected 1920 px reference comparison is claimed. The change adjusts size within the existing area, without inventing a layout. Local simulation does not certify deployed authentication, permissions, BFF exchanges or persistence. Existing proof dates and commits remain distinct from later main/snapshot/dev validations.

Refs: MAIR-215, MAIR-383 and MAIR-437.
