# 디자인 레퍼런스 리서치 — refero.design (2026-10-03)

refero.design iOS 앱 라이브러리에서 우리 앱(음주 기록·절주 챌린지·주간 목표·통계·퀴즈)과 기능이 겹치는 앱을 직접 검색해 수집했다.
검색어: `alcohol drink tracker`, `water intake dashboard daily goal`, `sobriety streak counter`, `quick add drink log`, `weekly intake statistics chart`, `health quiz learning`.

> 이미지는 저작권 때문에 저장소에 넣지 않고 원본 URL만 남긴다(`https://images.refero.design/screenshots/<id>.jpg`).

## 1. 수집한 레퍼런스

| 앱 | 화면 | 가져올 패턴 | 원본 |
|---|---|---|---|
| **Waterllama** (음료·알코올 섭취 트래커) | 홈 | 상단 **원탭 음료 칩 행**(소다·맥주·와인·독주 + `추가/편집`) — 모달 없이 즉시 기록 | `274/mobile/bd0cd9fe-8d99-4eb6-a6c7-ee14fa56103b` |
| Waterllama | 일 요약 | 큰 합계 숫자 + 보조 **칩 2개**(`3.8 drinks`, `316mg caffeine`) + 좌 아이콘·이름·용량 / 우 시각의 **타임라인 리스트** | `274/mobile/5b8e7d2e-5fbe-4b14-868a-b71a7cfc7919` |
| Waterllama | 알코올 설정 | ABV 구간별 표준잔 설명(교육형 시트) | `274/mobile/0cc86c08-bc3a-4c29-9c5f-a3f34a8d88e6` |
| **FoodNoms** (영양·알코올 트래커) | Today | **목표 타일 2열 그리드**(아이콘+라벨, `28 remaining`, 체크 상태, 얇은 진행바) → 아래 기록 목록 + FAB | `48/mobile/2bdb3a53-…`, `48/mobile/1175d9d1-…` |
| FoodNoms | Goals | 지표별 주간 막대 + **목표선(한도 라인)** + `Avg. Consumption / Avg. Amount Below` 2분할 스탯 | `48/mobile/9a2a54a5-af7b-4e31-93a0-659f2cbf5937` |
| **Checker** (습관 보드) | Overview | `CURRENT STREAK 1 day / Longest: 1` + `CONSISTENCY` 게이지 **2분할 스탯 타일** | `210/mobile/39c91a6c-2364-45b4-a930-f6e67ad849c7` |
| **GrowPal** (수면) | Week | **Day/Week/Month 세그먼트**, 주인공 숫자 → 막대(목표 달성/미달 2색 + 범례) → 2열 스탯 타일(`-14% vs last week`) | `141/mobile/7cf0d9db-e28d-4825-bbfb-05cf89e20177` |
| **Clearful** | Progress | `Daily Average 7 min` 헤더 + 주간 막대, 아래 `Entries This Month / Year` 2열 숫자 타일 | `140/mobile/11301966-ef5e-4ed6-86cf-0a0bc0d5564b` |
| **Roots** | Streak | 큰 `4 days` + 마일스톤 목록(3·5·7·14·21·30일) | `190/mobile/3aa68a6b-3506-4546-91ac-b3ac9a78b637` |
| **Imprint** | Streaks & Goals | 요일 도트 7개로 주간 연속 표시 | `188/mobile/b13649ed-2f8d-40f2-8a64-004cc52a768b` |
| **GO Club** | 물 기록 | 큰 숫자 + `− / +` 스테퍼로 빠른 수량 조절 | `202/mobile/1d5aa185-4f64-4021-aaf1-48d3cdc65862` |

## 2. 공통 구조(레퍼런스에서 반복되는 것)

1. **상태 요약이 맨 위** — 목표/연속일을 2열 타일로 압축(FoodNoms Today, Checker). 긴 카드 대신 "숫자 하나 + 진행바" 타일.
2. **기록 입력 마찰 최소화** — 자주 마시는 음료를 원탭 칩으로(Waterllama), 세부 입력은 별도 시트.
3. **선택한 날의 요약 → 시간순 리스트** — 합계 칩 + 우측 정렬 시각(Waterllama).
4. **통계는 카드 하나로 통합** — 세그먼트로 지표 전환 + 목표선 + 2열 스탯 타일(GrowPal, FoodNoms Goals, Clearful).

## 3. 우리 앱 적용 — 트래커 탭 재구성 (명세서 §3.5 "스크롤 김 → 위계·요약 재설계")

| 순서 | 블록 | 레퍼런스 | 기존 대비 |
|---|---|---|---|
| ① | 헤더: `음주 기록` + 선택 날짜 부제, 우측 🍻 세션·`+ 음주 추가` | FoodNoms Today | 동일 기능, 44pt 터치 타깃 |
| ② | **상태 타일 2열**: [절주 챌린지 `D+n` + 목표일 진행바] [주간 목표 `5 / 7` + 진행바, 초과 시 빨강+문구]. 미설정 시 타일 자체가 시작/설정 CTA. 탭하면 기존 상세 카드(시작 7/14/30, 중단, 공유, 수정/해제)가 타일 아래에 펼쳐짐 | FoodNoms 목표 타일, Checker 스트릭 타일 | 카드 2개(약 1.5 화면) → 타일 1행. `D+n` 첫 화면 노출 보장 |
| ③ | 인사이트 카드(지난주 비교 문구) | — | 유지(첫 화면 노출 필수) |
| ④ | **빠른 기록 칩 행**: 최근 14일 자주 마신 음료 최대 4개(없으면 프리셋 소주·맥주·와인) + `직접 추가`. 탭 즉시 기록 + **되돌리기 토스트** | Waterllama 홈 | 신규. 명세서 "삭제 실수 방지(undo) 제안 환영" 반영 |
| ⑤ | 날짜 스트립 → **일 요약 칩**(`n잔 · n kcal · 순알코올 n g`) → 기록 리스트 | Waterllama 일 요약 | 요약 칩 신규 |
| ⑥ | **통계 카드 1장**: 세그먼트 `잔 수 / 칼로리` + 주간 막대(주간 목표 설정 시 일 한도선 = 한도÷7) → 2×2 스탯 타일(총 잔·kcal·일평균·지출) | GrowPal, FoodNoms Goals, Clearful | 차트 2장 + 요약 카드 → 1장 |
| ⑦ | 인라인 배너 | — | 위치 유지 |

### 지켜야 할 제약 (명세서 §2)
- 음주 조장 카피 금지 — 빠른 기록은 "기록" 도구로만 표현(“한 잔 더” 류 금지).
- 주간 목표 초과는 색 + 문구 + 바 병행(색만으로 상태 구분 금지).
- 표준잔 소수 1자리, 칼로리 정수 + `kcal`, 금액 천 단위 콤마.
- 기존 analytics 이벤트·위젯 갱신·주간 경계(일요일 시작) 유지.

---

# 홈 화면 레퍼런스 (2026-10-03 추가)

검색어: `health app home today summary`, `calculator tools grid home`, `utility app home tools grid`, `daily tip card home`, `active session live banner`, `home quick actions shortcuts`.

## 4. 수집한 레퍼런스

| 앱 | 화면 | 가져올 패턴 | 원본 |
|---|---|---|---|
| **GrowPal** (건강 대시보드) | Today | 큰 `Today` 타이틀 → **상태 카드**(아이콘 + 상태명 + 진행바 + `Next: …`) → 2열 지표 타일 → `Recent Activities · See all ›` 섹션 헤더 | `141/mobile/d3413ba7-2991-40a6-beaf-4c5ce1a42368`, `141/mobile/0fc7cf73-…` |
| GrowPal | Today(다크) | 다크 배경에서 상태 카드 + 컬러 타일 2열 | `141/mobile/1d4453a9-3524-40cc-b7ee-a08038eb12ad` |
| **The Outsiders** | Today | `Today` + **날짜 부제**를 한 줄로, 그 아래 "오늘의 한 마디" 조언 블록 | `259/mobile/860dc793-5c19-4d14-840c-cec56c6b2964` |
| **Notion** | Home | **`Jump back in`** 가로 카드 레일(아이콘 상단 + 제목 2줄), 실행 취소 토스트 | `64/mobile/f782c628-f95d-4702-8cfd-7438a5e1e2b6` |
| **TIDE** | Today/All | 카테고리 카드 안에 3분할 숫자 스탯, 카드 우측 `›` | `206/mobile/2a67c074-4ab1-41c3-9e12-2f9dcb8e7b72` |
| **Chance AI** | Explore | 아이콘 + 제목 + 설명 2줄의 도구 리스트 카드 | `215/mobile/6476480e-68dc-4fe9-b6e4-a2d93449c980` |
| **GO Club** | Trend | 큰 숫자 + 라벨 + 우측 `Average` 보조값 | `202/mobile/36399466-8dd0-45ec-8e1d-d2c6e50c1362` |

## 5. 공통 구조

1. **"Today" 헤더 + 날짜** — 홈이 "오늘 무엇을 할지"의 출발점임을 명확히.
2. **상태 카드 1개가 최상단** — 진행 중인 것(활동·세션)을 진행 표시와 함께 한 줄 카드로.
3. **섹션 헤더 통일** — `제목 ··· 모두 보기 ›` 형식으로 레일/목록마다 동일.
4. **보조 진입점은 낮은 위계** — 배너 대신 리스트형 행 카드, 레일은 작은 정사각 카드.

## 6. 우리 앱 적용 — 홈 재구성 (명세서 §3.1 "CTA 5종 경쟁 → 시각 위계 정리가 핵심")

우선순위(명세서 권장): 계산기 그리드 ≥ 세션 CTA > 오늘 블록 > 퀴즈 배너 > 레일

| 순서 | 블록 | 레퍼런스 | 기존 대비 |
|---|---|---|---|
| ① | 헤더: 앱 타이틀 + 오늘 날짜 부제(로케일) | The Outsiders, GrowPal | 서브 카피 → 날짜 |
| ② | **세션 상태 카드**: 비활성 = 외곽선 카드(🍻 + "지금 마시는 중" + 설명 + ›). 활성 = 초록 카드 + **펄스 점 + "진행 중" 라벨 + 경과 시간(`1시간 12분`) · `n잔`** | GrowPal 상태 카드 | 명세서 "세션 진행 중 즉시 인지(펄스·타이머) 제안 환영" 반영. BAC 수치·운전 관련 표현은 넣지 않음 |
| ③ | 계산기 3열 그리드(9종, 순서 고정) — 공통 `SectionHeader` | — | 위계 1순위 유지, 타일 높이·간격 정리 |
| ④ | **오늘** 섹션: 팁 + 추천을 **카드 1장**으로 통합(상단 팁, 구분선, 하단 추천 행 `뱃지 · 제목 · 보기 ›`) + **이번 주 요약 2열 타일**(이번 주 잔 수 `n / 한도` 또는 `n잔`, 절주 `D+n` 또는 "챌린지 시작") → 탭 시 트래커 | GrowPal 지표 타일, TIDE | 카드 2장 → 1장 + 트래커 연결 타일 |
| ⑤ | 퀴즈: 강조 배너 → **리스트형 행 카드**(🧠 + 제목 + 설명 1줄 + ›) | Chance AI | 위계 하향(명세서 우선순위 반영) |
| ⑥ | **이어 보기** 레일: `SectionHeader` + 작은 카드(이모지 상단, 뱃지, 제목 2줄). 콘텐츠 없으면 섹션 숨김 | Notion `Jump back in` | 카드 폭 축소, 설명 제거 |

### 제약
- 세션 카드에 BAC/운전 가능 뉘앙스 금지(§2.4). 경과 시간·잔 수만.
- 이번 주 요약 초과 상태는 색 + 문구 병행. 음주 조장 카피 금지.
- 기존 analytics(`logHomeCtaClick`, `logHomeContentClick` 등)·계산기 바텀시트 동작 유지.
