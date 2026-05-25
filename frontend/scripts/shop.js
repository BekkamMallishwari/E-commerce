// PRODUCTS STATE
let allProducts = [];
let filteredProducts = [];

// SHOP PAGE ELEMENTS
const elements = {
    searchInput:
        document.getElementById(
            "search-input"
        ),

    filterButtons:
        document.querySelectorAll(
            ".filter-btn"
        ),

    sortSelect:
        document.getElementById(
            "sort-select"
        ),

    productContainer:
        document.getElementById(
            "product-container"
        )
};

// FETCH PRODUCTS
async function fetchProducts() {
    try {
        if (
            elements.productContainer
        ) {
            elements.productContainer.innerHTML =
                `
                    <h3 class="loading-products">
                        Loading products...
                    </h3>
                `;
        }

        const data =
            await AppUtils.apiRequest(
                "/products"
            );

        if (
            data.success
        ) {
            allProducts =
                Array.isArray(
                    data.products
                )
                    ? data.products
                    : [];

            filteredProducts =
                [...allProducts];

            renderProducts(
                filteredProducts
            );
        } else {
            renderEmptyState(
                data.message ||
                "No products available."
            );
        }
    } catch (error) {
        console.error(
            "SHOP FETCH ERROR:",
            error
        );
        renderEmptyState(
            "Failed to load products."
        );
    }
}

// EMPTY STATE
function renderEmptyState(
    message
) {
    if (
        !elements.productContainer
    ) {
        return;
    }
    elements.productContainer.innerHTML =
        `
            <div class="empty-products">
                <h3>${message}</h3>
            </div>
        `;
}

// STAR RATINGS
function renderStars(
    rating = 5
) {
    const safeRating =
        Math.min(
            Math.max(
                Number(rating) || 5,
                1
            ),
            5
        );

    return Array.from(
        {
            length: safeRating
        },
        () =>
            `
                <i class="fas fa-star"></i>
            `
    ).join("");
}

// PRODUCT CARD
function createProductCard(
    product
) {
    const displayName =
        product.name ||
        "Product";

    const stock =
        Number(product.stock) || 0;

    return `
        <div
            class="pro"
            data-product-id="${product.id}"
        >
            <img
                src="${AppUtils.defaultImage(product.image)}"
                alt="${displayName}"
                loading="lazy"
            >

            <div class="des">
                <span>
                    ${product.category || "Brand"}
                </span>
                <h5>
                    ${displayName}
                </h5>
                <div class="star">
                    ${renderStars(
                        product.rating
                    )}
                </div>
                <h4>
                    ${AppUtils.formatPrice(
                        product.price
                    )}
                </h4>
                <p class="stock-info">
                    ${
                        stock > 0
                            ? `Stock: ${stock}`
                            : "Out Of Stock"
                    }
                </p>
            </div>

            ${
                stock <= 0
                    ? `
                        <button
                            class="out-stock-btn"
                            disabled
                        >
                            Out Of Stock
                        </button>
                    `
                    : `
                        <button
                            class="add-to-cart-icon"
                            aria-label="Add to cart"
                        >
                            <i class="fal fa-shopping-cart cart"></i>
                        </button>
                    `
            }
        </div>
    `;
}

// RENDER PRODUCTS
function renderProducts(
    products = []
) {
    if (
        !elements.productContainer
    ) {
        return;
    }

    if (
        !Array.isArray(products)
        ||
        products.length === 0
    ) {
        renderEmptyState(
            "No products found."
        );
        return;
    }

    elements.productContainer.innerHTML =
        "";

    const fragment =
        document.createDocumentFragment();

    products.forEach(
        (product) => {
            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.innerHTML =
                createProductCard(
                    product
                );

            const card =
                wrapper.firstElementChild;

            if (card) {
                setupProductCard(
                    card,
                    product
                );

                fragment.appendChild(
                    card
                );
            }
        }
    );
    elements.productContainer.appendChild(
        fragment
    );
}

// PRODUCT CARD EVENTS
function setupProductCard(
    card,
    product
) {
    // navigate to product page
    card.addEventListener(
        "click",
        (event) => {
            if (
                event.target.closest(
                    ".add-to-cart-icon"
                )
            ) {
                return;
            }
            window.location.href =
                `product.html?id=${product.id}`;
        }
    );

    // add to cart
    const cartBtn =
        card.querySelector(
            ".add-to-cart-icon"
        );

    if (!cartBtn) {
        return;
    }
    cartBtn.addEventListener(
        "click",
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const item = {
                id: product.id,
                name:
                    product.name ||
                    "Product",
                price:
                    parseFloat(
                        product.price
                    ) || 0,
                img:
                    AppUtils.defaultImage(
                        product.image
                    ),
                qty: 1
            };

            try {
                // centralized handler
                if (
                    typeof addToCartFromProduct ===
                    "function"
                ) {
                    await addToCartFromProduct(
                        item
                    );
                    return;
                }

                // fallback cart
                let cart =
                    AppUtils.getCart();

                const existingIndex =
                    cart.findIndex(
                        (p) =>
                            p.id ===
                            item.id
                    );

                if (
                    existingIndex >= 0
                ) {
                    cart[
                        existingIndex
                    ].qty += 1;
                } else {
                    cart.push(
                        item
                    );
                }

                AppUtils.saveCart(
                    cart
                );

                AppUtils.notify(
                    "Added to cart 🛍️",
                    "success"
                );

            } catch (error) {
                console.error(
                    "CART ERROR:",
                    error
                );

                AppUtils.notify(
                    "Failed to add product.",
                    "error"
                );
            }
        }
    );
}

// SEARCH FILTER
function setupSearch() {
    if (
        !elements.searchInput
    ) {
        return;
    }
    elements.searchInput.addEventListener(
        "input",
        () => {
            const value =
                elements.searchInput.value
                    .trim()
                    .toLowerCase();

            filteredProducts =
                allProducts.filter(
                    (product) =>
                        (
                            product.name ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            )
                );
            applySorting();
        }
    );
}

// CATEGORY FILTER
function setupCategoryFilters() {
    elements.filterButtons.forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    elements.filterButtons.forEach(
                        (btn) =>
                            btn.classList.remove(
                                "active-filter"
                            )
                    );

                    button.classList.add(
                        "active-filter"
                    );

                    const category =
                        button.dataset.category;

                    if (
                        category ===
                        "all"
                    ) {
                        filteredProducts =
                            [...allProducts];

                    } else {
                        filteredProducts =
                            allProducts.filter(
                                (product) =>
                                    (
                                        product.category ||
                                        ""
                                    )
                                        .toLowerCase() ===
                                    category
                            );
                    }
                    applySorting();
                }
            );
        }
    );
}

// SORTING
function applySorting() {
    let sortedProducts =
        [...filteredProducts];

    if (
        !elements.sortSelect
    ) {
        renderProducts(
            sortedProducts
        );
        return;
    }

    const sortValue =
        elements.sortSelect.value;

    if (
        sortValue ===
        "low-high"
    ) {
        sortedProducts.sort(
            (a, b) =>
                (
                    parseFloat(
                        a.price
                    ) || 0
                ) -
                (
                    parseFloat(
                        b.price
                    ) || 0
                )
        );
    }

    if (
        sortValue ===
        "high-low"
    ) {
        sortedProducts.sort(
            (a, b) =>
                (
                    parseFloat(
                        b.price
                    ) || 0
                ) -
                (
                    parseFloat(
                        a.price
                    ) || 0
                )
        );
    }
    renderProducts(
        sortedProducts
    );
}

// SORT SELECT
function setupSorting() {
    if (
        !elements.sortSelect
    ) {
        return;
    }
    elements.sortSelect.addEventListener(
        "change",
        applySorting
    );
}

// INITIALIZATION
document.addEventListener(
    "DOMContentLoaded",
    () => {
        fetchProducts();
        setupSearch();
        setupCategoryFilters();
        setupSorting();
    }
);