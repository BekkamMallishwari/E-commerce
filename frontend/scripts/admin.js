// admin auth
const user =
    AppUtils.getJSON(
        "user"
    );

const token =
    AppUtils.getToken();

// protect route
if (
    !token
    ||
    !user
    ||
    user.role !== "admin"
) {
    AppUtils.notify(
        "Admin access required",
        "error"
    );

    setTimeout(() => {
        window.location.href =
            "signin.html";
    }, 1000);

    throw new Error(
        "Unauthorized admin access"
    );
}

// elements
const elements = {
    productForm:
        document.getElementById(
            "product-form"
        ),
    productTableBody:
        document.getElementById(
            "product-table-body"
        ),
    ordersTableBody:
        document.getElementById(
            "orders-table-body"
        ),
    totalOrders:
        document.getElementById(
            "total-orders"
        ),
    totalProducts:
        document.getElementById(
            "total-products"
        ),
    totalUsers:
        document.getElementById(
            "total-users"
        ),
    totalRevenue:
        document.getElementById(
            "total-revenue"
        ),
    productName:
        document.getElementById(
            "product-name"
        ),
    productCategory:
        document.getElementById(
            "product-category"
        ),
    productPrice:
        document.getElementById(
            "product-price"
        ),
    productDescription:
        document.getElementById(
            "product-description"
        ),
    productImage:
        document.getElementById(
            "product-image"
        ),
    productStock:
        document.getElementById(
            "product-stock"
        ),
    featuredProduct:
        document.getElementById(
            "featured-product"
        )
};

// state
let products = [];
let orders = [];

// loading
function renderLoadingState() {
    if (
        elements.productTableBody
    ) {
        elements.productTableBody.innerHTML =
            `
                <tr>
                    <td colspan="6">
                        Loading products...
                    </td>
                </tr>
            `;
    }
}

// load initial data
async function loadInitialData() {
    renderLoadingState();
    try {
        const productsRes =
            await AppUtils.apiRequest(
                "/products"
            );

        if (
            productsRes.success
        ) {
            products =
                Array.isArray(
                    productsRes.products
                )
                    ? productsRes.products
                    : [];
        }

        const ordersRes =
            await AppUtils.apiRequest(
                "/orders"
            );

        if (
            ordersRes.success
        ) {
            orders =
                Array.isArray(
                    ordersRes.orders
                )
                    ? ordersRes.orders
                    : [];
        }
        renderProducts();
        renderOrders();
        renderStats();
    } catch (error) {
        console.error(
            "ADMIN LOAD ERROR:",
            error
        );
        if (
            elements.productTableBody
        ) {
            elements.productTableBody.innerHTML =
                `
                    <tr>
                        <td colspan="6">
                            Failed to load products
                        </td>
                    </tr>
                `;
        }
    }
}

// stats
function renderStats() {
    if (
        elements.totalOrders
    ) {
        elements.totalOrders.innerText =
            orders.length;
    }

    if (
        elements.totalProducts
    ) {
        elements.totalProducts.innerText =
            products.length;
    }

    if (
        elements.totalUsers
    ) {
        elements.totalUsers.innerText =
            localStorage.getItem(
                "visits"
            ) || 0;
    }

    const revenue =
        orders.reduce(
            (sum, order) => {
                return (
                    sum +
                    (
                        parseFloat(
                            order.total
                        ) || 0
                    )
                );
            },
            0
        );
    if (
        elements.totalRevenue
    ) {
        elements.totalRevenue.innerText =
            AppUtils.formatPrice(
                revenue
            );
    }
}

// validate product
function validateProduct(
    product
) {
    if (
        !product.name.trim()
        ||
        !product.category.trim()
    ) {
        AppUtils.notify(
            "Product name and category are required.",
            "error"
        );
        return false;
    }

    if (
        product.price < 0
        ||
        product.stock < 0
    ) {
        AppUtils.notify(
            "Invalid price or stock.",
            "error"
        );
        return false;
    }
    return true;
}

// product payload
function getProductPayload() {
    return {
        name:
            elements.productName.value.trim(),
        category:
            elements.productCategory.value.trim(),
        price:
            parseFloat(
                elements.productPrice.value
            ) || 0,
        description:
            elements.productDescription.value.trim(),
        image:
            elements.productImage.value.trim(),
        stock:
            parseInt(
                elements.productStock.value,
                10
            ) || 0,
        featured:
            elements.featuredProduct.checked
    };
}

// add product
if (
    elements.productForm
) {
    elements.productForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();
            const productData =
                getProductPayload();
            if (
                !validateProduct(
                    productData
                )
            ) {
                return;
            }
            try {
                const response =
                    await AppUtils.apiRequest(
                        "/products",
                        {
                            method: "POST",
                            body:
                                JSON.stringify(
                                    productData
                                )
                        }
                    );
                if (
                    response.success
                ) {
                    AppUtils.notify(
                        "Product added successfully!",
                        "success"
                    );
                    elements.productForm.reset();
                    await loadInitialData();
                } else {
                    AppUtils.notify(
                        response.message ||
                        "Failed to add product.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "ADD PRODUCT ERROR:",
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

// render products
function renderProducts() {
    if (
        !elements.productTableBody
    ) {
        return;
    }
    elements.productTableBody.innerHTML =
        "";
    if (
        !products.length
    ) {
        elements.productTableBody.innerHTML =
            `
                <tr>
                    <td colspan="6">
                        No products found
                    </td>
                </tr>
            `;
        return;
    }

    const fragment =
        document.createDocumentFragment();

    products.forEach(
        (product) => {
            if (
                !product
                ||
                !product.id
            ) {
                return;
            }

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML =
                `
                    <td>
                        ${product.name || "Product"}
                    </td>
                    <td>
                        ${product.category || "Category"}
                    </td>
                    <td>
                        ${AppUtils.formatPrice(product.price || 0)}
                    </td>
                    <td>
                        ${product.stock || 0}
                    </td>
                    <td>
                        ${
                            product.featured
                                ? "Featured"
                                : "—"
                        }
                    </td>
                    <td>
                        <button
                            type="button"
                            class="action-btn edit-btn"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            class="action-btn delete-btn"
                        >
                            Delete
                        </button>
                    </td>
                `;

            row.querySelector(
                ".edit-btn"
            )?.addEventListener(
                "click",
                () => {
                    editProduct(
                        product.id
                    );
                }
            );

            row.querySelector(
                ".delete-btn"
            )?.addEventListener(
                "click",
                () => {
                    deleteProduct(
                        product.id
                    );

                }
            );
            fragment.appendChild(
                row
            );
        }
    );
    elements.productTableBody.appendChild(
        fragment
    );
}

// delete product
async function deleteProduct(
    id
) {
    const confirmed =
        confirm(
            "Delete this product permanently?"
        );

    if (
        !confirmed
    ) {
        return;
    }
    try {
        const response =
            await AppUtils.apiRequest(
                `/products/${id}`,
                {
                    method: "DELETE"
                }
            );

        if (
            response.success
        ) {
            products =
                products.filter(
                    (product) =>
                        product.id !== id
                );

            renderProducts();
            renderStats();
            AppUtils.notify(
                "Product deleted successfully!",
                "success"
            );

        } else {
            AppUtils.notify(
                response.message ||
                "Failed to delete product.",
                "error"
            );
        }
    } catch (error) {
        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );
        AppUtils.notify(
            "Failed to delete product.",
            "error"
        );
    }
}

// edit product
async function editProduct(
    id
) {
    const product =
        products.find(
            (p) =>
                p.id === id
        );

    if (
        !product
    ) {
        return;
    }
    const newName =
        prompt(
            "Edit Product Name",
            product.name
        );

    const newPrice =
        prompt(
            "Edit Product Price",
            product.price
        );

    const newStock =
        prompt(
            "Edit Product Stock",
            product.stock
        );
    if (
        !newName?.trim()
        ||
        isNaN(newPrice)
        ||
        isNaN(newStock)
    ) {
        AppUtils.notify(
            "Invalid product details.",
            "error"
        );
        return;
    }

    const updatedData = {
        name:
            newName.trim(),
        description:
            product.description || "",
        price:
            parseFloat(
                newPrice
            ) || 0,
        image:
            product.image || "",
        category:
            product.category || "",
        stock:
            parseInt(
                newStock,
                10
            ) || 0,
        featured:
            product.featured || false
    };

    try {
        const response =
            await AppUtils.apiRequest(
                `/products/${id}`,
                {
                    method: "PUT",
                    body:
                        JSON.stringify(
                            updatedData
                        )
                }
            );
        if (
            response.success
        ) {
            Object.assign(
                product,
                updatedData
            );
            renderProducts();
            renderStats();
            AppUtils.notify(
                "Product updated successfully!",
                "success"
            );
        } else {
            AppUtils.notify(
                response.message ||
                "Failed to update product.",
                "error"
            );
        }
    } catch (error) {
        console.error(
            "EDIT PRODUCT ERROR:",
            error
        );
        AppUtils.notify(
            "Failed to update product.",
            "error"
        );
    }
}

// render orders
function renderOrders() {
    if (
        !elements.ordersTableBody
    ) {
        return;
    }

    elements.ordersTableBody.innerHTML =
        "";

    if (
        !orders.length
    ) {
        elements.ordersTableBody.innerHTML =
            `
                <tr>
                    <td colspan="3">
                        No orders found
                    </td>
                </tr>
            `;
        return;
    }

    const fragment =
        document.createDocumentFragment();

    orders.forEach(
        (order) => {
            if (
                !order
            ) {
                return;
            }

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML =
                `
                    <td>
                        ${order.id || "-"}
                    </td>
                    <td>
                        ${order.date || "-"}
                    </td>
                    <td>
                        ${AppUtils.formatPrice(order.total || 0)}
                    </td>
                `;
            fragment.appendChild(
                row
            );
        }
    );
    elements.ordersTableBody.appendChild(
        fragment
    );
}

// init
document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadInitialData();
    }
);