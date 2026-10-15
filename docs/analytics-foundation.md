# GA4 analytics foundation

## Data collection

This repository has Firebase project `alcohoal-calculator` (project number `326931345291`) and GA4 property `493637962`, with Android and iOS streams. The project and streams were checked by the release coordinator. In the authenticated GA4 browser console, the existing report for August 26–September 22, 2026 showed 23 total users, 168 events, and $0 revenue over the preceding 28 days. The separate CLI report request returned HTTP 403 because its OAuth scopes were insufficient; that limits CLI access, not browser report visibility.

Native defaults disable Analytics and Crashlytics collection before JavaScript starts. `firebase.json` keeps Expo prebuilds configured; the checked-in Android manifest and iOS Info.plist carry the same Analytics defaults. Automatic screen reporting is disabled because the app sends finite route names. The consent initializer starts with closed analytics and ad-request gates, evaluates UMP state, awaits both SDK collection toggles, and opens analytics only after success. The ad gate follows UMP's `canRequestAds` result and stays closed during startup, privacy-option changes, and errors. Denial or errors close analytics. Calls made before consent or after denial are discarded, never queued. The UMP device-storage choice controls Analytics and Crashlytics collection here; it does not imply GA4 ad-storage, ad-user-data, or ad-personalization consent.

When UMP reports that privacy options are required, Settings displays a translated Privacy choices entry. Opening it immediately closes ad requests and analytics, presents the SDK form, then refreshes UMP status and device-storage choices before restoring allowed collection. A form error leaves collection closed and shows an error alert. For Android emulator QA only, start Metro with `EXPO_PUBLIC_UMP_DEBUG_GEOGRAPHY=EEA npx expo start --dev-client --clear --port 8081`; the override is effective only when `__DEV__` is true and is ignored by production bundles. [Google's UMP guide](https://developers.google.com/admob/android/privacy) requires a visible privacy-options entry point when indicated by the SDK and checking `canRequestAds` before ad requests.

Firebase documents that runtime `setAnalyticsCollectionEnabled` can persist across launches and override the static collection default. On a device that previously enabled collection, the SDK may initialize under that persisted setting before JavaScript can re-evaluate UMP. Native startup behavior on such upgrade paths needs device validation before claiming strict pre-consent prevention across launches. The JavaScript gate still prevents app-authored events until consent resolves.

References: [React Native Firebase Analytics usage](https://rnfirebase.io/analytics/usage), [Firebase Analytics collection control for Android](https://firebase.google.com/docs/analytics/configure-data-collection?platform=android), [Firebase Analytics collection control for Apple](https://firebase.google.com/docs/analytics/configure-data-collection?platform=ios).

## Event contract

Every app-authored event includes `analytics_version=2`. Event and parameter names are lowercase snake case, at most 40 characters; at most 25 parameters are forwarded. Strings must be short public tokens (letters, digits, underscore, hyphen; at most 100 characters). Numeric values must be finite and between 0 and 1,000,000. Boolean call-site values become GA4 integer `0` or `1`. Email addresses, free text, query strings, paths, and nonfinite values are dropped. Failed SDK calls emit fixed diagnostics without payloads. Firebase automatically measures app/session and ad revenue events; this app does not manually emit `session_start` or `ad_impression`.

Current foundation events:

| Event | Parameters | Meaning |
| --- | --- | --- |
| `screen_view` | `screen_name`, `screen_class` | One view per finite Expo route transition after consent; current route sent once when consent resolves |
| `screen_engaged` | `screen_name`, `duration_sec` | Foreground route duration at least 3 seconds, capped at 3600 seconds |
| `notification_opened` | `type` | Deduplicated notification response; `daily`, `weekly`, or `drive_safe` |

Existing wrapper events retain their event names: `calculator_used`, `session_started`, `session_ended`, `session_discarded`, `session_shared`, `quiz_started`, `quiz_completed`, `quiz_retry_ad_watched`, `drink_logged`, `challenge_started`, `challenge_completed`, `weekly_goal_set`, `weekly_goal_exceeded`, `recipe_viewed`, `encyclopedia_viewed`, and `notification_toggled`. Their parameters are public taxonomy values or coarse counts. In schema 2, `session_ended` uses `duration_bucket` and `drink_count_bucket` instead of exact seconds/count; challenge and weekly-goal events use `target_days_bucket` and `limit_drinks_bucket` instead of exact targets. BAC estimates and danger thresholds still drive the in-app display and warning haptics, but health-derived BAC results are not sent to analytics. Content IDs are public static catalog IDs.

The ad lane emits `ad_request`, `ad_loaded`, `ad_failed`, `ad_shown`, `ad_dismissed`, `ad_clicked`, `ad_suppressed`, and `reward_outcome`. Parameters include finite `ad_format`, `placement`, `reason`/`failure_reason`, `outcome`, and bounded `error_code`. No ad revenue or impression duplication is sent manually.

The domain-specific event catalogs and parameter taxonomies are in [calculator/content analytics](analytics-calculators-content.md), [engagement analytics](analytics-engagement.md), and [ad analytics](analytics-ads.md). Review all three before registering custom definitions so that only dimensions used by analysis are added.

## Console setup and validation

The authenticated AdMob Android app settings for Google Play package `com.jiamyun.alcoholcalculator` show app ID `ca-app-pub-7612314432840835~3082062514`. The prior repository Android app ID ended in `~5764066171`; the Expo plugin, Expo AdMob config, and checked-in Android manifest now use the console-confirmed ID. This identifies the app for the Ads SDK and is distinct from individual ad-unit IDs. The iOS app ID and ad-unit IDs were not changed.

GA4 Admin has 27 registered custom definitions. The app uses event-scoped dimensions such as `analytics_version`, `screen_name`, `calculator_type`, `duration_bucket`, `drink_count_bucket`, `target_days_bucket`, `limit_drinks_bucket`, `ad_format`, `placement`, `failure_reason`, and `outcome`. A previously registered `peak_bac_level` definition is unused by this privacy revision and should not be used for new reports. The AdMob–Firebase link is verified; key-event choices and development/internal traffic filters still require console verification. In a native Android run after UMP publication, measurement was enabled, one home `screen_view` carried schema 2, and calculator events received HTTP 204. GA4 DebugView and real EEA accept/reject flow remain unverified. Debug traffic should not be interpreted as production usage.

## Build gate & custom dimensions (2026-10-08)
- **Dev builds never collect.** `setDataCollectionEnabled` only enables Analytics/Crashlytics when `isCollectionAllowedForBuild()` is true (release builds; jest is exempt). Real-device QA on debug builds had been counted in GA (e.g. all `quiz_question_answered`, `session_*`, `tracker_*` events in Sep 10–Oct 7 came from 1–2 QA users). Test: `__tests__/analyticsBuildGate.test.ts`.
- **GA4 custom dimensions (event scope)**: 27 were registered on 2026-09-23; added `surface`, `target_days_bucket`, `limit_drinks_bucket` on 2026-10-08 (30 total). Registration is not retroactive.
- **Baseline (Sep 10–Oct 7, 28 days, includes some QA traffic)**: 42 active users, 41 first_open, 3 app_remove. Screen views: home 48%, explore 19%, tracker 10%, quiz 7%, session 3.5%. Calculator funnel: opened 122 → first input 83 (68%) → attempted 187 → succeeded 172 (92%), validation_failed 15 (5 users); preset_selected 65 (8 users).
