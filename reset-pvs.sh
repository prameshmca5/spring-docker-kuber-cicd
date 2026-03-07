#!/bin/bash
PVs=$(PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin kubectl get pv -o jsonpath='{.items[?(@.status.phase=="Released")].metadata.name}')
for pv in $PVs; do
  echo "Patching PV $pv to remove claimRef..."
  PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin kubectl patch pv $pv -p '{"spec":{"claimRef":null}}'
done
