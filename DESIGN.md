# Alcohol Calculator Design System

## 1. Atmosphere & Identity

An existing dark utility app: quiet charcoal surfaces, white labels, and green action emphasis. Settings uses a single scrolling column of grouped cards; the privacy entry follows that pattern.

## 2. Color

| Role | Existing token/class | Use |
| --- | --- | --- |
| Page | `bg-gray-900` | Settings background |
| Card | `bg-gray-800` | `Card` surface |
| Main text | `text-white` | Titles and action labels |
| Supporting text | `text-gray-400`, `text-gray-300` | Explanations and secondary actions |
| Divider | `border-gray-700`, `border-gray-600` | Rows and outlined buttons |
| Action | `bg-green-600`, `#22c55e` | Primary buttons and enabled switches |

## 3. Typography

| Role | Existing class | Use |
| --- | --- | --- |
| Screen title | `text-xl font-bold` | Settings heading |
| Section heading | `text-lg font-semibold` | Group titles |
| Row label | `text-base` | Switch and privacy action labels |
| Supporting copy | `text-sm leading-5`, `text-xs` | Hints |

## 4. Spacing & Layout

Settings uses `p-4` page padding, `mb-6` section gaps, and `mb-3` header-to-card spacing. `Card` supplies `rounded-xl p-4`. Rows use `py-3`, flex alignment, and full-width wrapping inside the card.

## 5. Components & States

`Card` in `components/ui/Card.tsx` is the shared settings surface. A settings action is a `TouchableOpacity` with an accessible button label and `activeOpacity={0.75}`. The privacy action is visible only when the SDK says it is required; it becomes disabled while the form is updating. Failure uses the app's existing `Alert.alert` error pattern.

## 6. Motion & Interaction

Keep the existing touch-opacity response. No new animation or navigation transition is needed. The native UMP sheet owns its presentation and dismissal.

## 7. Depth & Borders

Page and card use the existing `gray-900`/`gray-800` tonal separation. Reuse card radius and row dividers; introduce no new shadows.

## 8. Accessibility Constraints & Accepted Debt

The privacy action needs a translated accessibility label, at least a 44-point touch target, a disabled state during the form, and labels that wrap without clipping in Korean and English. This scoped change accepts no new accessibility debt.
