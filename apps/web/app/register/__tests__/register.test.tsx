import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RegisterPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../../../src/lib/api", () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { apiFetch } from "../../../src/lib/api";
const mockApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockApiFetch.mockReset();
  mockPush.mockReset();
});

async function fillForm(email: string, password: string, confirm: string) {
  await userEvent.type(screen.getByLabelText(/email/i), email);
  await userEvent.type(screen.getByLabelText(/^password$/i), password);
  await userEvent.type(screen.getByLabelText(/confirm password/i), confirm);
}

describe("RegisterPage", () => {
  it("renders all fields and the submit button", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<RegisterPage />);
    await fillForm("a@b.com", "password123", "different123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("calls apiFetch and redirects on success", async () => {
    mockApiFetch.mockResolvedValueOnce({});
    render(<RegisterPage />);
    await fillForm("a@b.com", "password123", "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/me/profile"));
  });

  it("shows readable error for password too short", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("String must contain at least 8 character(s)"));
    render(<RegisterPage />);
    await fillForm("a@b.com", "short123", "short123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument()
    );
  });

  it("shows generic error on other API failures", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Email already in use"));
    render(<RegisterPage />);
    await fillForm("taken@b.com", "password123", "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(screen.getByText("Email already in use")).toBeInTheDocument()
    );
  });
});
