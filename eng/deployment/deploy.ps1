$k8sNamespace='game-docs-engine'
$releaseName='vtt-dekrey-net'
$registryLoginServer='dekreydotnet.azurecr.io'
$imageName='gamedocsengine'

docker build . -t dekreydotnet.azurecr.io/gamedocsengine --build-arg GITHASH=$(git rev-parse HEAD)
az acr login -n dekreydotnet
docker push dekreydotnet.azurecr.io/gamedocsengine

helm repo add mdekrey https://mdekrey.github.io/helm-charts
helm repo update mdekrey
helm upgrade --install -n $k8sNamespace $releaseName --repo https://mdekrey.github.io/helm-charts single-container `
  --set-string "image.repository=$registryLoginServer/$imageName" `
  --set-string "image.tag=latest" `
  --values ./eng/deployment/values.prod.yaml --wait
