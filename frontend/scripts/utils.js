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

// escape html
const escapeHTML = (
    value
) => {

    return String(
        value || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
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
const getToken = () => {

    return localStorage.getItem(
        CONFIG.STORAGE_KEYS.TOKEN
    );
};

const getRefreshToken = () => {

    return localStorage.getItem(
        CONFIG.STORAGE_KEYS.REFRESH_TOKEN
    );
};

const getUser = () => {

    return getJSON(
        CONFIG.STORAGE_KEYS.USER,
        null
    );
};

const clearAuthData = () => {

    removeStorage(
        CONFIG.STORAGE_KEYS.TOKEN
    );

    removeStorage(
        CONFIG.STORAGE_KEYS.REFRESH_TOKEN
    );

    removeStorage(
        CONFIG.STORAGE_KEYS.USER
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

        setTimeout(
            () => {

                window.location.href =
                    "signin.html";

            },
            800
        );

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

                        method:
                            "POST",

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

            // invalid refresh
            if (
                !response.ok
                ||
                !data.accessToken
            ) {

                clearAuthData();

                return null;
            }

            // save tokens
            localStorage.setItem(
                CONFIG.STORAGE_KEYS.TOKEN,
                data.accessToken
            );

            if (
                data.refreshToken
            ) {

                localStorage.setItem(
                    CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
                    data.refreshToken
                );
            }

            // save user
            if (
                data.user
            ) {

                setJSON(
                    CONFIG.STORAGE_KEYS.USER,
                    data.user
                );
            }

            return data.accessToken;

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

        const controller =
            new AbortController();

        const timeoutId =
            setTimeout(
                () => {
                
                    if (
                        !controller.signal.aborted
                    ) {
                    
                        controller.abort(
                            "Request timeout"
                        );
                    }
                
                },
                CONFIG.REQUEST_TIMEOUT || 20000
            );

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

                        headers,

                        signal:
                            controller.signal
                    }
                );

            clearTimeout(
                timeoutId
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

                setTimeout(
                    () => {

                        window.location.href =
                            "signin.html";

                    },
                    1000
                );

                return {

                    success: false,

                    message:
                        "Unauthorized"
                };
            }

            // safe json parse
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
                    data.message
                    ||
                    `Request failed (${response.status})`
                );
            }

            return data;

        } catch (error) {

            clearTimeout(
                timeoutId
            );

            console.error(
                `API REQUEST ERROR (${url}):`,
                error
            );

            // network errors
            if (
                error.name ===
                "AbortError"
            ) {
            
                console.warn(
                    `REQUEST TIMEOUT: ${url}`
                );
            
                return {
                
                    success: false,
                
                    timeout: true,
                
                    message:
                        "Server took too long to respond"
                };
            } {

                return {

                    success: false,

                    message:
                        "Request timeout"
                };
            }

            return {

                success: false,

                message:
                    error.message
                    || "Request failed"
            };
        }
    };

// dom helpers
const $ = (
    selector,
    scope = document
) => {

    return scope.querySelector(
        selector
    );
};

const $$ = (
    selector,
    scope = document
) => {

    return scope.querySelectorAll(
        selector
    );
};

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

// safe array
const safeArray = (
    value
) => {

    return Array.isArray(
        value
    )
        ? value
        : [];
};

// safe number
const safeNumber = (
    value,
    fallback = 0
) => {

    const parsed =
        Number(value);

    return Number.isFinite(
        parsed
    )
        ? parsed
        : fallback;
};

// safe integer
const safeInteger = (
    value,
    fallback = 0
) => {

    const parsed =
        parseInt(
            value,
            10
        );

    return Number.isInteger(
        parsed
    )
        ? parsed
        : fallback;
};

// safe foreach
const safeForEach = (
    arr,
    callback
) => {

    safeArray(arr)
        .forEach(
            callback
        );
};

// safe map
const safeMap = (
    arr,
    callback
) => {

    return safeArray(
        arr
    ).map(
        callback
    );
};

// debounce
const debounce = (
    callback,
    delay = 300
) => {

    let timeoutId;

    return (
        ...args
    ) => {

        clearTimeout(
            timeoutId
        );

        timeoutId =
            setTimeout(
                () => {

                    callback(
                        ...args
                    );

                },
                delay
            );
    };
};

// throttle
const throttle = (
    callback,
    limit = 300
) => {

    let waiting =
        false;

    return (
        ...args
    ) => {

        if (
            waiting
        ) {

            return;
        }

        callback(
            ...args
        );

        waiting =
            true;

        setTimeout(
            () => {

                waiting =
                    false;

            },
            limit
        );
    };
};

// cart helpers
const getCart = () => {

    return getJSON(
        CONFIG.STORAGE_KEYS.CART,
        []
    );
};

const saveCart = (
    cart
) => {

    setJSON(
        CONFIG.STORAGE_KEYS.CART,
        safeArray(cart)
    );
};

const getWishlist = () => {

    return getJSON(
        CONFIG.STORAGE_KEYS.WISHLIST,
        []
    );
};

const saveWishlist = (
    wishlist
) => {

    setJSON(
        CONFIG.STORAGE_KEYS.WISHLIST,
        safeArray(wishlist)
    );
};

// app utils
window.AppUtils = {

    CONFIG,

    notify,

    escapeHTML,

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

    safeArray,

    safeNumber,

    safeInteger,

    safeForEach,

    safeMap,

    debounce,

    throttle,

    getCart,

    saveCart,

    getWishlist,

    saveWishlist
};

// backward compatibility
window.API_BASE =
    CONFIG.API_BASE;

window.notify =
    notify;

window.getJSON =
    getJSON;

window.setJSON =
    setJSON;

window.apiRequest =
    apiRequest;

window.$ =
    $;

window.$$ =
    $$;

window.formatPrice =
    formatPrice;

window.requireAuth =
    requireAuth;

window.defaultImage =
    defaultImage;

window.safeForEach =
    safeForEach;

window.safeMap =
    safeMap;