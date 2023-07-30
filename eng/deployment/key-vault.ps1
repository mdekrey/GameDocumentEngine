

$resourceGroup='GameDocumentEngine'
$keyVaultName='game-docs-vault'

$identityName = 'GameDocs-SqlUser' # Managed Identity created and associated with AKS

$gameDocsDataProtectionKeyName = 'gd-data-protection'

az keyvault create --name $keyVaultName --resource-group $resourceGroup --location southcentralus
az keyvault key create --name $gameDocsDataProtectionKeyName --vault-name $keyVaultName

$oid = (az identity show -n $identityName -g $resourceGroup --query principalId --out tsv)
az keyvault set-policy -n $keyVaultName --object-id $oid --key-permissions get unwrapKey wrapKey
