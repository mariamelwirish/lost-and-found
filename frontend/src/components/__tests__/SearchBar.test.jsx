import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import SearchBar from "../SearchBar";
import { LOCATIONS } from "../../data/locations";

describe("SearchBar", () => {
  it("debounces user input before calling onChange", async () => {
    const onChange = vi.fn();
    render(<SearchBar defaultKind="lost" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/search title/i), "wallet");
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({ q: "wallet", kind: "lost" })
    );
  });

  it("clears filters when Reset is clicked", async () => {
    const onChange = vi.fn();
    render(<SearchBar defaultKind="found" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/search title/i), "bag");
    await userEvent.selectOptions(
      screen.getByLabelText(/search by location/i),
      LOCATIONS[0]
    );
    await userEvent.type(
      screen.getByLabelText(/filter by date/i),
      "2024-01-01"
    );

    await userEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onChange).toHaveBeenLastCalledWith({ kind: "found" });
    expect(screen.getByLabelText(/search title/i)).toHaveValue("");
    expect(screen.getByLabelText(/search by location/i)).toHaveValue("");
    expect(screen.getByLabelText(/filter by date/i)).toHaveValue("");
  });
});
