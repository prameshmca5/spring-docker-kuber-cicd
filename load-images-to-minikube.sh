#!/bin/bash
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin
DOCKER=$(which docker)
MINIKUBE=$(which minikube)

IMAGES=$( $DOCKER images --format "{{.Repository}}:{{.Tag}}" | grep springbootapps | grep latest )

for img in $IMAGES; do
  echo "=> Processing image: $img"
  # Use a filename-safe name
  safe_name=$(echo $img | tr ':' '_' | tr '/' '_')
  tar_file="/tmp/${safe_name}.tar"
  
  echo "   [1/3] Saving host docker image to $tar_file..."
  $DOCKER save -o $tar_file $img
  
  echo "   [2/3] Loading into Minikube..."
  $MINIKUBE image load $tar_file
  
  echo "   [3/3] Deleting temp file..."
  rm $tar_file
  
  echo "   ✔ Image $img loaded into Minikube!"
done

# Special case for springbootapps-springbootapp:v2
echo "=> Processing image: springbootapps-springbootapp:v2"
$DOCKER tag springbootapps-api-gateway:latest springbootapps-springbootapp:v2
$DOCKER save -o /tmp/springbootapp_v2.tar springbootapps-springbootapp:v2
$MINIKUBE image load /tmp/springbootapp_v2.tar
rm /tmp/springbootapp_v2.tar
echo "   ✔ Image springbootapps-springbootapp:v2 loaded into Minikube!"

echo ""
echo "All images loaded successfully into Minikube!"
