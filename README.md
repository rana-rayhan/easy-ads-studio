# Easy Ads Studio

A small ad manager. You write an ad, a free AI that runs on your own computer helps with the text, and a background worker creates the ad while you watch its status live.

Built as a learning project for React, Express, Redis, RabbitMQ, nginx, the Google Ads API and local AI.

https://github.com/user-attachments/assets/599f6869-6733-4dc1-be05-02bf94a65272

## User story

> As a small shop owner, I want help writing a good ad and to see when it is ready, so I can get my product out without hiring a copywriter.

### How to use it

1. **Create an account** and log in.
2. **AI studio**: enter your product and audience, click **Suggest ad text**, then click a headline or description to use it.
3. **Create ad**: choose an image. Click **Text from image** to let the AI write text from it, or **Check with AI** to get a score and a better version. The preview updates as you type.
4. Click **Create ad**. The job appears in **Your jobs** and moves from _Waiting_ to _Done_.
5. **Campaigns** (optional, needs Google Ads): create a paused campaign, then click **Explain with AI** for a short summary.

**Worker or Local** (top bar): _Worker_ sends each job through RabbitMQ to a worker. _Local_ lets the API do the job itself. The dashboard shows which parts are running.

In Worker mode a failed job is tried 3 times, then moved to a dead-letter queue (`ai_job_dead`, `ad_job_create_dead`) that you can see on the RabbitMQ web page.

> Updating from an older version? RabbitMQ keeps the old queues and refuses the new settings (`PRECONDITION_FAILED`). Delete `ai_job` and `ad_job_create` once on the RabbitMQ web page (Queues → Delete), or in Docker run `docker compose up -d --force-recreate admanager-rabbitmq`.

## Run it with Docker

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [Ollama](https://ollama.com) on your computer. Ollama runs outside Docker because it can use your GPU there, so AI answers take seconds instead of minutes.

```bash
brew install ollama
brew services start ollama
ollama pull gemma3:4b
```

Then start the app:

```bash
cp backend/.env.sample backend/.env
docker compose up --build
```

Open <http://localhost:8080>.

- No local Ollama? Run it in Docker instead (CPU only, an image job can take a few minutes): `OLLAMA_URL=http://admanager-ollama:11434 docker compose --profile ollama up --build`
- RabbitMQ web page: <http://localhost:15673> (guest / guest). API docs: <http://localhost:4040/api-docs>.

## Run it locally

You need Node.js 24, PostgreSQL, Redis, RabbitMQ and Ollama. On macOS:

```bash
brew install node@24 postgresql@17 redis rabbitmq ollama
brew services start postgresql@17 && brew services start redis && brew services start rabbitmq && brew services start ollama
ollama pull gemma3:4b
```

Create the database once:

```bash
psql postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"
createdb -U postgres admanager_db
```

Install and start:

```bash
npm install
cp backend/.env.sample backend/.env
cp frontend/.env.sample frontend/.env
npm run dev
```

Open <http://localhost:5173>. `npm run dev` starts the backend, the frontend and both workers. Press `Ctrl+C` to stop them.

### Google Ads (optional)

The campaigns section needs a Google Ads **test account** (free, never shows ads). Save your service account key as `backend/google-ads-key.json`, put the two account ids in `backend/.env`, then check the connection:

```bash
npm run google:check -w backend
```

## Technology

| Part                                               | Used for                                     |
| -------------------------------------------------- | -------------------------------------------- |
| React, Vite, Tailwind CSS, Ant Design, React Query | The web app                                  |
| Express, TypeScript                                | The API                                      |
| PostgreSQL (TypeORM)                               | Users                                        |
| Redis                                              | Login sessions and job status                |
| RabbitMQ                                           | Job queue between the API and the workers    |
| Ollama (`gemma3:4b`)                               | Free local AI that reads text and images     |
| Google Ads REST API                                | Creating and reading campaigns               |
| nginx                                              | One address for the app and the API (Docker) |
| Docker Compose                                     | Runs everything with one command             |
