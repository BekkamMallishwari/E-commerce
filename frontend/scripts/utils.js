// notification helper
const notify = (
    message,
    type = "info"
) => {
    if (
        typeof window.showToast ===
        "function"
    ) {
        window.showToast(
            message,
            type
        );
        return;
    }

    console[
        type === "error"
            ? "error"
            : "log"
    ](message);
    if (
        type === "error"
    ) {
        alert(message);
    }
};

// safe local storage helpers
const getJSON = (
    key,
    fallback = null
) => {
    try {
        const value =
            localStorage.getItem(
                key
            );

        return value
            ? JSON.parse(value)
            : fallback;

    } catch (error) {
        console.error(
            `getJSON error for key "${key}":`,
            error
        );
        return fallback;
    }
};

const setJSON = (
    key,
    value
) => {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;
    } catch (error) {
        console.error(
            `setJSON error for key "${key}":`,
            error
        );
        return false;
    }
};

const removeStorage = (
    key
) => {
    try {
        localStorage.removeItem(
            key
        );
    } catch (error) {
        console.error(
            `removeStorage error for key "${key}":`,
            error
        );
    }
};

// auth helpers
const getToken = () =>
    localStorage.getItem(
        "token"
    );

const getRefreshToken = () =>
    localStorage.getItem(
        "refreshToken"
    );

const getUser = () =>
    getJSON(
        "user"
    );

const clearAuthData = () => {
    removeStorage(
        "token"
    );
    removeStorage(
        "refreshToken"
    );
    removeStorage(
        "user"
    );
};

const requireAuth = () => {
    const token =
        getToken();

    const user =
        getUser();

    if (
        !token
        ||
        !user
    ) {
        notify(
            "Please sign in to continue",
            "error"
        );
        setTimeout(() => {
            window.location.href =
                "signin.html";
        }, 800);
        return null;
    }
    return user;
};

// refresh token
const refreshAccessToken =
    async () => {
        try {
            const refreshToken =
                getRefreshToken();
            if (
                !refreshToken
            ) {
                clearAuthData();
                return null;
            }

            const response =
                await fetch(
                    `${CONFIG.API_BASE}/auth/refresh-token`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify({
                                refreshToken
                            })
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok
                ||
                !data.token
            ) {
                clearAuthData();
                return null;
            }
            localStorage.setItem(
                "token",
                data.token
            );
            return data.token;
        } catch (error) {
            console.error(
                "TOKEN REFRESH ERROR:",
                error
            );
            clearAuthData();
            return null;
        }
    };

// api request
const apiRequest =
    async (
        url,
        options = {},
        retry = true
    ) => {
        try {
            const token =
                getToken();

            const headers = {
                "Content-Type":
                    "application/json",

                ...(token
                    ? {
                        Authorization:
                            `Bearer ${token}`
                    }
                    : {}),
                ...(options.headers || {})
            };

            const response =
                await fetch(
                    `${CONFIG.API_BASE}${url}`,
                    {
                        ...options,
                        headers
                    }
                );

            // unauthorized
            if (
                response.status === 401
                &&
                retry
            ) {

                const newToken =
                    await refreshAccessToken();

                if (
                    newToken
                ) {
                    return apiRequest(
                        url,
                        options,
                        false
                    );
                }

                clearAuthData();
                notify(
                    "Session expired. Please login again.",
                    "error"
                );

                setTimeout(() => {
                    window.location.href =
                        "signin.html";
                }, 1000);
                return {
                    success: false,
                    message:
                        "Unauthorized"
                };
            }

            // parse json safely
            let data = {};
            try {
                data =
                    await response.json();
            } catch {
                data = {
                    success: false,
                    message:
                        "Invalid server response"
                };
            }

            if (
                !response.ok
            ) {
                throw new Error(
                    data.message ||
                    `Request failed (${response.status})`
                );
            }
            return data;
        } catch (error) {
            console.error(
                `API REQUEST ERROR (${url}):`,
                error
            );
            return {
                success: false,
                message:
                    error.message ||
                    "Request failed"
            };
        }
    };

// dom helpers
const $ = (
    selector,
    scope = document
) =>
    scope.querySelector(
        selector
    );

const $$ = (
    selector,
    scope = document
) =>
    scope.querySelectorAll(
        selector
    );

// price formatter
const formatPrice = (
    price
) => {
    return `₹${parseFloat(
        price || 0
    ).toFixed(2)}`;
};

// image fallback
const defaultImage = (
    url
) => {
    return (
        url
        &&
        typeof url === "string"
        &&
        url.trim()
    )
        ? url
        : "assets/images/default-product.png";
};

// safe helpers
const safeForEach = (
    arr,
    callback
) => {
    if (
        Array.isArray(arr)
    ) {
        arr.forEach(
            callback
        );
    }
};

const safeMap = (
    arr,
    callback
) => {
    return Array.isArray(
        arr
    )
        ? arr.map(
            callback
        )
        : [];
};

// cart helpers
const getCart = () =>
    getJSON(
        "cart",
        []
    );
const saveCart = (
    cart
) => {
    setJSON(
        "cart",
        Array.isArray(cart)
            ? cart
            : []
    );
};

const getWishlist = () =>
    getJSON(
        "wishlist",
        []
    );

const saveWishlist = (
    wishlist
) => {
    setJSON(
        "wishlist",
        Array.isArray(wishlist)
            ? wishlist
            : []
    );
};

// app utils
window.AppUtils = {
    CONFIG,
    notify,
    getJSON,
    setJSON,
    removeStorage,
    getToken,
    getRefreshToken,
    getUser,
    clearAuthData,
    requireAuth,
    refreshAccessToken,
    apiRequest,
    $,
    $$,
    formatPrice,
    defaultImage,
    safeForEach,
    safeMap,
    getCart,
    saveCart,
    getWishlist,
    saveWishlist
};

// backward compatibility
window.API_BASE = CONFIG.API_BASE;
window.notify = notify;
window.getJSON = getJSON;
window.setJSON = setJSON;
window.apiRequest = apiRequest;
window.$ = $;
window.$$ = $$;
window.formatPrice = formatPrice;
window.requireAuth = requireAuth;
window.defaultImage = defaultImage;
window.safeForEach = safeForEach;
window.safeMap = safeMap;