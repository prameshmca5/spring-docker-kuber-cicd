#!/bin/bash
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin
KUBECTL=$(which kubectl)

TERMINATING_PODS=$( $KUBECTL get pods -A | grep Terminating | awk '{print $1":"$2}' )

for pod_info in $TERMINATING_PODS; do
  ns=$(echo $pod_info | cut -d':' -f1)
  name=$(echo $pod_info | cut -d':' -f2)
  echo "Force deleting pod $name in namespace $ns..."
  $KUBECTL patch pod $name -n $ns -p '{"metadata":{"finalizers":null}}' --type=merge
  $KUBECTL delete pod $name -n $ns --force --grace-period=0
done
