console.log(
    "Product page loaded successfully!"
);

// PRODUCT PAGE ELEMENTS
const elements = {
    mainImage:
        document.getElementById(
            "main-product-image"
        ),

    qtyInput:
        document.getElementById(
            "product-qty"
        ),

    productCategory:
        document.getElementById(
            "product-category"
        ),

    productName:
        document.getElementById(
            "product-name"
        ),

    productPrice:
        document.getElementById(
            "product-price"
        ),

    productOriginalPrice:
        document.getElementById(
            "product-original-price"
        ),

    productDiscount:
        document.getElementById(
            "product-discount"
        ),

    productBrand:
        document.getElementById(
            "product-brand"
        ),

    productDescription:
        document.getElementById(
            "product-description"
        ),

    productStock:
        document.getElementById(
            "product-stock"
        ),

    variantStock:
        document.getElementById(
            "variant-stock"
        ),

    wishlistBtn:
        document.getElementById(
            "wishlist-btn"
        ),

    reviewForm:
        document.getElementById(
            "review-form"
        ),

    plusBtn:
        document.getElementById(
            "plus-btn"
        ),

    minusBtn:
        document.getElementById(
            "minus-btn"
        ),

    addToCartBtn:
        document.getElementById(
            "add-to-cart-btn"
        ),

    buyNowBtn:
        document.getElementById(
            "buy-now-btn"
        )
};

// PRODUCT STATE
let currentProductData =
    null;

// PRODUCT ID
const urlParams =
    new URLSearchParams(
        window.location.search
    );

const productId =
    parseInt(
        urlParams.get("id"),
        10
    );

// invalid id fallback
if (
    Number.isNaN(productId)
    ||
    productId <= 0
) {
    window.location.href =
        "shop.html";
}

// FALLBACK PRODUCT
function getFallbackProduct() {
    return {
        id: 1,
        brand:
            "AnthropicBots",
        name:
            "Modern Fashion T-Shirt",
        category:
            "T-Shirt",
        price: 999,
        image:
            "assets/images/f1.png",
        description:
            "Premium quality cotton t-shirt with breathable fabric and modern fashion styling.",
        stock: 12,
        rating: 4.5,
        discount_percent: 10
    };
}

// LOADING STATE
function showLoadingState() {
    document.body.classList.add(
        "loading"
    );
}

function hideLoadingState() {
    document.body.classList.remove(
        "loading"
    );
}

// FETCH PRODUCT
async function fetchProduct() {
    showLoadingState();
    try {
        const response =
            await AppUtils.apiRequest(
                `/products/${productId}`
            );
        if (
            response.success
            &&
            response.product
        ) {

            currentProductData =
                response.product;

            sessionStorage.setItem(
                `product-${productId}`,
                JSON.stringify(
                    response.product
                )
            );
        } else {
            currentProductData =
                getFallbackProduct();
        }

    } catch (error) {
        console.error(
            "PRODUCT FETCH ERROR:",
            error
        );

        const cached =
            sessionStorage.getItem(
                `product-${productId}`
            );

        currentProductData =
            cached
                ? JSON.parse(
                    cached
                )
                : getFallbackProduct();
    }
    initializeProductPage();
    hideLoadingState();
}

// INITIALIZE PAGE
function initializeProductPage() {
    const product =
        currentProductData;

    if (!product) {
        return;
    }

    // render product
    if (
        typeof renderProduct ===
        "function"
    ) {
        renderProduct(
            product
        );
    }

    // setup variants
    if (
        typeof setupVariants ===
        "function"
    ) {
        setupVariants(
            product
        );
    }

    // setup actions
    if (
        typeof setCurrentProduct ===
        "function"
    ) {
        setCurrentProduct(
            product
        );
    }

    // load reviews
    if (
        typeof loadProductReviews ===
        "function"
    ) {
        loadProductReviews(
            product.id
        );
    }

    // related products
    if (
        typeof loadRelatedProducts ===
        "function"
    ) {
        loadRelatedProducts(
            product
        );
    }

    // recommendations
    if (
        typeof loadRecentlyViewedRecommendations ===
        "function"
    ) {
        loadRecentlyViewedRecommendations();
    }
    initializeImageZoom();
}

// IMAGE ZOOM
function initializeImageZoom() {
    if (!elements.mainImage) {
        return;
    }

    elements.mainImage.style.transition =
        "0.3s ease";

    elements.mainImage.addEventListener(
        "mouseenter",
        () => {
            elements.mainImage.style.transform =
                "scale(1.05)";
        }
    );

    elements.mainImage.addEventListener(
        "mouseleave",
        () => {
            elements.mainImage.style.transform =
                "scale(1)";
        }
    );
}

// KEYBOARD ACCESSIBILITY
document.addEventListener(
    "keydown",
    (event) => {
        const activeTag =
            document.activeElement
                ?.tagName;

        if (
            ["INPUT", "TEXTAREA"]
                .includes(
                    activeTag
                )
        ) {
            return;
        }

        if (
            event.key === "+"
            &&
            elements.plusBtn
        ) {
            elements.plusBtn.click();

        }

        if (
            event.key === "-"
            &&
            elements.minusBtn
        ) {
            elements.minusBtn.click();
        }
    }
);

// INIT
document.addEventListener(
    "DOMContentLoaded",
    () => {
        fetchProduct();
        if (
            typeof updateCartCount ===
            "function"
        ) {
            updateCartCount();
        }
    }
);