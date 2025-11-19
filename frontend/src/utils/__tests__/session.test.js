import { clearUser, getUser, setUser, USER_KEY } from "../session";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

describe("session utils", () => {
  const createStorage = () => {
    let data = {};
    return {
      getItem: (key) =>
        Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null,
      setItem: (key, value) => {
        data[key] = value;
      },
      removeItem: (key) => {
        delete data[key];
      },
      clear: () => {
        data = {};
      },
    };
  };

  beforeEach(() => {
    const storage = createStorage();
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
    });
  });

  it("returns null when storage is empty or invalid", () => {
    expect(getUser()).toBeNull();
    window.localStorage.setItem(USER_KEY, "{bad json}");
    expect(getUser()).toBeNull();
  });

  it("persists and retrieves user objects", () => {
    const user = { username: "alice" };
    setUser(user);
    expect(getUser()).toEqual(user);
  });

  it("clears user and token storage", () => {
    window.localStorage.setItem(USER_KEY, "{}");
    window.localStorage.setItem("access_token", "old");
    window.localStorage.setItem("refresh_token", "old");
    window.localStorage.setItem(ACCESS_TOKEN, "new");
    window.localStorage.setItem(REFRESH_TOKEN, "new");

    clearUser();

    expect(window.localStorage.getItem(USER_KEY)).toBeNull();
    expect(window.localStorage.getItem("access_token")).toBeNull();
    expect(window.localStorage.getItem("refresh_token")).toBeNull();
    expect(window.localStorage.getItem(ACCESS_TOKEN)).toBeNull();
    expect(window.localStorage.getItem(REFRESH_TOKEN)).toBeNull();
  });
});
