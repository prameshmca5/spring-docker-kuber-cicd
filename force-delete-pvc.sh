#!/bin/bash
NAMESPACE="db"
PVCs=$(PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin kubectl get pvc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
for pvc in $PVCs; do
  echo "Triggering deletion and removing finalizer for PVC $pvc in $NAMESPACE..."
  PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin kubectl delete pvc $pvc -n $NAMESPACE --wait=false || true
  PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin kubectl patch pvc $pvc -n $NAMESPACE -p '{"metadata":{"finalizers":null}}' --type=merge || true
done
