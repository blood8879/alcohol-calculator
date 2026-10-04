# Ad funnel events

All events pass through `logFirebaseEvent`, which applies the app's analytics permission gate and parameter schema. The app does not emit `ad_impression`, `ad_click`, `ad_reward`, or revenue events; AdMob/Firebase linking owns automatic impression and revenue measurement.

| Event | Trigger | Parameters |
| --- | --- | --- |
| `ad_request` | A banner mounts or a fullscreen slot calls `load()` | `ad_format`, `placement` |
| `ad_loaded` | SDK reports loaded | `ad_format`, `placement` |
| `ad_failed` | SDK error or synchronous load/rejected show | `ad_format`, `placement`, `error_code`, `failure_reason` |
| `ad_shown` | Fullscreen SDK `OPENED` only | `ad_format`, `placement` |
| `ad_dismissed` | Fullscreen SDK `CLOSED` after an open, or banner click-through returns | `ad_format`, `placement` |
| `ad_clicked` | SDK `CLICKED` for fullscreen, banner `onAdOpened` for click-through | `ad_format`, `placement` |
| `ad_suppressed` | A show attempt is not ready or fails | `ad_format`, `placement`, `reason` |
| `reward_outcome` | Reward earned, free fallback, or video closed before reward | `ad_format`, `placement`, `outcome` |
| `quiz_retry_ad_watched` | SDK `EARNED_REWARD` exactly once | none |

Finite values:

- `ad_format`: `banner`, `interstitial`, `rewarded`
- `placement`: `anchored`, `inline`, `quiz`, `session_end`, `quiz_retry`
- `error_code`: `1` for load, `2` for show
- `failure_reason`: `no_fill`, `network`, `invalid_request`, `internal`, `show_failed`, `unknown`
- `reason`: `not_ready`, `show_failed`
- `outcome`: `earned_reward`, `free_fallback`, `dismissed_without_reward`

The SDK error message, unit ID, revenue, and raw route are never event parameters. Banner loading is not counted as a view because this SDK's banner callbacks do not expose a reliable impression event.

The production quiz interstitial uses AdMob's `퀴즈광고` unit `/7447353245`. The prior `/3082062514` suffix belongs to this Android app's AdMob app ID, not an ad unit. The five production unit IDs were checked against the target app's AdMob unit table; development continues to use SDK test IDs.
