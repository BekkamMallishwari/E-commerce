// orders
const orders =
    AppUtils.getJSON(
        "orders",
        []
    );

// elements
const elements = {
    ordersContainer:
        AppUtils.$(
            "#orders-history-container"
        ),

    ordersCount:
        AppUtils.$(
            "#orders-history-count"
        )
};

// empty state
function renderEmptyState(
    message
) {
    if (
        elements.ordersContainer
    ) {
        elements.ordersContainer.innerHTML =
            `
                <p class="empty-orders">
                    ${message}
                </p>
            `;
    }
}

// format date
function formatOrderDate(
    date
) {
    if (
        !date
    ) {
        return "N/A";
    }

    const parsedDate =
        new Date(date);

    return isNaN(
        parsedDate.getTime()
    )
        ? "N/A"
        : parsedDate.toLocaleDateString();
}

// render count
if (
    elements.ordersCount
) {
    elements.ordersCount.innerText =
        Array.isArray(orders)
            ? orders.length
            : 0;
}

// render orders
function renderOrders() {
    if (
        !elements.ordersContainer
    ) {
        return;
    }

    elements.ordersContainer.innerHTML =
        "";

    if (
        !Array.isArray(orders)
        ||
        orders.length === 0
    ) {
        renderEmptyState(
            "No past orders found."
        );
        return;
    }

    const fragment =
        document.createDocumentFragment();

    orders.forEach(
        (order) => {
            const div =
                document.createElement(
                    "div"
                );
            div.classList.add(
                "order-history-item"
            );

            div.innerHTML =
                `
                    <h4>
                        Order ID:
                        ${order.id || "N/A"}
                    </h4>
                    <p>
                        Date:
                        ${formatOrderDate(order.date)}
                    </p>
                    <p>
                        Status:
                        <span class="order-status">
                            ${order.status || "Pending"}
                        </span>
                    </p>
                    <div class="order-items-list">
                        ${(order.items || [])
                            .map(
                                (item) => `
                                    <div class="order-item">
                                        <img
                                            src="${AppUtils.defaultImage(item.img || item.image)}"
                                            alt="${item.name || "Product"}"
                                            loading="lazy"
                                        >
                                        <div>
                                            <h5>
                                                ${item.name || "Product"}
                                            </h5>
                                            <p>
                                                Qty:
                                                ${item.qty || 1}
                                            </p>
                                            <p>
                                                ${AppUtils.formatPrice(
                                                    (
                                                        parseFloat(item.price) || 0
                                                    ) * (
                                                        item.qty || 1
                                                    )
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                `
                            )
                            .join("")}
                    </div>
                `;
            fragment.appendChild(
                div
            );
        }
    );
    elements.ordersContainer.appendChild(
        fragment
    );
}

// init
document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderOrders();
    }
);