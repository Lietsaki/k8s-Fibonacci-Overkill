docker build -t ricardosandez/fib-client:latest -t ricardosandez/fib-client:$SHA -f ./client/Dockerfile ./client
docker build -t ricardosandez/fib-server:latest -t ricardosandez/fib-server:$SHA -f ./server/Dockerfile ./server
docker build -t ricardosandez/fib-worker:latest -t ricardosandez/fib-worker:$SHA -f ./worker/Dockerfile ./worker

docker push ricardosandez/fib-client:latest
docker push ricardosandez/fib-server:latest
docker push ricardosandez/fib-worker:latest

docker push ricardosandez/fib-client:$SHA
docker push ricardosandez/fib-server:$SHA
docker push ricardosandez/fib-worker:$SHA

# We can access to kubectl here because we installed it in the .travis.yml file, remember this script runs in that context
kubectl apply -f ./k8s

# Update the images in the deployments. Use the SHA to force an update. 
# If we used 'latest' it wouldn't work because it is already running the latest version and it doesn't check for differences.
kubectl set image deployments/server-deployment server=ricardosandez/fib-server:$SHA
kubectl set image deployments/client-deployment client=ricardosandez/fib-client:$SHA
kubectl set image deployments/worker-deployment worker=ricardosandez/fib-worker:$SHA