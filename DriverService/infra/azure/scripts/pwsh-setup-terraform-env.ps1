$ErrorActionPreference = "Stop"

az login
if ($LASTEXITCODE -ne 0) {
    Write-Error "Azure login failed"
    exit 1
}
Write-Host "Login successfully"

Write-Host "Available subscriptions:"
az account list --query "[].{Name:name, Id:id, IsDefault:isDefault}" -o table

$SUBSCRIPTION_ID = Read-Host "Enter the Subscription ID you want to use: "
if ([string]::IsNullOrWhiteSpace($SUBSCRIPTION_ID)) {
    Write-Error "Subscription ID cannot be empty"
    exit 1
}

az account set --subscription $SUBSCRIPTION_ID
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to set subscription"
    exit 1
}

$account = az account show --output json | ConvertFrom-Json
Write-Host "Active subscription set:"
Write-Host "Name : $($account.name)"
Write-Host "ID   : $($account.id)"
Write-Host "User : $($account.user.name)"

$env:ARM_SUBSCRIPTION_ID = $account.id
$env:ARM_TENANT_ID       = $account.tenantId
$env:TF_VAR_ssh_public_key_path="$env:USERPROFILE\.ssh\id_ed25519.pub"
Write-Host "Summary:"
Write-Host "ARM_SUBSCRIPTION_ID = $env:ARM_SUBSCRIPTION_ID"
Write-Host "ARM_TENANT_ID       = $env:ARM_TENANT_ID"
Write-Host "SSH_PUBLIC_KEY_PATH = $env:TF_VAR_ssh_public_key_path"