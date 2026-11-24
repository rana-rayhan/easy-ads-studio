# Kubernetes (minikube)

The whole app on Kubernetes: **2 backend pods** with **nginx as the load balancer** in front.

```
browser → nginx → /api → backend pod 1 / backend pod 2
                → /    → frontend
backend → RabbitMQ → ad worker, AI worker → Ollama on your Mac (outside Kubernetes)
```

| File | What it runs |
| --- | --- |
| `database.yaml` | PostgreSQL (data saved), Redis, RabbitMQ (1 pod each + a Service) |
| `backend.yaml` | Express backend, **2 pods** + a headless Service |
| `frontend.yaml` | React app (Vite) + Service |
| `workers.yaml` | Ad worker and AI worker |
| `nginx.yaml` | nginx config (ConfigMap) + nginx pod + Service |

Uploaded images go to `/data/admanager-uploads` on the minikube machine, a folder shared by the backend pods and the workers.

The AI uses Ollama on your Mac, not in a pod: there it uses the GPU, so answers take seconds. Pods reach it at `host.minikube.internal:11434`.

## First time setup

You need [minikube](https://minikube.sigs.k8s.io/), `kubectl` and [Ollama](https://ollama.com) with the model:

```bash
brew install minikube kubectl ollama
brew services start ollama
ollama pull gemma3:4b
```

Run these from the project root.

```bash
# 0. Create backend/.env if you do not have one yet
cp backend/.env.sample backend/.env

# 1. Start a local cluster
minikube start

# 2. Build the backend and frontend images inside minikube
minikube image build -t admanager-backend:local -f backend/Dockerfile .
minikube image build -t admanager-frontend:local -f frontend/Dockerfile .

# 3. Put backend/.env into the cluster as a secret
kubectl create secret generic backend-env --from-env-file=backend/.env

# 4. Start everything
kubectl apply -f k8s/

# 5. Wait until all pods are "Running" (Ctrl+C to stop watching)
kubectl get pods -w
```

## Start the UI

Stop Docker Compose first, because it also uses port 8080. Then run this and keep it open:

```bash
kubectl port-forward service/admanager-nginx 8080:80
```

Open http://localhost:8080.

Next time you only need `minikube start` and the `port-forward`. The pods start again on their own.

## Test everything step by step

**1. nginx works**

```bash
curl http://localhost:8080/nginx-health      # "ok" comes from nginx itself
```

**2. nginx load balances the 2 backend pods**

Each answer has an `X-Backend-Pod` header with the IP of the pod that answered:

```bash
for i in 1 2 3 4; do curl -s -o /dev/null -D - http://localhost:8080/health | grep X-Backend-Pod; done
```

The IP should switch between the 2 pods. Compare with the pod IPs:

```bash
kubectl get pods -l app=admanager-backend -o wide
```

**3. The UI works with the database**

1. Open http://localhost:8080 and register a new user.
2. Check that the user is saved in PostgreSQL:

```bash
kubectl exec deploy/admanager-db -- psql -U postgres -d admanager_db -c "select id, email from users;"
```

**4. The pods can reach Ollama on your Mac**

```bash
kubectl exec deploy/admanager-ai-worker -- wget -qO- http://host.minikube.internal:11434/api/tags      # gemma3:4b should be listed
```

**5. The workers work**

1. In the navbar, switch to **Worker** mode.
2. Run "Ad ideas" in the AI studio.
3. Watch the AI worker take the job:

```bash
kubectl logs -f deploy/admanager-ai-worker
```

4. Optional: open the RabbitMQ page and look at the queues (log in with guest / guest):

```bash
kubectl port-forward deploy/admanager-rabbitmq 15673:15672
```

Then open http://localhost:15673.

## After you change the code

The images hold a copy of the code, so build again and restart:

```bash
minikube image build -t admanager-backend:local -f backend/Dockerfile .
kubectl rollout restart deployment admanager-backend admanager-ad-worker admanager-ai-worker
```

For the frontend, build `admanager-frontend:local` and restart `admanager-frontend`.
After changing a `.yaml` file, run `kubectl apply -f k8s/` again.
After changing `nginx.yaml`, also run `kubectl rollout restart deployment admanager-nginx`.

## Useful commands

```bash
kubectl get pods                                   # list pods
kubectl logs -l app=admanager-backend --prefix     # logs of both backend pods
kubectl scale deployment admanager-backend --replicas=3   # 3 backend pods
kubectl delete -f k8s/                             # remove everything
minikube stop                                      # stop the cluster
```

## Good to know

- AI jobs fail with "Cannot reach Ollama"? Ollama is not running on your Mac: `brew services start ollama`.
- Right after `minikube start`, some pods can show `CreateContainerConfigError` or `Error` for a minute. Kubernetes retries on its own.

- Users are kept in `/data/admanager-db` on the minikube machine, so they survive restarts. Login sessions are in Redis, which keeps nothing, so after a restart you log in again.
- After `minikube stop` / `minikube start` the `port-forward` stops. Run it again, or the app does not open.
- `minikube delete` removes everything, including the users. The AI model stays on your Mac.
- A pod stuck on `ContainerCreating` is usually still downloading its image. `kubectl describe pod <name>` shows why.
