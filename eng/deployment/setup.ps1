# This associates a Managed User for use from Kubernetes.
# Note: this is mostly a log of what I did, not an actual script

# First: Set account:
# az account set --subscription <subscription-id>


$resourceGroup='GameDocumentEngine'
$identityName = 'GameDocs-SqlUser' # TODO - See step 3

$k8sNamespace='game-docs-engine'
$k8sServiceAccountName='main-docs-user'

$k8sResourceGroup='DeKreyDotNet'
$k8sClusterName='TinyKubed'

# 1. Ensure OIDC is set up (https://azure.github.io/azure-workload-identity/docs/installation/managed-clusters.html)

$oidcUrl=(az aks show --resource-group $k8sResourceGroup --name $k8sClusterName --query "oidcIssuerProfile.issuerUrl" -otsv)

# 2. Set up kubernetes/helm for azure-workload-identity

$tenantId=(az account show --query tenantId -otsv)

az aks get-credentials -g $k8sResourceGroup  -n $k8sClusterName

helm repo add azure-workload-identity https://azure.github.io/azure-workload-identity/charts
helm repo update
helm install workload-identity-webhook azure-workload-identity/workload-identity-webhook `
    --namespace azure-workload-identity-system `
    --create-namespace `
    --set azureTenantID=$tenantId

# 3. Create the User-Managed Identity in Azure and assign to the resources

# Create an Azure User-Managed identity
# I created it manually via the portal, but it may work like this:
#     az identity create --name "${USER_ASSIGNED_IDENTITY_NAME}" --resource-group "${RESOURCE_GROUP}"

$clientId=(az identity show -g $resourceGroup -n $identityName --query clientId -otsv)

# For Azure SQL, Follow https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/tutorial-windows-vm-access-sql to grant access
#
# CREATE USER [-USER-NAME-HERE-] FROM EXTERNAL PROVIDER
# ALTER ROLE db_datareader ADD MEMBER [-USER-NAME-HERE-]
# ALTER ROLE db_datawriter ADD MEMBER [-USER-NAME-HERE-]

# 4. Set up service account in kubernetes

kubectl create ns $k8sNamespace
kubectl create sa -n $k8sNamespace $k8sServiceAccountName
kubectl annotate sa -n $k8sNamespace $k8sServiceAccountName azure.workload.identity/client-id="${clientId}" --overwrite
kubectl annotate sa -n $k8sNamespace $k8sServiceAccountName azure.workload.identity/tenant-id="${tenantId}" --overwrite

# 5. Link service account to Azure Identity

az identity federated-credential create `
  --name "kubernetes-federated-credential" `
  --identity-name "$identityName" `
  --resource-group "$resourceGroup" `
  --issuer "$oidcUrl" `
  --subject "system:serviceaccount:${k8sNamespace}:${k8sServiceAccountName}"

# 6. Specify account in pod via `serviceAccountName: $k8sServiceAccountName`
