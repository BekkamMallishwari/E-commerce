// auth elements
const elements = {
    signupForm:
        document.getElementById(
            "signup-form"
        ),

    signinForm:
        document.getElementById(
            "signin-form"
        ),

    signupName:
        document.getElementById(
            "signup-name"
        ),

    signupEmail:
        document.getElementById(
            "signup-email"
        ),

    signupPassword:
        document.getElementById(
            "signup-password"
        ),

    signinEmail:
        document.getElementById(
            "signin-email"
        ),

    signinPassword:
        document.getElementById(
            "signin-password"
        ),

    authLink:
        document.getElementById(
            "auth-link"
        ),

    dropdown:
        document.getElementById(
            "profile-dropdown"
        ),

    logoutBtn:
        document.getElementById(
            "logout-btn"
        )
};

// validation
const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// auth api
async function signupUser(
    name,
    email,
    password
) {
    return await AppUtils.apiRequest(
        "/auth/signup",
        {
            method: "POST",
            body:
                JSON.stringify({
                    name,
                    email,
                    password
                })
        }
    );
}

async function loginUser(
    email,
    password
) {
    return await AppUtils.apiRequest(
        "/auth/login",
        {
            method: "POST",
            body:
                JSON.stringify({
                    email,
                    password
                })
        }
    );
}

// loading state
function toggleFormLoading(
    button,
    isLoading,
    loadingText = "Please wait..."
) {
    if (!button) {
        return;
    }

    if (isLoading) {
        button.dataset.originalText =
            button.innerHTML;

        button.disabled =
            true;

        button.innerHTML =
            loadingText;

    } else {
        button.disabled =
            false;

        button.innerHTML =
            button.dataset.originalText ||
            "Submit";
    }
}

// save auth
function saveAuthSession(
    response
) {
    if (
        !response
    ) {
        return;
    }

    localStorage.setItem(
        "token",
        response.accessToken || ""
    );

    localStorage.setItem(
        "refreshToken",
        response.refreshToken || ""
    );

    AppUtils.setJSON(
        "user",
        response.user || {}
    );
}

// clear auth
function clearAuthSession() {
    AppUtils.clearAuthData();
    localStorage.removeItem(
        "cart"
    );
    localStorage.removeItem(
        "wishlist"
    );
}

// signup
if (
    elements.signupForm
) {
    elements.signupForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();
            const submitBtn =
                elements.signupForm.querySelector(
                    'button[type="submit"]'
                );

            if (
                submitBtn?.disabled
            ) {
                return;
            }
            const name =
                elements.signupName.value.trim();
            const email =
                elements.signupEmail.value.trim();
            const password =
                elements.signupPassword.value;
            if (
                !name
            ) {
                AppUtils.notify(
                    "Name is required.",
                    "error"
                );
                return;
            }

            if (
                !emailRegex.test(email)
            ) {
                AppUtils.notify(
                    "Enter a valid email.",
                    "error"
                );
                return;
            }

            if (
                !passwordRegex.test(password)
            ) {
                AppUtils.notify(
                    "Password must contain uppercase, lowercase, number and 8 characters.",
                    "error"
                );
                return;
            }

            toggleFormLoading(
                submitBtn,
                true,
                "Creating Account..."
            );

            try {
                const response =
                    await signupUser(
                        name,
                        email,
                        password
                    );

                if (
                    response.success
                ) {
                    AppUtils.notify(
                        "Account created successfully!",
                        "success"
                    );

                    setTimeout(() => {
                        window.location.href =
                            "signin.html";

                    }, 1000);
                } else {
                    AppUtils.notify(
                        response.message ||
                        "Signup failed.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "SIGNUP ERROR:",
                    error
                );

                AppUtils.notify(
                    "Signup failed. Please try again.",
                    "error"
                );
            } finally {
                toggleFormLoading(
                    submitBtn,
                    false
                );
            }
        }
    );
}

// signin
if (
    elements.signinForm
) {
    elements.signinForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();
            const submitBtn =
                elements.signinForm.querySelector(
                    'button[type="submit"]'
                );

            if (
                submitBtn?.disabled
            ) {
                return;
            }
            const email =
                elements.signinEmail.value.trim();

            const password =
                elements.signinPassword.value.trim();

            if (
                !emailRegex.test(email)
            ) {
                AppUtils.notify(
                    "Enter a valid email.",
                    "error"
                );
                return;
            }

            if (
                !password
            ) {
                AppUtils.notify(
                    "Password is required.",
                    "error"
                );
                return;
            }

            toggleFormLoading(
                submitBtn,
                true,
                "Signing In..."
            );

            try {
                const response =
                    await loginUser(
                        email,
                        password
                    );

                if (
                    response.success
                ) {
                    saveAuthSession(
                        response
                    );

                    AppUtils.notify(
                        "Login successful!",
                        "success"
                    );

                    const redirect =
                        response.user?.role === "admin"
                            ? "admin.html"
                            : "index.html";

                    setTimeout(() => {
                        window.location.href =
                            redirect;
                    }, 1000);
                } else {
                    AppUtils.notify(
                        response.message ||
                        "Login failed.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "LOGIN ERROR:",
                    error
                );
                AppUtils.notify(
                    "Login failed. Please try again.",
                    "error"
                );
            } finally {
                toggleFormLoading(
                    submitBtn,
                    false
                );
            }
        }
    );
}

// auth ui
const token =
    AppUtils.getToken();

if (
    elements.authLink
) {
    if (
        token
    ) {
        elements.authLink.innerHTML =
            `<i class="fas fa-user"></i>`;
        elements.authLink.href =
            "#";

        elements.authLink.classList.add(
            "profile-active"
        );

        // open dropdown
        elements.authLink.addEventListener(
            "click",
            (event) => {
                event.preventDefault();
                elements.dropdown?.classList.toggle(
                    "active"
                );
            }
        );

        // logout
        elements.logoutBtn?.addEventListener(
            "click",
            () => {
                clearAuthSession();
                elements.dropdown?.classList.remove(
                    "active"
                );

                AppUtils.notify(
                    "Logged out successfully!",
                    "success"
                );

                setTimeout(() => {
                    window.location.href =
                        "index.html";
                }, 1000);
            }
        );

        // outside click
        document.addEventListener(
            "click",
            (event) => {
                if (
                    !event.target.closest(
                        ".profile-wrapper"
                    )
                ) {
                    elements.dropdown?.classList.remove(
                        "active"
                    );
                }
            }
        );

        // escape close
        document.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key === "Escape"
                ) {
                    elements.dropdown?.classList.remove(
                        "active"
                    );
                }
            }
        );
    } else {
        elements.authLink.innerHTML =
            "Sign In";
        elements.authLink.href =
            "signin.html";
        elements.authLink.classList.remove(
            "profile-active"
        );
        elements.dropdown?.classList.remove(
            "active"
        );
    }
}