# Playwright E2E Test Framework

End-to-end test automation framework for [SauceDemo](https://www.saucedemo.com) built with **Playwright + TypeScript**. Fully integrated with **Jenkins CI/CD** and **Allure reporting**.

---

## Table of Contents

1. [Framework Architecture](#1-framework-architecture)
2. [Project Structure](#2-project-structure)
3. [Layer Details](#3-layer-details)
4. [Prerequisites](#4-prerequisites)
5. [Step-by-Step Installation](#5-step-by-step-installation)
6. [Environment Configuration](#6-environment-configuration)
7. [Test Credentials](#7-test-credentials)
8. [Running Tests Locally](#8-running-tests-locally)
9. [Allure Report — Local](#9-allure-report--local)
10. [Jenkins Installation — Step by Step](#10-jenkins-installation--step-by-step)
11. [Jenkins Plugin Configuration — Step by Step](#11-jenkins-plugin-configuration--step-by-step)
12. [Jenkins Pipeline — Step by Step](#12-jenkins-pipeline--step-by-step)
13. [Run Tests in Jenkins — Step by Step](#13-run-tests-in-jenkins--step-by-step)
14. [Allure Report in Jenkins](#14-allure-report-in-jenkins)
15. [Jenkins Troubleshooting](#15-jenkins-troubleshooting)
16. [Adding New Tests](#16-adding-new-tests)

---

## 1. Framework Architecture

The framework uses an **8-layer architecture** that separates concerns cleanly across Config, Env, Data, API, Component, Page, Fixture, and Spec layers.

```
┌──────────────────────────────────────────────────────────────────────┐
│                         LAYER 8 — SPEC                               │
│                    tests/e2e/**/*.spec.ts                             │
│           Pure test logic. Imports fixtures. No Playwright API.      │
├──────────────────────────────────────────────────────────────────────┤
│                        LAYER 7 — FIXTURE                             │
│              tests/fixtures/base.fixture.ts                          │
│              tests/fixtures/auth.fixture.ts                          │
│              tests/fixtures/db.fixture.ts                            │
│    Dependency injection — wires page objects + auth state to tests   │
├─────────────────────────────┬────────────────────────────────────────┤
│      LAYER 6 — PAGE         │       LAYER 5 — COMPONENT              │
│     tests/pages/*.ts        │      tests/components/*.ts             │
│  High-level user actions    │   Reusable UI blocks (nav/modal/form)  │
│  per page. No raw locators  │   Scoped to a root Locator             │
│  in specs.                  │                                        │
├─────────────────────────────┴────────────────────────────────────────┤
│                         LAYER 4 — API                                │
│                      tests/api/*.ts                                  │
│       Wraps Playwright APIRequestContext for HTTP calls              │
├──────────────────────────────────────────────────────────────────────┤
│                         LAYER 3 — DATA                               │
│       tests/data/factories/    tests/data/builders/                  │
│       tests/data/seed/                                               │
│   Factories generate random data. Builders compose complex objects.  │
├──────────────────────────────────────────────────────────────────────┤
│                     LAYER 2 — SETUP / ENV                            │
│              tests/setup/auth.setup.ts                               │
│              tests/setup/db.setup.ts                                 │
│       Runs once before all tests. Saves auth session to disk.        │
├──────────────────────────────────────────────────────────────────────┤
│                      LAYER 1 — CONFIG                                │
│        playwright.config.ts          .env.test                       │
│     Global settings: baseURL, reporters, timeouts, projects          │
└──────────────────────────────────────────────────────────────────────┘
```

### Request / Data Flow

```
Spec (test)
  │
  ├─► Fixture  ──────────────────► Page Object  ──► BasePage
  │     │                               │               └─► page.goto / locators
  │     └─► auth.fixture               └─► Components
  │           └─► storageState               └─► BaseComponent
  │
  ├─► Data Layer
  │     ├─► Factory  (random test data)
  │     └─► Builder  (complex object composition)
  │
  └─► API Layer  ──► BaseAPI  ──► Playwright APIRequestContext
```

### Test Execution Flow

```
npm test / Jenkins
    │
    ├─► [setup project] auth.setup.ts  →  saves playwright/.auth/user.json
    ├─► [setup project] db.setup.ts    →  seeds data (no-op if no API)
    │
    └─► [chromium project] all *.spec.ts run in parallel
              │
              ├─► login.spec.ts      (4 tests — no pre-auth)
              ├─► inventory.spec.ts  (6 tests — uses saved session)
              └─► payment.spec.ts    (3 tests — uses saved session)
```

---

## 2. Project Structure

```
PlaywrightE2E/
│
├── playwright.config.ts              # Global config — baseURL, reporters, projects
├── Jenkinsfile                       # Jenkins declarative pipeline
├── package.json                      # npm scripts + devDependencies
├── tsconfig.json                     # TypeScript compiler config
├── .env.test                         # Environment variables (BASE_URL, credentials)
│
├── tests/
│   │
│   ├── e2e/                          # SPEC LAYER — test files only
│   │   ├── auth/
│   │   │   └── login.spec.ts         # 4 login tests
│   │   ├── checkout/
│   │   │   └── payment.spec.ts       # 3 checkout tests
│   │   ├── inventory/
│   │   │   └── inventory.spec.ts     # 6 inventory tests
│   │   └── dashboard/                # placeholder
│   │
│   ├── fixtures/                     # FIXTURE LAYER — dependency injection
│   │   ├── base.fixture.ts           # loginPage, inventoryPage, checkoutPage
│   │   ├── auth.fixture.ts           # authenticatedInventory (pre-logged-in)
│   │   └── db.fixture.ts             # seededUser, seededProduct
│   │
│   ├── pages/                        # PAGE LAYER — per-page action methods
│   │   ├── base.page.ts              # navigate(), waitForLoad(), screenshot()
│   │   ├── login.page.ts             # login(), expectError(), expectLoginPage()
│   │   ├── inventory.page.ts         # addToCartByName(), sortBy(), logout()
│   │   ├── checkout.page.ts          # checkout flow methods
│   │   └── dashboard.page.ts         # dashboard methods
│   │
│   ├── components/                   # COMPONENT LAYER — reusable UI fragments
│   │   ├── base.component.ts         # isVisible(), waitForVisible(), waitForHidden()
│   │   ├── nav.component.ts          # navigation bar
│   │   ├── form.component.ts         # form fill / submit helpers
│   │   ├── modal.component.ts        # modal open / close / assert
│   │   └── data-table.component.ts   # table row interactions
│   │
│   ├── api/                          # API LAYER — HTTP request wrappers
│   │   ├── base.api.ts               # get(), post(), put(), delete()
│   │   ├── auth.api.ts               # login / token endpoints
│   │   ├── product.api.ts            # product CRUD endpoints
│   │   └── user.api.ts               # user CRUD + token endpoints
│   │
│   ├── data/                         # DATA LAYER
│   │   ├── factories/
│   │   │   ├── user.factory.ts       # createUser(), createAdminUser(), createViewerUser()
│   │   │   └── product.factory.ts    # createProduct()
│   │   ├── builders/
│   │   │   └── checkout.builder.ts   # CheckoutBuilder (fluent builder pattern)
│   │   └── seed/
│   │       └── test-db.seed.ts       # seedUsers and seedProducts constants
│   │
│   ├── setup/                        # SETUP LAYER — pre-test global setup
│   │   ├── auth.setup.ts             # login + save session to user.json
│   │   └── db.setup.ts               # seed data via API (no-op if unavailable)
│   │
│   └── utils/                        # UTILITIES
│       ├── random.ts                 # randomEmail(), randomName(), randomPassword()
│       ├── date.ts                   # date formatting helpers
│       └── helpers.ts                # general test helpers
│
└── playwright/
    └── .auth/
        └── user.json                 # saved browser auth state (auto-generated)
```

---

## 3. Layer Details

### Layer 1 — Config (`playwright.config.ts`)

```typescript
// Key settings
{
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
  reporter: [
    ['html',             { open: 'never' }],
    ['json',             { outputFile: 'test-results/results.json' }],
    ['junit',            { outputFile: 'test-results/results.xml'  }],
    ['allure-playwright',{ resultsDir: 'allure-results' }],
    ['list']
  ]
}
```

| Setting | Local | CI (Jenkins) |
|---|---|---|
| Workers | Auto (CPU cores) | 1 |
| Retries | 0 | 2 |
| Reporter | list | github |
| Trace | on first retry | on first retry |
| Screenshot | on failure | on failure |
| Video | retained on failure | retained on failure |

Two Playwright projects:

| Project | Matches | Depends On |
|---|---|---|
| `setup` | `tests/setup/*.setup.ts` | — |
| `chromium` | `tests/e2e/**/*.spec.ts` | `setup` |

### Layer 2 — Setup (`tests/setup/`)

**`auth.setup.ts`** — Runs once. Logs in as `standard_user`, saves full browser storage state (cookies + localStorage) to `playwright/.auth/user.json`. All tests using `auth.fixture` load this saved state — zero login overhead per test.

**`db.setup.ts`** — Attempts to POST seed data to API. Wrapped in try/catch — silently passes if endpoint unavailable (e.g. SauceDemo has no seed API).

### Layer 3 — Data (`tests/data/`)

**Factories** generate random valid objects:
```typescript
createUser()        // → { email, password, firstName, lastName, role: 'user' }
createAdminUser()   // → same + role: 'admin'
createProduct()     // → { id, name, price, ... }
```

**Builder** composes checkout data fluently:
```typescript
new CheckoutBuilder()
  .withUser({ firstName: 'Jane' })
  .withItem('sauce-labs-backpack', 2)
  .withAddress({ zip: '90210' })
  .build()
```

### Layer 4 — API (`tests/api/`)

`BaseAPI` wraps `APIRequestContext`. All methods throw on non-2xx:
```typescript
class BaseAPI {
  get<T>(path, params?)   // GET with optional query params
  post<T>(path, body)     // POST JSON body
  put<T>(path, body)      // PUT JSON body
  delete(path)            // DELETE
}
```

### Layer 5 — Component (`tests/components/`)

Scoped to a root `Locator`. Reused across pages:
```typescript
class BaseComponent {
  isVisible()       // → boolean
  waitForVisible()  // waits for state: 'visible'
  waitForHidden()   // waits for state: 'hidden'
}
```

### Layer 6 — Page (`tests/pages/`)

Each page extends `BasePage`. Locators use `data-test` attributes — resilient to CSS/layout changes:

```typescript
class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput = this.page.getByTestId('username');
  private readonly passwordInput = this.page.getByTestId('password');
  private readonly submitBtn     = this.page.getByTestId('login-button');

  // Actions
  async login(username: string, password: string)
  async expectError(message: string)
}
```

### Layer 7 — Fixture (`tests/fixtures/`)

Fixtures inject page objects into tests using Playwright's `test.extend`:

| Fixture | Provided By | Description |
|---|---|---|
| `loginPage` | `base.fixture` | Navigates to `/`, returns `LoginPage` |
| `inventoryPage` | `base.fixture` | Returns `InventoryPage` |
| `checkoutPage` | `base.fixture` | Returns `CheckoutPage` |
| `authenticatedInventory` | `auth.fixture` | Loads saved session, navigates to `/inventory.html` |
| `seededUser` | `db.fixture` | Creates user via API, deletes after test |
| `seededProduct` | `db.fixture` | Creates product via API, deletes after test |

### Layer 8 — Spec (`tests/e2e/`)

Pure test logic. No Playwright API called directly — only fixture methods:

```typescript
test('complete checkout flow', async ({ authenticatedInventory }) => {
  const page = authenticatedInventory.page;
  await page.getByTestId('checkout').click();
  // ...
});
```

| Spec File | Tests | Fixture Used |
|---|---|---|
| `auth/login.spec.ts` | 4 | `base.fixture` (no auth) |
| `inventory/inventory.spec.ts` | 6 | `auth.fixture` (pre-authed) |
| `checkout/payment.spec.ts` | 3 | `auth.fixture` (pre-authed) |
| **Total** | **15** | |

---

## 4. Prerequisites

| Tool | Version Required | Install Command |
|---|---|---|
| Node.js | 18 or higher | Download from https://nodejs.org |
| npm | 9 or higher | Bundled with Node.js |
| Allure CLI | Any | `scoop install allure` |
| Java JDK | 21 or higher | Required for Jenkins only |
| Jenkins | 2.555.3+ | Via Chocolatey (see Section 10) |

---

## 5. Step-by-Step Installation

### Step 1 — Navigate to project folder

```bash
cd C:\Users\Sanjay-PC\MasterClass\ClaudeCodeForQA\PlaywrightE2E
```

### Step 2 — Install npm dependencies

```bash
npm ci
```

Expected output:
```
added 10 packages, and audited 11 packages in 4s
found 0 vulnerabilities
```

### Step 3 — Install Playwright browsers

```bash
npx playwright install chromium
```

This downloads the Chromium browser binary to:
`C:\Users\<your-user>\AppData\Local\ms-playwright\`

### Step 4 — Verify installation

```bash
npx playwright --version
```

Expected output: `Version 1.44.x`

---

## 6. Environment Configuration

File: `.env.test` — loaded automatically by `playwright.config.ts`

```env
BASE_URL=https://www.saucedemo.com
API_URL=https://www.saucedemo.com
TEST_USER_EMAIL=standard_user
TEST_USER_PASSWORD=secret_sauce
```

| Variable | Purpose | Default |
|---|---|---|
| `BASE_URL` | Application URL used by all tests | `https://www.saucedemo.com` |
| `API_URL` | Base URL for API layer calls | `https://www.saucedemo.com` |
| `TEST_USER_EMAIL` | Username for auth setup | `standard_user` |
| `TEST_USER_PASSWORD` | Password for auth setup | `secret_sauce` |

To override for a single run (Windows PowerShell):
```powershell
$env:BASE_URL="https://staging.example.com"; npx playwright test
```

---

## 7. Test Credentials

### SauceDemo Application (`https://www.saucedemo.com`)

All users share the same password: `secret_sauce`

| Username | Password | Used In Tests | Notes |
|---|---|---|---|
| `standard_user` | `secret_sauce` | Auth setup + login tests | Primary test user |
| `locked_out_user` | `secret_sauce` | `login.spec.ts` | Tests locked account error message |
| `problem_user` | `secret_sauce` | Manual testing | Intentional UI bugs |
| `performance_glitch_user` | `secret_sauce` | Manual testing | Artificially slow |
| `error_user` | `secret_sauce` | Manual testing | Random errors on actions |
| `visual_user` | `secret_sauce` | Manual testing | Visual layout defects |

### Jenkins

| Field | Value |
|---|---|
| URL | `http://localhost:8080` |
| Username | `admin` |
| Password | `f571a6ce9c31458e99f9da833587350d` |
| Job Name | `PlaywrightE2E` |
| Jenkins Home | `C:\ProgramData\Jenkins\.jenkins` |
| Workspace | `C:\ProgramData\Jenkins\.jenkins\workspace\PlaywrightE2E` |

> To change the Jenkins password: Login → top-right user icon → **Configure** → change password → **Save**

---

## 8. Running Tests Locally

### Run all tests (headless — default)

```bash
npx playwright test
# or
npm test
```

### Run all tests (headed — browser visible)

```bash
npx playwright test --headed
# or
npm run test:headed
```

### Run single spec file

```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### Run single test by name

```bash
npx playwright test --grep "valid credentials"
```

### Run specific project only

```bash
npx playwright test --project=chromium
```

### Debug mode (step through each action)

```bash
npx playwright test --debug
# or
npm run test:debug
```

### Interactive UI mode

```bash
npx playwright test --ui
# or
npm run test:ui
```

### Expected results

```
Running 15 tests using 4 workers
  15 passed (18s)
```

---

## 9. Allure Report — Local

### Step 1 — Run tests (generates allure-results/)

```bash
npx playwright test
```

### Step 2 — Generate HTML report

```bash
allure generate allure-results --clean -o allure-report
```

### Step 3 — Open in browser

```bash
allure open allure-report
```

Browser opens automatically at `http://localhost:port/index.html`

### What you see in Allure

| Section | Shows |
|---|---|
| Overview | Total pass/fail/skip counts, duration |
| Suites | Tests grouped by spec file |
| Graphs | Status breakdown pie chart, duration chart |
| Timeline | Parallel execution view |
| Behaviors | Tests grouped by feature/story |

### Fix port conflict (if allure port already in use)

```powershell
# Find and kill the conflicting process
Stop-Process -Id (Get-NetTCPConnection -LocalPort 9323).OwningProcess -Force
# Then re-run
allure open allure-report
```

---

## 10. Jenkins Installation — Step by Step

### Step 1 — Install Java 21 (required — Jenkins 2.555+ needs Java 21+)

Open PowerShell **as Administrator** and run:

```powershell
choco install temurin21 -y
```

Java installs to: `C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\`

Verify:
```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe" -version
```

### Step 2 — Install Jenkins via Chocolatey

Open PowerShell **as Administrator**:

```powershell
choco install jenkins -y
```

Jenkins installs to: `C:\Program Files\Jenkins\`

### Step 3 — Point Jenkins to Java 21

Jenkins defaults to the system Java (may be older). Fix by editing `jenkins.xml`:

```powershell
# Open file as Administrator and change the executable line:
# FROM: <executable>C:\Program Files\Java\jdk-17\bin\java.exe</executable>
# TO:   <executable>C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe</executable>
```

Also add these JVM flags to the `<arguments>` line in `jenkins.xml`:

```
-Djenkins.install.runSetupWizard=false
-Dhudson.model.DirectoryBrowserSupport.CSP="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;"
```

> The CSP flag is critical — without it, Allure and HTML reports render blank in Jenkins (JavaScript blocked).

### Step 4 — Configure Jenkins URL

Create file: `C:\ProgramData\Jenkins\.jenkins\jenkins.model.JenkinsLocationConfiguration.xml`

```xml
<?xml version='1.1' encoding='UTF-8'?>
<jenkins.model.JenkinsLocationConfiguration>
  <adminAddress>address not configured yet &lt;nobody@nowhere&gt;</adminAddress>
  <jenkinsUrl>http://localhost:8080/</jenkinsUrl>
</jenkins.model.JenkinsLocationConfiguration>
```

> Without this, Jenkins CLI handshake fails with "Jenkins URL is not configured".

### Step 5 — Start Jenkins service

Open PowerShell **as Administrator**:

```powershell
Start-Service jenkins
```

### Step 6 — Verify Jenkins is running

```powershell
Get-Service jenkins
```

Expected output:
```
Status   Name     DisplayName
------   ----     -----------
Running  jenkins  jenkins
```

### Step 7 — Open Jenkins in browser

Navigate to: `http://localhost:8080`

### Step 8 — Get initial admin password

```powershell
Get-Content "C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword"
```

**Initial Admin Password: `f571a6ce9c31458e99f9da833587350d`**

### Step 9 — Log in

| Field | Value |
|---|---|
| URL | `http://localhost:8080` |
| Username | `admin` |
| Password | `f571a6ce9c31458e99f9da833587350d` |

### Jenkins Service Management

```powershell
# Start Jenkins (as Administrator)
Start-Service jenkins

# Stop Jenkins (as Administrator)
Stop-Service jenkins

# Restart Jenkins (as Administrator)
Restart-Service jenkins

# Check status
Get-Service jenkins
```

---

## 11. Jenkins Plugin Configuration — Step by Step

### Installed Plugins

| Plugin | Purpose |
|---|---|
| `workflow-aggregator` | Pipeline (Jenkinsfile) support |
| `nodejs` | NodeJS tool configuration |
| `htmlpublisher` | Publish Allure HTML report inside Jenkins build |
| `git` | Git SCM integration |
| `allure-jenkins-plugin` | Native Allure integration (optional) |

### Step 1 — Install plugins via Jenkins CLI

Download CLI jar first (one-time):

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:8080/jnlpJars/jenkins-cli.jar" `
  -OutFile "C:\Temp\jenkins-cli.jar" `
  -Headers @{ Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:f571a6ce9c31458e99f9da833587350d")) }
```

Install plugins:

```powershell
$java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe"
& $java -jar "C:\Temp\jenkins-cli.jar" `
  -s http://localhost:8080 `
  -auth "admin:f571a6ce9c31458e99f9da833587350d" `
  install-plugin htmlpublisher nodejs workflow-aggregator git allure-jenkins-plugin -restart
```

### Step 2 — Install plugins via UI (alternative)

1. Go to `http://localhost:8080/manage/pluginManager/`
2. Click **Available plugins** tab
3. Search and tick each plugin
4. Click **Install** → **Restart Jenkins when installation is complete**

### Step 3 — Configure NodeJS tool

```powershell
$java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe"
$groovy = @'
import jenkins.model.*
import jenkins.plugins.nodejs.tools.*

def nodeJS = new NodeJSInstallation("NodeJS", "C:\\Program Files\\nodejs", [])
def descriptor = Jenkins.instance.getDescriptor(NodeJSInstallation.class)
descriptor.setInstallations(nodeJS)
descriptor.save()
println "NodeJS configured"
'@

$groovy | & $java -jar "C:\Temp\jenkins-cli.jar" `
  -s http://localhost:8080 `
  -auth "admin:f571a6ce9c31458e99f9da833587350d" `
  groovy "="
```

**Via UI:**
1. `http://localhost:8080/manage/configureTools/`
2. Scroll to **NodeJS** section → **Add NodeJS**
3. Name: `NodeJS`
4. Installation directory: `C:\Program Files\nodejs`
5. **Save**

---

## 12. Jenkins Pipeline — Step by Step

### The Jenkinsfile

Location: `PlaywrightE2E/Jenkinsfile`

```groovy
pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        BASE_URL = 'https://www.saucedemo.com'
        PLAYWRIGHT_BROWSERS_PATH = '0'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/qualitymastery/playwright-e2e-8layer-jenkins-allure-report.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install chromium --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npx playwright test'
            }
            post {
                always {
                    junit testResults: 'test-results/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                bat 'allure generate allure-results --clean -o allure-report'
            }
        }
    }

    post {
        always {
            allure([
                includeProperties: false,
                jdk: '',
                results: [[path: 'allure-results']],
                reportBuildPolicy: 'ALWAYS',
                report: 'allure-report'
            ])

            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }

        success {
            echo 'All tests passed!'
        }

        failure {
            echo 'Tests failed — check Allure report for details.'
        }
    }
}
```

### Key Environment Variables in Pipeline

| Variable | Value | Purpose |
|---|---|---|
| `PLAYWRIGHT_BROWSERS_PATH` | `0` | Installs browsers locally in `node_modules` to avoid Jenkins permission issues |
| `BASE_URL` | `https://www.saucedemo.com` | Application under test |

### Step 1 — Create the Jenkins job via CLI

```powershell
$java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe"
$pass = "f571a6ce9c31458e99f9da833587350d"

$jobXml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <description>Playwright E2E Tests with Allure Report</description>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps">
    <script><!-- paste Jenkinsfile content here --></script>
    <sandbox>true</sandbox>
  </definition>
</flow-definition>
"@

$jobXml | & $java -jar "C:\Temp\jenkins-cli.jar" -s http://localhost:8080 -auth "admin:$pass" create-job "PlaywrightE2E"
```

### Step 2 — Create the Jenkins job via UI (alternative)

1. Open `http://localhost:8080`
2. Click **New Item**
3. Enter name: `PlaywrightE2E`
4. Select **Pipeline** → **OK**
5. Scroll to **Pipeline** section
6. Definition: **Pipeline script**
7. Paste the full Jenkinsfile contents into the Script box
8. Click **Save**

---

## 13. Run Tests in Jenkins — Step by Step

### Via Jenkins UI

1. Open `http://localhost:8080`
2. Login: username `admin`, password `f571a6ce9c31458e99f9da833587350d`
3. Click **PlaywrightE2E** in the job list
4. Click **Build Now** in the left sidebar
5. Click the build number (e.g. `#10`) that appears under **Build History**
6. Click **Console Output** to watch live logs
7. Wait for `Finished: SUCCESS`

### Via Jenkins CLI

```powershell
$java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe"

& $java -jar "C:\Temp\jenkins-cli.jar" `
  -s http://localhost:8080 `
  -auth "admin:f571a6ce9c31458e99f9da833587350d" `
  build "PlaywrightE2E" -v -f
```

Flags:
- `-v` — verbose (stream console output)
- `-f` — wait for build to finish

### Expected Console Output

```
Started PlaywrightE2E #10
[Pipeline] stage: Install Dependencies
npm ci → added 10 packages

[Pipeline] stage: Run Playwright Tests
Running 15 tests using 1 worker
···············
  15 passed (44.7s)

[Pipeline] Generate Allure Report
Report successfully generated to allure-report

[Pipeline] publishHTML
Archiving HTML reports...

All tests passed!
Finished: SUCCESS
```

### Run headed (browser visible) vs headless

| Mode | Command in Pipeline |
|---|---|
| Headless (default) | `npx playwright test` |
| Headed (browser visible) | `npx playwright test --headed` |

The current Jenkinsfile runs in **headless** mode. To switch to headed mode, add `--headed` to the `npx playwright test` command in the pipeline script.

---

## 14. Allure Report in Jenkins

### View After Build

After any successful build, the **Allure Report** link appears in the build's left sidebar.

Direct URL pattern:
```
http://localhost:8080/job/PlaywrightE2E/<build-number>/Allure_20Report/
```

Examples:
```
http://localhost:8080/job/PlaywrightE2E/10/Allure_20Report/
http://localhost:8080/job/PlaywrightE2E/lastSuccessfulBuild/Allure_20Report/
http://localhost:8080/job/PlaywrightE2E/lastBuild/Allure_20Report/
```

### If Allure Report Shows Blank Page

This is caused by Jenkins CSP (Content Security Policy) blocking JavaScript. Fix:

**Temporary fix (applies until restart):**

```powershell
$java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe"
$groovy = @'
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP",
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;")
println "CSP relaxed"
'@
$groovy | & $java -jar "C:\Temp\jenkins-cli.jar" -s http://localhost:8080 -auth "admin:f571a6ce9c31458e99f9da833587350d" groovy "="
```

**Permanent fix** — add to `<arguments>` in `C:\Program Files\Jenkins\jenkins.xml`:

```
-Dhudson.model.DirectoryBrowserSupport.CSP="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;"
```

Then restart Jenkins:
```powershell
Restart-Service jenkins   # run as Administrator
```

After applying, hard-refresh the report page: **Ctrl + Shift + R**

---

## 15. Jenkins Troubleshooting

### Jenkins service won't start

**Check logs:**
```powershell
# Run as Administrator
Get-Content "C:\Program Files\Jenkins\jenkins.err.log" -Tail 30
```

**Common cause:** Wrong Java version.
```
Running with Java 17 which is older than minimum required version (Java 21)
```
Fix: Update `<executable>` in `C:\Program Files\Jenkins\jenkins.xml` to Java 21 path.

---

### CLI handshake fails with 403 — "Jenkins URL is not configured"

Fix: Create `jenkins.model.JenkinsLocationConfiguration.xml` in Jenkins home (see Section 10, Step 4).

---

### Playwright browsers not found in Jenkins

```
Error: browserType.launch: Executable doesn't exist at
C:\WINDOWS\system32\config\systemprofile\AppData\Local\ms-playwright\...
```

Fix: Set `PLAYWRIGHT_BROWSERS_PATH` to `0` in the pipeline environment to install browsers locally in the project:
```groovy
    environment {
        PLAYWRIGHT_BROWSERS_PATH = '0'
    }
```

---

### `allure` not recognized in Jenkins

```
'allure' is not recognized as an internal or external command
```

Fix: Ensure allure is correctly installed on the Jenkins server and added to the PATH, or use `npx allure-commandline` if installed locally via npm. If using the Jenkins Allure plugin, it handles the execution automatically.

---

### Port 9323 already in use (local Allure server)

```
Error: listen EADDRINUSE: address already in use :::1:9323
```

Fix:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 9323).OwningProcess -Force
allure open allure-report
```

---

## 16. Adding New Tests

### Step 1 — Create a page object

```typescript
// tests/pages/my-feature.page.ts
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class MyFeaturePage extends BasePage {
  private readonly heading = this.page.getByTestId('my-heading');
  private readonly submitBtn = this.page.getByTestId('submit');

  async goto(): Promise<void> {
    await this.navigate('/my-feature');
  }

  async submit(): Promise<void> {
    await this.submitBtn.click();
  }

  async expectHeading(text: string): Promise<void> {
    await expect(this.heading).toHaveText(text);
  }
}
```

### Step 2 — Register fixture

```typescript
// tests/fixtures/base.fixture.ts — add inside extend({})
myFeaturePage: async ({ page }, use) => {
  await use(new MyFeaturePage(page));
},
```

### Step 3 — Write the spec

```typescript
// tests/e2e/my-feature/my-feature.spec.ts
import { test, expect } from '../../fixtures/base.fixture';

test.describe('My Feature', () => {
  test('heading is visible', async ({ myFeaturePage }) => {
    await myFeaturePage.goto();
    await myFeaturePage.expectHeading('My Feature');
  });

  test('submit works', async ({ myFeaturePage }) => {
    await myFeaturePage.goto();
    await myFeaturePage.submit();
    await expect(myFeaturePage.page).toHaveURL(/success/);
  });
});
```

### Step 4 — Run locally to verify

```bash
npx playwright test tests/e2e/my-feature/my-feature.spec.ts --headed
```

### Step 5 — Run in Jenkins

```powershell
$java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe"
& $java -jar "C:\Temp\jenkins-cli.jar" `
  -s http://localhost:8080 `
  -auth "admin:f571a6ce9c31458e99f9da833587350d" `
  build "PlaywrightE2E" -v -f
```

---

## Quick Reference

### Local Test Commands

| Command | Action |
|---|---|
| `npx playwright test` | Run all tests headless |
| `npx playwright test --headed` | Run all tests headed |
| `npx playwright test --ui` | Open interactive UI |
| `npx playwright test --debug` | Step-through debugger |
| `npx playwright show-report` | Open HTML report |
| `allure generate allure-results --clean -o allure-report` | Generate Allure HTML |
| `allure open allure-report` | Open Allure report |

### Jenkins Quick Commands (PowerShell)

```powershell
# Start Jenkins
Start-Service jenkins

# Trigger build and wait
$java = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe"
& $java -jar C:\Temp\jenkins-cli.jar -s http://localhost:8080 -auth "admin:f571a6ce9c31458e99f9da833587350d" build PlaywrightE2E -v -f

# Open latest report
Start-Process "http://localhost:8080/job/PlaywrightE2E/lastSuccessfulBuild/Allure_20Report/"
```

### Key Paths

| Item | Path |
|---|---|
| Project root | `C:\Users\Sanjay-PC\MasterClass\ClaudeCodeForQA\PlaywrightE2E` |
| Auth state | `playwright\.auth\user.json` |
| Allure results | `allure-results\` |
| Allure report | `allure-report\index.html` |
| Playwright report | `playwright-report\index.html` |
| Jenkins home | `C:\ProgramData\Jenkins\.jenkins` |
| Jenkins config | `C:\Program Files\Jenkins\jenkins.xml` |
| Jenkins logs | `C:\Program Files\Jenkins\jenkins.err.log` |
| Jenkins CLI jar | `C:\Temp\jenkins-cli.jar` |
