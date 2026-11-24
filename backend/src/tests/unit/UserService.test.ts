import UserService from "../../services/UserService";
import UserRepo from "../../repositories/UserRepo";

// Replace the real repository with fakes, so no database is used.
jest.mock("../../repositories/UserRepo", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findById: jest.fn() },
}));

describe("UserService.getUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns all users without their passwords", async () => {
    jest.mocked(UserRepo.findAll).mockResolvedValue([
      { id: 1, email: "ana@example.com", passwordHash: "hash1" },
      { id: 2, email: "bob@example.com", passwordHash: "hash2" },
    ] as never);

    const result = await UserService.getUsers();

    expect(result).toHaveLength(2);
    result.forEach((user) => expect(user).not.toHaveProperty("passwordHash"));
    expect(result[0].email).toBe("ana@example.com");
  });
});

describe("UserService.getUserDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the user without the password", async () => {
    jest.mocked(UserRepo.findById).mockResolvedValue({
      id: 1,
      email: "ana@example.com",
      passwordHash: "hash1",
    } as never);

    const result = await UserService.getUserDetails("1");

    expect(UserRepo.findById).toHaveBeenCalledWith({ id: "1" });
    expect(result).not.toHaveProperty("passwordHash");
    expect(result.email).toBe("ana@example.com");
  });

  it("throws 404 when the user does not exist", async () => {
    jest.mocked(UserRepo.findById).mockResolvedValue(null);

    await expect(UserService.getUserDetails("99")).rejects.toMatchObject({ status: 404 });
  });
});
