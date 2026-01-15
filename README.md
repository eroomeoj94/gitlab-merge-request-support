# GitLab MR Size Scoring

A Next.js application that analyzes merge request sizes and generates reports for specific authors within GitLab projects or groups.

## Features

- **Secure Token Storage**: GitLab Personal Access Tokens are stored server-side in an encrypted in-memory cache, never exposed to the client
- **Author-Filtered Reports**: Generate reports scoped to specific author usernames
- **Project & Group Support**: Analyze MRs across entire groups (including subgroups) or individual projects
- **Size Scoring**: Computes a score based on lines changed, files changed, and directories touched
- **Size Bands**: Categorizes MRs as S, M, L, or XL based on score
- **Noise Reduction**: Automatically excludes lockfiles, build outputs, and generated files

## Setup

### Prerequisites

- Node.js 18+ and npm
- A GitLab Personal Access Token with the following scopes:
  - `read_api` - Required to read merge requests and project data
  - `read_user` - Required to validate token and fetch user info

#### Creating a GitLab Personal Access Token

1. **For GitLab.com:**
   - Go to [https://gitlab.com/-/user_settings/personal_access_tokens](https://gitlab.com/-/user_settings/personal_access_tokens)
   - Or navigate: Profile → Preferences → Access Tokens

2. **For Self-Hosted GitLab:**
   - Go to your GitLab instance → User Settings → Access Tokens
   - Or navigate: Profile → Preferences → Access Tokens

3. **Create a new token:**
   - Enter a descriptive **Token name** (e.g., "MR Size Scoring Tool")
   - Set an **Expiration date** (optional, recommended for security)
   - Select the following **scopes**:
     - ✅ `read_api` - Read merge requests and project data
     - ✅ `read_user` - Read user information
   - Click **Create personal access token**

4. **Copy the token immediately** - it will only be shown once! If you lose it, you'll need to create a new one.

5. The token will look like: `glpat-xxxxxxxxxxxxxxxxxxxx` (for GitLab.com) or similar format for self-hosted instances.

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

3. Generate an encryption key for token storage:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Update `.env.local` with your values:

```env
TOKEN_ENC_KEY_BASE64=<paste the generated key here>
GITLAB_BASE_URL=https://gitlab.com/api/v4
TOKEN_TTL_DAYS=7
REPORT_MAX_MRS=500
```

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Save Your GitLab Token

1. Navigate to `/token` in the application
2. Enter your GitLab Personal Access Token (the one you created above)
3. Click "Save Token"

Your token is validated against GitLab's API and stored securely server-side. It will expire after the configured TTL (default: 7 days).

**Note:** If you're using a self-hosted GitLab instance, make sure to set the `GITLAB_BASE_URL` environment variable to your instance's API endpoint (e.g., `https://gitlab.yourcompany.com/api/v4`).

### 2. Generate a Report

1. Navigate to `/report`
2. Fill in the form:
   - **Scope Type**: Choose "Project" or "Group"
   - **Scope ID**: Enter the numeric project or group ID
   - **Date Range**: Select the from/to dates for merged MRs
   - **Author Usernames**: Enter comma or newline-separated usernames (required)
   - **Exclude Drafts**: Check to exclude MRs with titles starting with "Draft:" or "WIP:"
3. Click "Generate Report"

### Report Output

The report includes:

- **Summary**: Total MRs, lines changed, average and median scores
- **By Author**: Aggregated metrics per author, including largest MR
- **Merge Requests Table**: Detailed list of all MRs with:
  - Score and size band (S/M/L/XL)
  - Lines, files, and directories changed
  - Merge date
  - Direct links to GitLab

## Scoring Formula

The MR score is calculated as:

```
score = round(10 * (sqrt(linesChanged) + 2*log1p(filesChanged) + 3*log1p(dirsTouched)))
```

Size bands:
- **S**: score < 80
- **M**: 80-140
- **L**: 141-220
- **XL**: > 220

## Excluded Files

The following patterns are automatically excluded from metrics:
- Lockfiles: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- Snapshots: `**/*.snap`
- Build outputs: `dist/**`, `build/**`, `.next/**`
- Vendor: `vendor/**`
- Minified files: `**/*.min.*`
- Generated files: `**/*generated*`, `**/*.gen.*`

## Security

- Tokens are encrypted at rest using AES-256-GCM
- Tokens are stored in server-side memory only, never sent to the client after save
- Session IDs are stored in HttpOnly cookies
- All GitLab API calls are made server-side

## Limitations

- Maximum 500 MRs per report (configurable via `REPORT_MAX_MRS`)
- Token cache is in-memory (lost on server restart)
- Designed for GitLab.com; self-hosted instances may require URL configuration

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
