# Calculator and content analytics

All events use `logFirebaseEvent`. Event names are 40 characters or fewer and each event has at most four parameters. Parameters carry only fixed categories, catalog IDs, booleans, indexes, and buckets. Never add input values, BAC, weight, sex, drink names, translated labels, notes, free-text queries, or stored history IDs.

## Calculator funnel

| Event | Parameters | Fires |
| --- | --- | --- |
| `calculator_opened` | `calculator_type`, `entry_source=home_grid` | Home grid opens the modal, once per open action. |
| `calculator_first_input` | `calculator_type`, `field_index` | First text edit, option selection, or preset use in one card instance. No input value. |
| `calculator_preset_selected` | `calculator_type`, `preset_id` | Catalog preset selection. ID must be a short static slug. |
| `calculation_attempted` | `calculator_type` | Calculate button pressed. |
| `calculation_succeeded` | `calculator_type` | Result is nonempty, has no translated error label, and has no NaN or Infinity output. |
| `calculation_validation_failed` | `calculator_type` | Any other calculation result. |
| `calculator_used` | `calculator_type` | Legacy event, now only alongside `calculation_succeeded`. |
| `calculator_guide_opened` | `calculator_type` | Inline explanation expands. |
| `calculator_recommendation_tapped` | `calculator_type`, `target` | Result recommendation tapped. |
| `calculator_share_attempted` | `calculator_type` | Share button tapped. |
| `calculator_share_completed`, `calculator_share_dismissed`, `calculator_share_failed` | `calculator_type` | Native share sheet returns shared action, dismissed action, or throws. `completed` means the OS reported a share action; it does not prove recipient delivery. |
| `calculator_closed` | `calculator_type`, `close_reason`, `had_result`, `duration_bucket` | Modal closes by button, backdrop, swipe, Android back button (`back`), or recommendation. Duplicated dismissal callbacks are ignored. `had_result` means at least one successful calculation. |
| `calculator_history_opened` | `item_count` | History screen focuses, with count bucket only. |
| `calculator_history_action` | `action` | Favorite/delete tapped or clear confirmed. The event represents intent, since legacy history storage does not report write failures. No history ID is sent. |

Calculator types use the existing nine keys, including camel-case `alcoholContent`, `freezingPoint`, and `unitConverter`. Duration buckets are `under_10s`, `10_59s`, `1_4m`, and `5m_plus`.

## Content funnel

| Event | Parameters | Fires |
| --- | --- | --- |
| `content_section_selected` | `section`, `source=tab|deep_link` | Explicit tab switch or validated section/guide deep link. |
| `content_search` | `section`, `query_length`, `result_count` | Nonempty recipe or encyclopedia search settles for 700 ms. No query is sent. |
| `content_filter_used` | `section`, `filter` | Recipe category or recommender filter/ingredient category chosen. Ingredient identity is omitted. |
| `recipe_viewed`, `encyclopedia_viewed` | `item_id` | Recipe detail opens or encyclopedia card expands. Existing event names remain. |
| `guide_viewed` | `item_id` | Catalog guide detail expands, including valid deep link. |
| `guide_next_step_tapped` | `item_id`, `target` | Guide's next action tapped. |
| `content_favorite_added`, `content_favorite_removed` | `content_kind`, `item_id` | Favorite storage write succeeds; failed writes emit neither event. |
| `recommender_used` | `result_count`, `ingredient_count` | Recommender controls change and results recompute. |
| `home_content_clicked` | `content_kind`, `item_id`, `source=favorite|recent` | Home content rail item tapped. |
| `home_cta_clicked` | `target`, `source` | Daily card, quiz row (`quiz_banner`), session card (`session_banner`), or this-week summary tile (`week_summary`) tapped. |

Only IDs present in the bundled recipe and encyclopedia catalogs are emitted. Query length buckets are `1_2`, `3_5`, `6_10`, `11_plus`; result and ingredient count buckets are `zero`, `1_5`, `6_20`, `21_plus`. Recommender ABV/calorie thresholds and ingredient keys are not sent.

## QA

Run `npm test -- --runInBand __tests__/calculatorAnalytics.test.ts __tests__/calculationCardAnalytics.test.tsx __tests__/contentAnalytics.test.ts __tests__/contentStorageAnalytics.test.ts`, `npm run typecheck`, and `npm run lint`. On a Firebase DebugView enabled build, open a calculator, enter a value twice, submit an invalid and then valid calculation, share and dismiss, and close; confirm one first-input event, the correct outcome for each attempt, one legacy event for the valid attempt, and one close event. Browse a catalog guide, search, change a filter, and favorite/unfavorite; verify no raw query or input values appear in event parameters.
