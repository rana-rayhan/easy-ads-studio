import AuthService from "../../services/AuthService";
import UserRepo from "../../repositories/UserRepo";
import { MessageKey } from "../../enums/MessageKeys";

// Replace the real repository with fakes, so no database is used.
jest.mock("../../repositories/UserRepo", () => ({
  __esModule: true,
  default: { findByEmail: jest.fn(), findById: jest.fn(), create: jest.fn() },
}));

// Replace the env file, so no .env is needed.
jest.mock("../../secrets/envSecret", () => ({ JWT_TOKEN_SECRET: "test_secret" }));

describe("AuthService.register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user with a lowercase, trimmed email and hides the password", async () => {
    jest.mocked(UserRepo.findByEmail).mockResolvedValue(null);
    jest.mocked(UserRepo.create).mockResolvedValue({
      id: 1,
      email: "ana@example.com",
      firstName: "Ana",
      lastName: "Test",
      roles: ["sales_rep"],
      password: "hashed_password",
    } as never);

    const result = await AuthService.register({
      firstName: " Ana ",
      lastName: "Test",
      email: "  ANA@Example.com ",
      password: "password123",
    });

    expect(UserRepo.findByEmail).toHaveBeenCalledWith({ email: "ana@example.com" });
    expect(result).not.toHaveProperty("password");
    expect(result.email).toBe("ana@example.com");
  });

  it("throws 409 when the email already exists", async () => {
    jest.mocked(UserRepo.findByEmail).mockResolvedValue({ id: 1 } as never);

    await expect(
      AuthService.register({ firstName: "Ana", lastName: "Test", email: "ana@example.com", password: "password123" }),
    ).rejects.toMatchObject({ status: 409, message: MessageKey.USER_EMAIL_EXISTS });

    expect(UserRepo.create).not.toHaveBeenCalled();
  });
});
