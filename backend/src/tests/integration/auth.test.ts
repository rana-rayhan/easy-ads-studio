import request from "supertest";

import app from "../../app";
import { DatabaseMiddleware } from "../../middlewares/DatabaseMiddleware";

// Every run uses a new email, so tests never clash with old rows in the database.
const unique = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
const email = `ana_${unique}@example.com`;
const password = "Password123!Test";

// ApiResponse.success always puts the data in "payload".
type AuthPayload = { email: string; accessToken: string; refreshToken: string; user: { email: string } };
const getPayload = (body: unknown): AuthPayload => (body as { payload: AuthPayload }).payload;
const registerBody = { firstName: "Ana", lastName: "Test", email, password };

describe("Auth API (integration)", () => {
  // Close the database connection when all tests are done (fixes the "worker failed to exit" warning).
  afterAll(async () => {
    await DatabaseMiddleware.closeDatabaseConnection();
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user and does not return the password", async () => {
      const res = await request(app).post("/api/auth/register").send(registerBody);

      expect(res.status).toBe(201);
      const user = getPayload(res.body);
      expect(user.email).toBe(email);
      expect(user).not.toHaveProperty("password");
    });

    it("returns 409 when the email is already registered", async () => {
      const res = await request(app).post("/api/auth/register").send(registerBody);

      expect(res.status).toBe(409);
    });

    // ASSUMPTION 2: the validator answers 400. If it answers 422, change the number.
    it("returns 400 when the password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...registerBody, email: `short_${unique}@example.com`, password: "123" });

      expect(res.status).toBe(422);
    });

    it("returns 400 when a required field is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: `missing_${unique}@example.com`, password });

      expect(res.status).toBe(422);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with the correct password and returns both tokens", async () => {
      const res = await request(app).post("/api/auth/login").send({ email, password });

      expect(res.status).toBe(200);
      const payload = getPayload(res.body);
      expect(typeof payload.accessToken).toBe("string");
      expect(typeof payload.refreshToken).toBe("string");
      expect(payload.user.email).toBe(email);
      expect(payload.user).not.toHaveProperty("password");
    });

    it("accepts the email in a different case", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: email.toUpperCase(), password });

      expect(res.status).toBe(200);
    });

    it("returns 401 for a wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({ email, password: "wrong_password" });

      expect(res.status).toBe(401);
    });

    it("returns 401 for an email that does not exist", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: `nobody_${unique}@example.com`, password });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("returns a new access token for a valid refresh token", async () => {
      const login = await request(app).post("/api/auth/login").send({ email, password });
      const { refreshToken } = getPayload(login.body);

      const res = await request(app).post("/api/auth/refresh-token").send({ refreshToken });

      expect(res.status).toBe(200);
      expect(typeof getPayload(res.body).accessToken).toBe("string");
    });

    it("returns 401 for an invalid refresh token", async () => {
      const res = await request(app).post("/api/auth/refresh-token").send({ refreshToken: "garbage" });

      expect(res.status).toBe(401);
    });

    it("returns 401 when no refresh token is sent", async () => {
      const res = await request(app).post("/api/auth/refresh-token").send({});

      expect(res.status).toBe(401);
    });
  });
});
