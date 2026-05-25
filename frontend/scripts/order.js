// orders
const orders =
    AppUtils.getJSON(
        "orders",
        []
    );

// latest order
const latestOrder =
    Array.isArray(orders)
    &&
    orders.length > 0
        ? orders[
            orders.length - 1
        ]
        : null;

// redirect if no order
if (
    !latestOrder
) {
    window.location.href =
        "shop.html";
}

// elements
const elements = {

    orderItemsContainer:
        document.getElementById(
            "order-items-container"
        ),

    orderId:
        document.getElementById(
            "order-id"
        ),

    orderDate:
        document.getElementById(
            "order-date"
        ),

    statusBadge:
        document.getElementById(
            "status-badge"
        ),

    processingStep:
        document.getElementById(
            "processing-step"
        ),

    shippedStep:
        document.getElementById(
            "shipped-step"
        ),

    deliveredStep:
        document.getElementById(
            "delivered-step"
        )
};

// render order details
if (
    elements.orderId
) {
    elements.orderId.innerText =
        latestOrder.id || "N/A";
}
if (
    elements.orderDate
) {
    const formattedDate =
        latestOrder.date
            ? new Date(
                latestOrder.date
            ).toLocaleDateString()
            : "N/A";
    elements.orderDate.innerText =
        formattedDate;
}

// status
const status =
    latestOrder.status ||
    "Pending";

if (
    elements.statusBadge
) {
    elements.statusBadge.innerText =
        status;
    elements.statusBadge.className =
        "status-badge";
    elements.statusBadge.classList.add(
        status.toLowerCase()
    );
}

// timeline
if (
    [
        "Processing",
        "Shipped",
        "Delivered"
    ].includes(status)
) {
    elements.processingStep?.classList.add(
        "active-step"
    );
}
if (
    [
        "Shipped",
        "Delivered"
    ].includes(status)
) {
    elements.shippedStep?.classList.add(
        "active-step"
    );
}
if (
    status === "Delivered"
) {
    elements.deliveredStep?.classList.add(
        "active-step"
    );
}

// render items
function renderOrderItems() {
    if (
        !elements.orderItemsContainer
    ) {
        return;
    }
    elements.orderItemsContainer.innerHTML =
        "";

    const items =
        latestOrder.items || [];

    if (
        !Array.isArray(items)
        ||
        items.length === 0
    ) {
        elements.orderItemsContainer.innerHTML =
            `
                <p class="empty-order-items">
                    No items found.
                </p>
            `;
        return;
    }

    const fragment =
        document.createDocumentFragment();

    items.forEach(
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

            const total =
                qty * price;

            const div =
                document.createElement(
                    "div"
                );

            div.classList.add(
                "order-item"
            );

            div.innerHTML =
                `
                    <div class="order-item-left">
                        <img
                            src="${AppUtils.defaultImage(item.img || item.image)}"
                            alt="${item.name || "Product"}"
                            loading="lazy"
                        >
                        <div>
                            <h4>
                                ${item.name || "Product"}
                            </h4>
                            <p>
                                Quantity:
                                ${qty}
                            </p>
                        </div>
                    </div>
                    <h4>
                        ${AppUtils.formatPrice(total)}
                    </h4>
                `;
            fragment.appendChild(
                div
            );
        }
    );
    elements.orderItemsContainer.appendChild(
        fragment
    );
}

// init
document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderOrderItems();
    }
);