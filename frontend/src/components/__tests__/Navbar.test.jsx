import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Navbar from "../Navbar";
import { getUser, clearUser } from "../../utils/session";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("hamburger-react", () => ({
  Squash: () => <div data-testid="hamburger" />,
}));

vi.mock("../../utils/session", () => ({
  getUser: vi.fn(() => null),
  clearUser: vi.fn(),
}));

describe("Navbar", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    clearUser.mockReset();
    getUser.mockReset();
  });

  it("shows login link when no user is stored", () => {
    getUser.mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it("renders staff links and handles logout", async () => {
    getUser.mockReturnValue({
      username: "admin",
      is_staff: true,
    });

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText(/logout/i));
    expect(clearUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
