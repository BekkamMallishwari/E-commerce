// CART STATE
let cart =
    AppUtils.getCart();

// CART PAGE ELEMENTS
const elements = {
    cartContainer:
        document.getElementById(
            "cart-items"
        ),

    subtotalElement:
        document.getElementById(
            "subtotal"
        ),

    taxElement:
        document.getElementById(
            "tax"
        ),

    totalElement:
        document.getElementById(
            "total"
        ),

    shippingElement:
        document.getElementById(
            "shipping"
        ),

    checkoutBtn:
        document.getElementById(
            "checkout-btn"
        )
};

// SAVE CART
function saveCart() {
    AppUtils.saveCart(
        cart
    );
}

// EMPTY CART
function renderEmptyCart() {
    if (
        !elements.cartContainer
    ) {
        return;
    }
    elements.cartContainer.innerHTML =
        `
            <div class="empty-cart">
                <h2>
                    Your cart is empty
                </h2>
                <p>
                    Add products to continue shopping.
                </p>
                <a
                    href="shop.html"
                    class="continue-shopping-btn"
                >
                    Continue Shopping
                </a>
            </div>
        `;

    updateCartTotals(
        0
    );
}

// UPDATE TOTALS
function updateCartTotals(
    subtotal
) {
    const safeSubtotal =
        Number(subtotal) || 0;

    const tax =
        safeSubtotal * 0.18;

    const shipping =
        safeSubtotal > 0 &&
        safeSubtotal < 999
            ? 49
            : 0;

    const total =
        safeSubtotal +
        tax +
        shipping;

    AppUtils.setJSON(
        "shippingCost",
        shipping
    );

    if (
        elements.subtotalElement
    ) {
        elements.subtotalElement.innerText =
            AppUtils.formatPrice(
                safeSubtotal
            );
    }

    if (
        elements.taxElement
    ) {
        elements.taxElement.innerText =
            AppUtils.formatPrice(
                tax
            );
    }

    if (
        elements.shippingElement
    ) {
        elements.shippingElement.innerText =
            shipping === 0
                ? "Free"
                : AppUtils.formatPrice(
                    shipping
                );
    }

    if (
        elements.totalElement
    ) {
        elements.totalElement.innerText =
            AppUtils.formatPrice(
                total
            );
    }
}

// RENDER CART
function renderCart() {
    if (
        !elements.cartContainer
    ) {
        return;
    }
    if (
        !Array.isArray(cart)
        ||
        cart.length === 0
    ) {
        renderEmptyCart();
        return;
    }

    elements.cartContainer.innerHTML =
        "";

    const fragment =
        document.createDocumentFragment();

    let subtotal = 0;
    cart.forEach(
        (item, index) => {
            const price =
                parseFloat(
                    item.price
                ) || 0;

            const qty =
                parseInt(
                    item.qty,
                    10
                ) || 1;

            subtotal +=
                price * qty;

            const cartItem =
                document.createElement(
                    "div"
                );

            cartItem.classList.add(
                "cart-item"
            );

            cartItem.innerHTML =
                `
                    <img
                        src="${AppUtils.defaultImage(item.img || item.image)}"
                        alt="${item.name}"
                        loading="lazy"
                    >
                    <div class="cart-item-info">
                        <h3>
                            ${item.name}
                        </h3>
                        <p>
                            Price:
                            ${AppUtils.formatPrice(price)}
                        </p>
                        ${
                            item.color
                                ? `
                                    <p>
                                        Color:
                                        ${item.color}
                                    </p>
                                `
                                : ""
                        }
                        ${
                            item.size
                                ? `
                                    <p>
                                        Size:
                                        ${item.size}
                                    </p>
                                `
                                : ""
                        }

                        <div class="cart-qty-controls">
                            <button
                                data-index="${index}"
                                class="decrease-qty"
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                            <span>
                                ${qty}
                            </span>
                            <button
                                data-index="${index}"
                                class="increase-qty"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div class="cart-item-actions">
                        <button
                            class="move-wishlist-btn"
                            data-index="${index}"
                        >
                            Move to Wishlist
                        </button>

                        <button
                            class="remove-btn"
                            data-index="${index}"
                        >
                            Remove
                        </button>
                    </div>
                `;

            fragment.appendChild(
                cartItem
            );
        }
    );

    elements.cartContainer.appendChild(
        fragment
    );

    updateCartTotals(
        subtotal
    );
    attachCartEventListeners();
}

// CART EVENTS
function attachCartEventListeners() {
    // increase qty
    document
        .querySelectorAll(
            ".increase-qty"
        )
        .forEach((btn) => {
            btn.addEventListener(
                "click",
                (event) => {
                    const index =
                        parseInt(
                            event.target.dataset.index,
                            10
                        );

                    if (
                        !cart[index]
                    ) {
                        return;
                    }
                    cart[index].qty += 1;
                    saveCart();
                    renderCart();
                }
            );
        });

    // decrease qty
    document
        .querySelectorAll(
            ".decrease-qty"
        )
        .forEach((btn) => {
            btn.addEventListener(
                "click",
                (event) => {
                    const index =
                        parseInt(
                            event.target.dataset.index,
                            10
                        );

                    if (
                        !cart[index]
                    ) {
                        return;
                    }

                    if (
                        cart[index].qty > 1
                    ) {
                        cart[index].qty -= 1;

                    } else {
                        cart.splice(
                            index,
                            1
                        );
                    }
                    saveCart();
                    renderCart();
                }
            );
        });

    // remove item
    document
        .querySelectorAll(
            ".remove-btn"
        )
        .forEach((btn) => {
            btn.addEventListener(
                "click",
                (event) => {
                    const index =
                        parseInt(
                            event.target.dataset.index,
                            10
                        );

                    if (
                        !cart[index]
                    ) {
                        return;
                    }

                    cart.splice(
                        index,
                        1
                    );
                    saveCart();
                    renderCart();
                    AppUtils.notify(
                        "Item removed 🗑️",
                        "success"
                    );
                }
            );
        });

    // move to wishlist
    document
        .querySelectorAll(
            ".move-wishlist-btn"
        )
        .forEach((btn) => {
            btn.addEventListener(
                "click",
                (event) => {
                    const index =
                        parseInt(
                            event.target.dataset.index,
                            10
                        );

                    if (
                        !cart[index]
                    ) {
                        return;
                    }

                    const wishlist =
                        AppUtils.getWishlist();

                    const exists =
                        wishlist.find(
                            (item) =>
                                item.id ===
                                cart[index].id
                                &&
                                item.color ===
                                cart[index].color
                                &&
                                item.size ===
                                cart[index].size
                        );

                    if (
                        !exists
                    ) {
                        wishlist.push(
                            cart[index]
                        );
                    }

                    AppUtils.saveWishlist(
                        wishlist
                    );

                    cart.splice(
                        index,
                        1
                    );
                    saveCart();
                    renderCart();
                    AppUtils.notify(
                        "Moved to wishlist ❤️",
                        "success"
                    );
                }
            );
        });
}

// ADD TO CART
async function addToCartFromProduct(
    product
) {
    const item = {
        id:
            product.id,
        name:
            product.name,
        price:
            parseFloat(
                product.price
            ) || 0,
        img:
            product.img ||
            product.image,
        color:
            product.color || null,
        size:
            product.size || null,
        qty:
            parseInt(
                product.qty,
                10
            ) || 1
    };

    // duplicate check
    const existingIndex =
        cart.findIndex(
            (p) =>
                p.id === item.id
                &&
                p.color === item.color
                &&
                p.size === item.size
        );

    if (
        existingIndex >= 0
    ) {
        cart[
            existingIndex
        ].qty += item.qty;
    } else {
        cart.push(
            item
        );
    }

    saveCart();

    AppUtils.notify(
        "Added to cart 🛍️",
        "success"
    );

    // backend sync
    const token =
        AppUtils.getToken();

    if (
        token
    ) {
        try {
            const data =
                await AppUtils.apiRequest(
                    "/cart/add",
                    {
                        method: "POST",
                        body:
                            JSON.stringify(
                                item
                            )
                    }
                );
            if (
                !data.success
            ) {
                console.warn(
                    "Backend cart sync failed"
                );
            }
        } catch (error) {
            console.error(
                "BACKEND CART ERROR:",
                error
            );
        }
    }

    if (
        elements.cartContainer
    ) {
        renderCart();
    }
}

// CHECKOUT BUTTON
if (
    elements.checkoutBtn
) {
    elements.checkoutBtn.addEventListener(
        "click",
        () => {
            if (
                !cart.length
            ) {
                AppUtils.notify(
                    "Your cart is empty.",
                    "warning"
                );
                return;
            }
            window.location.href =
                "checkout.html";
        }
    );
}

// INIT
document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderCart();
    }
);