## Local Development

Run the cluster:

`kubectl apply -f k8s`

If Skaffold is installed, use `skaffold dev` for local development without having to rebuild the images to see every little change.

It'll be available at `localhost:80`

Stop the cluster:

`kubectl delete -f k8s`
