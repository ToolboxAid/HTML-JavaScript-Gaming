Got it — here’s your **combined, clean version**:
👉 includes the **short daily starter** + **full field options + explanations**

---

# ✅ SHORT VERSION (daily use)

```text
COMMAND: START_SESSION
REPO: ToolboxAid/HTML-JavaScript-Gaming
SCOPE: full
FOCUS: architecture
OUTPUT: review_state, plan, tasks
```

---

# 🧠 WHAT EACH FIELD DOES (quick reference)

* **COMMAND** → what to do (action)
* **REPO** → where (target repo)
* **SCOPE** → how much (area of code)
* **FOCUS** → why (type of analysis)
* **OUTPUT** → what you want back

---

# 🔧 FIELD DEFINITIONS + OPTIONS

## **COMMAND** → what action to perform

### Core commands

* `START_SESSION` → initialize workflow
* `REVIEW_PASS` → analyze a scope
* `FIND_RISK` → identify high-risk areas
* `LIST_API` → list public/internal APIs
* `TRACE_FLOW` → follow execution paths
* `BUILD_PR` → generate PR (diff + title + description)
* `PLAN_PR` → design PR without code
* `SUMMARIZE` → condensed explanation
* `COMPARE` → compare files/approaches
* `REFACTOR` → propose improvements

### Advanced commands

* `ENFORCE_RULES` → apply architecture standards
* `CHECK_CONSISTENCY` → naming/API alignment
* `MAP_DEPENDENCIES` → dependency graph (logical)
* `VALIDATE_BOUNDARIES` → public/internal/private audit

---

## **REPO** → target repository

### Format

* `owner/repo`

### Examples

* `ToolboxAid/HTML-JavaScript-Gaming`
* `myorg/my-engine`
* `local-upload` (if files uploaded)

---

## **SCOPE** → what part of the repo

### Broad scopes

* `full`
* `engine`
* `games`
* `samples`
* `tests`
* `docs`
* `tools`

### Folder-level

* `engine/core`
* `engine/render`
* `engine/physics`
* `engine/lifecycle`

### File-level

* `engine/core/gameBase.js`
* `engine/game/objectRegistry.js`

### Logical scopes (very powerful)

* `runtime`
* `collision`
* `render_loop`
* `object_lifecycle`
* `input_pipeline`

---

## **FOCUS** → what type of review

### Architecture

* `architecture`
* `design`
* `coupling`

### Code quality

* `bugs`
* `edge_cases`
* `consistency`
* `cleanup`

### Performance

* `performance`
* `memory`
* `rendering`
* `physics`

### Behavior

* `lifecycle`
* `collision`
* `input`
* `timing`

### Refactor

* `refactor`
* `modernize`
* `simplify`

---

## **OUTPUT** → what you want back

### Review outputs

* `review_state`
* `findings`
* `risks`
* `summary`

### Planning outputs

* `plan`
* `tasks`
* `roadmap`
* `pr_candidates`

### PR outputs

* `pr_plan`
* `diff`
* `description`
* `title`
* `tests`

### Deep analysis

* `dependency_map`
* `call_flow`
* `api_surface`
* `boundary_map`

---

# 🔄 HOW TO USE (real workflow)

## 1. Start session

```text
COMMAND: START_SESSION
REPO: ToolboxAid/HTML-JavaScript-Gaming
SCOPE: full
FOCUS: architecture
OUTPUT: review_state, plan, tasks
```

## 2. Immediately run work commands

```text
COMMAND: REVIEW_PASS
SCOPE: engine/core
FOCUS: architecture
OUTPUT: findings, risks, pr_candidates
```

```text
COMMAND: REVIEW_PASS
SCOPE: engine/render
```

```text
COMMAND: BUILD_PR
SCOPE: engine/lifecycle
FOCUS: refactor
OUTPUT: title, description, diff
```

---

# 🔥 EXAMPLE COMMAND COMBINATIONS

## Full architecture start

```text
COMMAND: START_SESSION
REPO: ToolboxAid/HTML-JavaScript-Gaming
SCOPE: full
FOCUS: architecture
OUTPUT: review_state, plan, tasks
```

## Deep core review

```text
COMMAND: REVIEW_PASS
SCOPE: engine/core
FOCUS: architecture
OUTPUT: findings, risks, pr_candidates
```

## Find risky areas

```text
COMMAND: FIND_RISK
SCOPE: engine
FOCUS: architecture
OUTPUT: risks, summary
```

## API audit

```text
COMMAND: LIST_API
SCOPE: engine/game
FOCUS: consistency
OUTPUT: api_surface
```

## Build PR

```text
COMMAND: BUILD_PR
SCOPE: engine/lifecycle
FOCUS: refactor
OUTPUT: title, description, diff
```

---

# 💡 PRO TIPS

### 1. Chain outputs for smarter responses

```text
OUTPUT: findings, risks, pr_candidates
```

### 2. Use logical scopes for deeper insights

Instead of:

```text
SCOPE: engine/core
```

Try:

```text
SCOPE: runtime
```

### 3. Keep sessions lightweight

* Use **short version daily**
* Use full protocol only when changing rules

---

# 🧠 FINAL MENTAL MODEL

* **COMMAND** = what to do
* **REPO** = where
* **SCOPE** = how much
* **FOCUS** = why
* **OUTPUT** = what you get
