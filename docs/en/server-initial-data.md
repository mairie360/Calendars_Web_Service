# Initial server data

Calendar renders confirmed initial data through the pinned published SDK GET operations, a request-local Axios adapter, and the existing same-origin proxy. Reads use `no-store` and the configured validated public origin. Only the access cookie is read on the server; refresh remains in the existing browser recovery route. No token, cookie, or unknown response field is serialized.

The server selects the visible period from the validated URL and the instance civil date (INSTANCE_TIMEZONE). The confirmed period seeds the account-scoped bounded cache; period navigation, prefetch cancellation, and foreground draft protection remain active.

A missing/expired access context, rejected request, unavailable upstream, or invalid DTO produces an explicit unavailable receipt. Hydration retries through the existing browser route. Server rendering neither rotates cookies nor reports a failed read as successful empty data. Each server navigation supplies a fresh opaque client lifetime key; foreground updates retain local drafts.

The local `loading.tsx` uses a persistent live status and static placeholder surfaces without animation. It adds no unpublished UI dependency. Server page/loading sources retain the same 60% per-file line requirement; environment ownership grants no coverage exception.

Validation evidence and performance results are recorded separately: this implementation alone makes no latency or rendering budget claim.
