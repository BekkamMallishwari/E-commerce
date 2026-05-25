// GLOBAL STATE
let allProducts = [];

// FETCH PRODUCTS
async function fetchAllProducts() {
    try {
        const data =
            await AppUtils.apiRequest(
                "/products"
            );

        if (data.success) {
            allProducts =
                Array.isArray(
                    data.products
                )
                    ? data.products
                    : [];

            window.allProducts =
                allProducts;

            renderProducts(
                allProducts
            );
        }
    } catch (error) {
        console.error(
            "PRODUCT FETCH ERROR:",
            error
        );
        renderProducts([]);
    }
}

fetchAllProducts();

// RENDER PRODUCTS
function renderProducts(
    products = []
) {
    const container =
        document.getElementById(
            "products-container"
        );

    if (!container) {
        return;
    }

    // empty state
    if (!products.length) {
        container.innerHTML = `
            <p class="empty-products">
                No products available.
            </p>
        `;
        return;
    }

    container.innerHTML = "";

    const fragment =
        document.createDocumentFragment();

    products.forEach(
        (product, index) => {
            const card =
                document.createElement(
                    "div"
                );

            card.innerHTML =
                createProductCard(
                    product
                );

            const productElement =
                card.firstElementChild;

            if (productElement) {
                fragment.appendChild(
                    productElement
                );
            }
        }
    );
    container.appendChild(
        fragment
    );
    initializeProductCardFeatures();
}

// PRODUCT CARD FEATURES
function initializeProductCardFeatures() {
    const productCards =
        document.querySelectorAll(
            ".pro"
        );

    // QUICK VIEW MODAL
    productCards.forEach(
        (card) => {
            const img =
                card.querySelector(
                    "img"
                );

            if (!img) {
                return;
            }

            img.addEventListener(
                "click",
                () => {
                    const modal =
                        document.createElement(
                            "div"
                        );

                    modal.style.cssText = `
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        padding: 20px;
                    `;

                    modal.setAttribute(
                        "role",
                        "dialog"
                    );

                    modal.setAttribute(
                        "aria-modal",
                        "true"
                    );

                    const box =
                        document.createElement(
                            "div"
                        );

                    box.style.cssText = `
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        max-width: 420px;
                        width: 100%;
                        text-align: center;
                    `;

                    const big =
                        document.createElement(
                            "img"
                        );

                    big.src =
                        img.src;

                    big.alt =
                        img.alt || "Product Image";

                    big.style.cssText = `
                        width: 100%;
                        max-height: 450px;
                        object-fit: contain;
                    `;

                    box.appendChild(
                        big
                    );

                    modal.appendChild(
                        box
                    );

                    document.body.appendChild(
                        modal
                    );
                    document.body.style.overflow =
                        "hidden";

                    function closeModal() {
                        document.body.style.overflow =
                            "";

                        modal.remove();
                        document.removeEventListener(
                            "keydown",
                            handleEscape
                        );
                    }

                    function handleEscape(
                        event
                    ) {
                        if (
                            event.key ===
                            "Escape"
                        ) {
                            closeModal();
                        }
                    }

                    modal.addEventListener(
                        "click",
                        (event) => {
                            if (
                                event.target === modal
                            ) {
                                closeModal();
                            }
                        }
                    );
                    document.addEventListener(
                        "keydown",
                        handleEscape
                    );
                }
            );
        }
    );

    // SCROLL ANIMATION
    const observer =
        new IntersectionObserver(
            (entries) => {
                entries.forEach(
                    (entry) => {
                        if (
                            entry.isIntersecting
                        ) {
                            entry.target.style.transform =
                                "translateY(0)";

                            entry.target.style.opacity =
                                "1";

                        }
                    }
                );
            },
            {
                threshold: 0.1
            }
        );

    document
        .querySelectorAll(
            ".pro, .fe-box, .banner-box"
        )
        .forEach((element) => {
            element.style.transform =
                "translateY(40px)";

            element.style.opacity =
                "0";

            element.style.transition =
                "0.6s ease";

            observer.observe(
                element
            );

            element.addEventListener(
                "transitionend",
                () => {

                    observer.unobserve(
                        element
                    );

                },
                {
                    once: true
                }
            );
        });

    // RECENTLY VIEWED
    let viewed =
        AppUtils.getJSON(
            "viewed",
            []
        );

    productCards.forEach(
        (card) => {
            card.addEventListener(
                "click",
                () => {
                    const product = {
                        name:
                            card.querySelector(
                                "h5"
                            )?.innerText,

                        image:
                            card.querySelector(
                                "img"
                            )?.src,

                        brand:
                            card.querySelector(
                                ".des span"
                            )?.innerText,

                        price:
                            card.querySelector(
                                "h4"
                            )?.innerText

                    };

                    viewed.unshift(
                        product
                    );

                    viewed = [
                        ...new Map(
                            viewed.map(
                                (p) => [
                                    p.image ||
                                    p.name,
                                    p
                                ]
                            )
                        ).values()
                    ].slice(0, 5);

                    AppUtils.setJSON(
                        "viewed",
                        viewed
                    );
                }
            );
        }
    );

    // DELIVERY DATE
    function deliveryDate() {
        const date =
            new Date();

        date.setDate(
            date.getDate() +
            Math.floor(
                Math.random() * 5 + 3
            )
        );
        return date.toDateString();
    }

    productCards.forEach(
        (card) => {
            const delivery =
                document.createElement(
                    "p"
                );

            delivery.style.fontSize =
                "11px";

            delivery.style.color =
                "#666";

            delivery.innerText =
                "Delivery by: " +
                deliveryDate();

            card.appendChild(
                delivery
            );
        }
    );

    // PRODUCT LABELS
    productCards.forEach(
        (card, index) => {
            if (index < 2) {
                const tag =
                    document.createElement(
                        "span"
                    );

                tag.innerText =
                    "NEW";

                tag.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: red;
                    color: white;
                    padding: 3px 6px;
                    font-size: 10px;
                    border-radius: 4px;
                    z-index: 2;
                `;

                card.appendChild(
                    tag
                );
            }
        }
    );

    // IMAGE HOVER
    productCards.forEach(
        (card) => {
            const img =
                card.querySelector(
                    "img"
                );

            if (!img) {
                return;
            }

            img.style.transition =
                "0.3s ease";

            img.addEventListener(
                "mouseenter",
                () => {

                    img.style.transform =
                        "scale(1.05)";
                }
            );

            img.addEventListener(
                "mouseleave",
                () => {
                    img.style.transform =
                        "scale(1)";

                }
            );

        }
    );

}