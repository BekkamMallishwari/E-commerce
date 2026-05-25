// CART STATE
const cart =
    AppUtils.getCart();

// EMPTY CART REDIRECT
if (
    !Array.isArray(cart)
    ||
    cart.length === 0
) {
    AppUtils.notify(
        "Your cart is empty!",
        "error"
    );

    setTimeout(() => {
        window.location.href =
            "cart.html";
    }, 1000);
}

// CHECKOUT ELEMENTS
const elements = {
    checkoutItems:
        document.getElementById(
            "checkout-items"
        ),

    subtotal:
        document.getElementById(
            "checkout-subtotal"
        ),

    tax:
        document.getElementById(
            "checkout-tax"
        ),

    shipping:
        document.getElementById(
            "checkout-shipping"
        ),

    total:
        document.getElementById(
            "checkout-total"
        ),

    cardDetails:
        document.getElementById(
            "card-details"
        ),

    checkoutForm:
        document.getElementById(
            "checkout-form"
        ),

    paymentMethods:
        document.querySelectorAll(
            'input[name="payment"]'
        ),

    fullName:
        document.getElementById(
            "full-name"
        ),

    email:
        document.getElementById(
            "email"
        ),

    phone:
        document.getElementById(
            "phone"
        ),

    city:
        document.getElementById(
            "city"
        ),

    state:
        document.getElementById(
            "state"
        ),

    zip:
        document.getElementById(
            "zip"
        ),

    address:
        document.getElementById(
            "address"
        ),

    placeOrderBtn:
        document.querySelector(
            '#checkout-form button[type="submit"]'
        )
};

// RENDER CHECKOUT
function renderCheckout() {
    if (
        !elements.checkoutItems
    ) {
        return;
    }

    elements.checkoutItems.innerHTML =
        "";

    const fragment =
        document.createDocumentFragment();

    let subtotal = 0;
    cart.forEach(
        (item) => {
            const qty =
                parseInt(
                    item.qty,
                    10
                ) || 1;

            const price =
                parseFloat(
                    item.price
                ) || 0;

            const itemTotal =
                qty * price;

            subtotal +=
                itemTotal;

            const div =
                document.createElement(
                    "div"
                );

            div.classList.add(
                "checkout-item"
            );

            div.innerHTML =
                `
                    <div class="checkout-item-info">
                        <span>
                            ${item.name}
                        </span>
                        <small>
                            Qty: ${qty}
                        </small>
                    </div>
                    <span>
                        ${AppUtils.formatPrice(itemTotal)}
                    </span>
                `;
            fragment.appendChild(
                div
            );
        }
    );

    elements.checkoutItems.appendChild(
        fragment
    );

    // totals
    const tax =
        subtotal * 0.18;

    const shipping =
        subtotal > 0 &&
        subtotal < 999
            ? 49
            : 0;

    const total =
        subtotal +
        tax +
        shipping;

    if (
        elements.subtotal
    ) {
        elements.subtotal.innerText =
            AppUtils.formatPrice(
                subtotal
            );
    }

    if (
        elements.tax
    ) {
        elements.tax.innerText =
            AppUtils.formatPrice(
                tax
            );
    }

    if (
        elements.shipping
    ) {
        elements.shipping.innerText =
            shipping === 0
                ? "Free"
                : AppUtils.formatPrice(
                    shipping
                );
    }

    if (
        elements.total
    ) {
        elements.total.innerText =
            AppUtils.formatPrice(
                total
            );
    }
}

renderCheckout();

// PAYMENT METHOD TOGGLE
elements.paymentMethods.forEach(
    (method) => {
        method.addEventListener(
            "change",
            () => {
                if (
                    !elements.cardDetails
                ) {
                    return;
                }
                elements.cardDetails.style.display =
                    method.value ===
                    "Card"
                        ? "block"
                        : "none";
            }
        );
    }
);

// VALIDATION
function validateCheckoutForm() {
    if (
        !elements.fullName.value.trim()
        ||
        !elements.email.value.trim()
        ||
        !elements.phone.value.trim()
        ||
        !elements.city.value.trim()
        ||
        !elements.state.value.trim()
        ||
        !elements.zip.value.trim()
        ||
        !elements.address.value.trim()
    ) {
        AppUtils.notify(
            "Please fill all required fields.",
            "error"
        );
        return false;
    }

    // email validation
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailRegex.test(
            elements.email.value.trim()
        )
    ) {
        AppUtils.notify(
            "Enter a valid email address.",
            "error"
        );
        return false;
    }

    // phone validation
    const phoneRegex =
        /^[6-9]\d{9}$/;

    if (
        !phoneRegex.test(
            elements.phone.value.trim()
        )
    ) {
        AppUtils.notify(
            "Enter a valid 10-digit phone number.",
            "error"
        );
        return false;
    }

    // zip validation
    const zipRegex =
        /^\d{5,6}$/;

    if (
        !zipRegex.test(
            elements.zip.value.trim()
        )
    ) {
        AppUtils.notify(
            "Enter a valid ZIP / PIN code.",
            "error"
        );
        return false;
    }

    // payment method
    const selectedPayment =
        document.querySelector(
            'input[name="payment"]:checked'
        );
    if (
        !selectedPayment
    ) {
        AppUtils.notify(
            "Select a payment method.",
            "error"
        );
        return false;
    }
    return true;
}

// CREATE ORDER PAYLOAD
function createOrderPayload() {
    const selectedPayment =
        document.querySelector(
            'input[name="payment"]:checked'
        );

    const total =
        parseFloat(
            elements.total.innerText.replace(
                /[^\d.]/g,
                ""
            )
        ) || 0;
    return {
        customer: {
            name:
                elements.fullName.value.trim(),
            email:
                elements.email.value.trim(),
            phone:
                elements.phone.value.trim()
        },

        address: {
            city:
                elements.city.value.trim(),
            state:
                elements.state.value.trim(),
            zip:
                elements.zip.value.trim(),
            fullAddress:
                elements.address.value.trim()
        },
        paymentMethod:
            selectedPayment.value,
        items:
            cart,
        total
    };
}

// PLACE ORDER
let isSubmitting =
    false;

if (
    elements.checkoutForm
) {
    elements.checkoutForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();
            if (
                isSubmitting
            ) {
                return;
            }

            if (
                !validateCheckoutForm()
            ) {
                return;
            }

            isSubmitting =
                true;

            // loading button
            if (
                elements.placeOrderBtn
            ) {
                elements.placeOrderBtn.disabled =
                    true;
                elements.placeOrderBtn.innerText =
                    "Processing...";
            }

            const order =
                createOrderPayload();

            try {
                const data =
                    await AppUtils.apiRequest(
                        "/orders",
                        {
                            method: "POST",
                            body:
                                JSON.stringify(
                                    order
                                )
                        }
                    );
                if (
                    data.success
                ) {
                    AppUtils.notify(
                        "Order placed successfully! 🎉",
                        "success"
                    );

                    // clear cart
                    AppUtils.saveCart(
                        []
                    );

                    // store order
                    if (
                        data.order
                    ) {
                        AppUtils.setJSON(
                            "lastOrder",
                            data.order
                        );
                    }

                    // redirect
                    setTimeout(() => {
                        window.location.href =
                            "success.html";
                    }, 1200);

                } else {
                    AppUtils.notify(
                        data.message ||
                        "Failed to place order.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "ORDER ERROR:",
                    error
                );

                AppUtils.notify(
                    "Failed to place order.",
                    "error"
                );

            } finally {
                isSubmitting =
                    false;

                if (
                    elements.placeOrderBtn
                ) {
                    elements.placeOrderBtn.disabled =
                        false;

                    elements.placeOrderBtn.innerText =
                        "Place Order";
                }
            }
        }
    );
}