<#
.SYNOPSIS
  Create the GitHub repo from this folder and push, or push changes to an existing one.

.DESCRIPTION
  Needs git and the GitHub CLI (gh), authenticated once with: gh auth login
  If you do not have git installed, the repo can be created from the GitHub web UI instead:
  create an empty repository, then use "uploading an existing file" and drag this folder in.

.EXAMPLE
  pwsh -File scripts/publish.ps1 -Repo FreeAISubscription
#>
param(
  [string]$Repo = "FreeAISubscription",
  [string]$Description = "Gemini, Claude and ChatGPT at 0 USD through the free tiers that actually exist.",
  [ValidateSet("public", "private")][string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "git is not on PATH. Install it from https://git-scm.com/downloads, reopen the terminal, then rerun."
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "gh is not on PATH. Install it from https://cli.github.com, then run: gh auth login"
}

gh auth status | Out-Null
$owner = (gh api user --jq .login)
Write-Host "publishing to $owner/$Repo"

if (-not (Test-Path ".git")) {
  git init -b main | Out-Null
  git add .
  git commit -m "Free AI Stack: free-tier guide and router" | Out-Null
}

if (-not (git remote get-url origin 2>$null)) {
  gh repo create "$owner/$Repo" "--$Visibility" --description $Description --source . --remote origin --push
} else {
  git push -u origin main
}

Write-Host "done: https://github.com/$owner/$Repo"