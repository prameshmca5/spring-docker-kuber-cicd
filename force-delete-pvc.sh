#!/bin/bash
NAMESPACE="db"
PVCs=$(PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin kubectl get pvc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
for pvc in $PVCs; do
  echo "Removing finalizer for PVC $pvc in $NAMESPACE..."
  PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin kubectl patch pvc $pvc -n $NAMESPACE -p '{"metadata":{"finalizers":null}}' --type=merge
done
