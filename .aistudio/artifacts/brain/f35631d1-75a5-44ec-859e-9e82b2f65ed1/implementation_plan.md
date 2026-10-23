# Luke 1 Quiz - Database Specification & React Architecture

Revised implementation plan incorporating the user's instruction: **construct the complete database itself first** (with all student usernames, passwords, IDs, question bank, and answer timing schemas) and provide an **in-app Database Viewer & Inspector** so the user can inspect every table and row before linking to external Google Sheets.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Revised Workflow Based on User Feedback**:
> 1. **Complete Database First**: The database is fully built and populated in the app first with all 25 student credentials, questions, score tables, and timing logs.
> 2. **Review Before Linking**: An interactive **Database Inspector** tab in the Servant Panel allows reviewing all 5 database sheets (`Students`, `Questions`, `Scores`, `Answer_Timings`, `Leaderboard`) directly in the UI.
> 3. **Manual / Opt-in Link**: The app will **not** automatically link to external Google Sheets until you review the database and click the explicit "Connect & Export to Google Sheet" button. You can also export the database as CSV files at any time.

- **Confirmed Decision 1 (All Student Credentials)**:
  All 25 students are pre-seeded with standardized usernames and passwords, viewable and editable by the servant.
- **Confirmed Decision 2 (Granular Answer Timings)**:
  Every question response logs exact time elapsed (e.g. `4.2` seconds), points awarded, student ID, and selected choice.
- **Confirmed Decision 3 (No Premature Linking)**:
  The database functions immediately as a fully autonomous local/cached system with full inspection before any external Google OAuth flow is initiated.

---

## 1. Complete Database Specification

The database consists of 5 dedicated tables (which map 1:1 to Google Sheets tabs when linked):

### Table 1: `Students` (Full Class Roster & Credentials)
| StudentID | Username | Password | FirstName | LastName | Class | Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `101` | `antoni.n` | `antoni101` | Antoni | Nagi | Elisha Class | Student |
| `102` | `anthony.l` | `anthony102` | Anthony | Labib | Elisha Class | Student |
| `103` | `anthony.s` | `anthony103` | Anthony | Samer | Elisha Class | Student |
| `104` | `carlos.m` | `carlos104` | Carlos | Mark | Elisha Class | Student |
| `105` | `chris.m` | `chris105` | Chris | Michael | Elisha Class | Student |
| `106` | `daniel.n` | `daniel106` | Daniel | Nabil | Elisha Class | Student |
| `107` | `daniel.y` | `daniel107` | Daniel | Youssef | Elisha Class | Student |
| `108` | `david.n` | `david108` | David | Nagi | Elisha Class | Student |
| `109` | `fredrick.a` | `fredrick109` | Fredrick | Amir | Elisha Class | Student |
| `110` | `george.j` | `george110` | George | John | Elisha Class | Student |
| `111` | `jayden.m` | `jayden111` | Jayden | Michael | Elisha Class | Student |
| `112` | `jonathan.r` | `jonathan112` | Jonathan | Ramez | Elisha Class | Student |
| `113` | `jonathan.m` | `jonathan113` | Jonathan | Michael | Elisha Class | Student |
| `114` | `kevin.m` | `kevin114` | Kevin | Michael | Elisha Class | Student |
| `115` | `michael.r` | `michael115` | Michael | Raymon | Elisha Class | Student |
| `116` | `michael.b` | `michael116` | Michael | Bahaa | Elisha Class | Student |
| `117` | `nayer.w` | `nayer117` | Nayer | Wessam | Elisha Class | Student |
| `118` | `rajan.r` | `rajan118` | Rajan | Romany | Elisha Class | Student |
| `119` | `rano.m` | `rano119` | Rano | Mark | Elisha Class | Student |
| `120` | `raphael.j` | `raphael120` | Raphael | John | Elisha Class | Student |
| `121` | `steven.t` | `steven121` | Steven | Tharwat | Elisha Class | Student |
| `122` | `samuel.m` | `samuel122` | Samuel | Michel | Elisha Class | Student |
| `123` | `kirollos.g` | `kirollos123` | Kirollos | George | Elisha Class | Student |
| `124` | `christiano.m` | `christiano124` | Christiano | Marco | Elisha Class | Student |
| `125` | `youssef.s` | `youssef125` | Youssef | Sameh | Elisha Class | Student |

*Servants (Class Administrators)*:
- `Mr Bishoy` (PIN: `1001`)
- `Mr John` (PIN: `1002`)
- `Mr Mark` (PIN: `1003`)

---

### Table 2: `Questions` (Bilingual Curriculum Bank)
| QuestionID | Language | QuestionText | OptionA | OptionB | OptionC | OptionD | CorrectIndex |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `q_ar_1` | `ar` | مريم قالت: «هوذا أنا أمة الرب، ليكن لي كقولك» ✨\nإيه اللي نتعلمه من رد مريم على كلام الملاك؟ | لازم نفهم كل حاجة الأول | الطاعة والثقة في ربنا حتى لو مش عارفين كل التفاصيل | لازم نسأل الناس الأول | نخاف من المستقبل | `1` |
| `q_ar_2` | `ar` | أليصابات قالت لمريم: «مباركة أنت في النساء ومباركة هي ثمرة بطنك» ❤️\nمين أول شخص اعترف ببركة مريم وهي حامل بيسوع؟ | زكريا | يوسف | أليصابات | يوحنا | `2` |
| `q_ar_3` | `ar` | زكريا انتظر وقتًا طويلًا قبل ما تتحقق طلبته، لكن ربنا استجاب في الوقت المناسب. إيه الرسالة اللي ناخدها من ده؟ 🙏🏻 | ربنا بينسى طلباتنا | ربنا يستجيب في توقيته حتى لو اتأخر علينا | لازم نبطل نصلي لو اتأخر الرد | الاستجابة بتحصل فورًا دائمًا | `1` |
| `q_ar_4` | `ar` | في نهاية الأصحاح، زكريا قال إن يوحنا «يُعِدُّ طرق الرب». إحنا كمان نقدر نُعِد طريق الرب في حياتنا إزاي؟ | بمحبة الناس وخدمة ربنا | بالابتعاد عن الناس | بالاعتماد على نفسنا فقط | بعدم مساعدة الآخرين | `0` |
| `q_ar_5` | `ar` | لما مريم زارت أليصابات، «ارتكض الجنين في بطنها» وفرحت أليصابات. 💕\nإيه اللي حصل بمجرد ما سمعت أليصابات سلام مريم؟ | زكريا اتكلم | امتلأت أليصابات من الروح القدس | الملاك ظهر لها | مريم رجعت للناصرة | `1` |
| `q_en_1` | `en` | Mary said: "Behold, I am the servant of the Lord; let it be to me according to your word." ✨\nWhat do we learn from Mary's response to the angel? | We must understand everything first | Obedience and trust in God even without knowing every detail | We must ask other people first | We should fear the future | `1` |
| `q_en_2` | `en` | Elizabeth said to Mary: "Blessed are you among women, and blessed is the fruit of your womb." ❤️\nWho was the first person to recognize Mary's blessing while she carried Jesus? | Zechariah | Joseph | Elizabeth | John | `2` |
| `q_en_3` | `en` | Zechariah waited a long time before his prayer was answered, but God answered at the right time. What message do we take from this? 🙏🏻 | God forgets our requests | God answers in His own timing even when it feels delayed | We should stop praying if the answer is delayed | The answer always comes immediately | `1` |
| `q_en_4` | `en` | At the end of the chapter, Zechariah said John would "prepare the ways of the Lord." How can we also prepare the way of the Lord in our own lives? | By loving people and serving God | By staying away from people | By relying only on ourselves | By not helping others | `0` |
| `q_en_5` | `en` | When Mary visited Elizabeth, "the baby leaped in her womb" and Elizabeth rejoiced. 💕\nWhat happened the moment Elizabeth heard Mary's greeting? | Zechariah spoke | Elizabeth was filled with the Holy Spirit | The angel appeared to her | Mary returned to Nazareth | `1` |

---

### Table 3: `Answer_Timings` (Granular Response Telemetry)
Records each student's speed and choice on every question:
| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `LogID` | String | Unique timing log ID | `log_101_q1` |
| `SessionID` | String | Quiz attempt ID | `sess_982a1f` |
| `StudentID` | String | Student ID | `101` |
| `StudentName` | String | Student full name | `Antoni Nagi` |
| `QuestionNumber` | Number | Question index (1–5) | `1` |
| `QuestionSnippet` | String | Short question prompt | `مريم قالت: هوذا أنا أمة الرب...` |
| `SelectedChoice` | String | Text of option selected | `الطاعة والثقة في ربنا...` |
| `CorrectChoice` | String | Correct answer text | `الطاعة والثقة في ربنا...` |
| `IsCorrect` | Boolean | Answer accuracy | `TRUE` |
| `TimeSpentSec` | Number | **Time taken in seconds** | `4.8` |
| `PointsEarned` | Number | Calculated points (speed-based) | `895` |
| `Timestamp` | ISO String | Time answered | `2026-10-23T14:31:05Z` |

---

### Table 4: `Scores` (Session Quiz Summary)
| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `SessionID` | String | Unique session ID | `sess_982a1f` |
| `StudentID` | String | Student ID | `101` |
| `StudentName` | String | Full name | `Antoni Nagi` |
| `TotalScore` | Number | Accumulated score | `4320` |
| `CorrectCount` | Number | Correct answers count | `5` |
| `TotalQuestions` | Number | Total quiz questions | `5` |
| `AvgTimePerQ` | Number | Average seconds per answer | `5.2` |
| `Language` | String | Language (`ar` or `en`) | `ar` |
| `Date` | ISO String | Completion date | `2026-10-23T14:33:00Z` |

---

### Table 5: `Leaderboard` (Class Ranking Aggregate)
| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `Rank` | Number | Leaderboard rank | `1` |
| `StudentName` | String | Full student name | `Antoni Nagi` |
| `StudentID` | String | Student ID | `101` |
| `HighScore` | Number | Peak score achieved | `4320` |
| `AttemptsCount` | Number | Times quiz was completed | `2` |
| `LastPlayed` | ISO String | Most recent quiz timestamp | `2026-10-23T14:33:00Z` |

---

## 2. In-App Database Inspector (Servant Portal)

Before linking to an external Google Sheet, servants will have an in-app **Database Inspector** with interactive tabs:
1. **Students Tab**: Filter, search, and view all 25 students, usernames, and passwords.
2. **Questions Tab**: View and edit Arabic & English questions, choices, and correct answers.
3. **Answer Timings Tab**: Live log table displaying every student response with exact time in seconds and points.
4. **Scores & Leaderboard Tab**: Live score submissions and ranking.
5. **Action Bar**:
   - **"Download Database (CSV Files)"**: Instant download of all 5 tables for offline inspection.
   - **"Link to Google Sheet"**: Initiates Google OAuth with permission to create or bind to your Google Sheet only when you are ready.

---

## 3. Technical Architecture & React Implementation Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Application (Vite)                        │
├────────────────────────────────────────────────────────────────────────┤
│ Top Bar: [Language AR/EN] [Theme Dark/Light] [Student / Servant Switch]│
├───────────────────────────────┬────────────────────────────────────────┤
│         Student Mode          │              Servant Mode              │
│  • Username & Password Login  │  • PIN Gate (Bishoy, John, Mark)       │
│  • Timed Quiz (30s countdown) │  • Database Inspector (5 Tabs):        │
│  • Speed-based Points (300-1k)│     1. [Students & Passwords]          │
│  • Per-Question Timer Logger  │     2. [Questions & Choices]           │
│  • Trophy/Medal Result Screen │     3. [Answer Timings (Seconds)]      │
│  • Leaderboard View           │     4. [Scores & Attempts]             │
│                               │     5. [Leaderboard Ranking]           │
│                               │  • Export CSVs / Reset Controls        │
│                               │  • [Connect Google Sheet Button]       │
├───────────────────────────────┴────────────────────────────────────────┤
│                    In-App Database & Storage Engine                    │
│   • Pre-seeded 25 Student Roster with Usernames & Passwords            │
│   • LocalStorage Persistence for Offline Continuity                    │
│   • Google Sheets API Client (Activated on servant request)           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Execution Steps Upon Approval

1. **Build React Application with Vite & TypeScript**:
   - Install React, TypeScript, Vite, Tailwind CSS, Lucide icons.
   - Configure dev server on `0.0.0.0:3000`.
2. **Implement In-Memory & Persistent Database Engine**:
   - `src/db/studentsData.ts`: 25 student records with usernames, passwords, and IDs.
   - `src/db/questionsData.ts`: Complete bilingual question bank.
   - `src/db/dbStore.ts`: In-app database engine managing students, questions, answer timings, scores, and leaderboard with persistent storage.
3. **Build Interactive UI & Servant Database Inspector**:
   - Student Login supporting both ID or Username + Password.
   - Timed quiz with real-time countdown and answer duration logger (`TimeSpentSec`).
   - Servant Portal with full 5-tab Database Inspector.
   - Ready-to-connect Google Sheets connector module with manual Sheet ID or 1-click Google Sign-In.
4. **Compile & Verification**:
   - Run `compile_applet` to ensure zero compilation or build errors.
   - Verify all screens, credentials, timer metrics, and database tables in the UI.
