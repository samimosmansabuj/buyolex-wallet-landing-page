// ================= GLOBAL STATE =================
let PRODUCT = {
    id: null,
    price: 0,
    discount_price: 0,
    title: "",
    loaded: false
};

// ================= LANDING CODE =================
function getLandingCode() {
    const urlParams = new URLSearchParams(window.location.search);
    // return urlParams.get("code");
    return 1010;
}

// ================= PHONE VALIDATION =================
function isValidBDPhone(phone) {
    phone = phone.replace(/\s+/g, "");
    return (
        (phone.startsWith("+8801") && phone.length === 14) ||
        (phone.startsWith("8801") && phone.length === 13) ||
        (phone.startsWith("01") && phone.length === 11)
    );
}

// ================= NORMALIZE PHONE =================
function normalizePhone(phone) {
    phone = phone.replace(/\s+/g, "");
    if (phone.startsWith("+880")) return phone.replace("+880", "0");
    if (phone.startsWith("880")) return phone.replace("880", "0");
    return phone;
}

// ================= MODAL =================
function openModal() {
    document.getElementById("orderModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("orderModal").classList.add("hidden");
}

// ================= DISTRICT LOAD =================
function loadDistricts() {
    const districtSelect = document.getElementById("city");
    districtSelect.innerHTML = `<option value="">জেলা সিলেক্ট করুন</option>`;
    fetch("https://bdapi.vercel.app/api/v.1/district")
        .then(res => res.json())
        .then(data => {
            if (data.status === 200 && data.success) {
                data.data.forEach(district => {
                    const option = document.createElement("option");

                    // 🔥 safer value
                    option.value = district.name.toLowerCase().replace(" district", "").trim();

                    option.textContent = district.bn_name;
                    districtSelect.appendChild(option);
                });
            }
        });
}

// ================= DELIVERY =================
function getDeliveryCharge(district) {
    if (!district) return 0;
    district = district.toLowerCase().replace(" district", "").trim();
    return district === "dhaka" ? 80 : 120;
}

// ================= QTY =================
function changeQty(val) {
    let qtyInput = document.getElementById("qty");
    let newQty = parseInt(qtyInput.value) + val;
    if (newQty >= 1) {
        qtyInput.value = newQty;
        calculateTotal();
    }
}

// ================= CALCULATION =================
function calculateTotal() {
    if (!PRODUCT.loaded) return;

    let qty = parseInt(document.getElementById("qty").value) || 1;
    let district = document.getElementById("city").value;

    let delivery = getDeliveryCharge(district);

    const price =
        PRODUCT.discount_price && PRODUCT.discount_price > 0
            ? PRODUCT.discount_price
            : PRODUCT.price;

    let productTotal = qty * price;
    let grandTotal = productTotal + delivery;

    document.getElementById("sumQty").innerText = qty;
    document.getElementById("prodTotal").innerText = productTotal + "৳";
    document.getElementById("delCharge").innerText = delivery + "৳";
    document.getElementById("grandTotal").innerText = grandTotal + "৳";
}

// ================= LOAD PRODUCT =================
async function loadProductByCode() {
    const code = getLandingCode();

    if (!code) {
        console.error("Landing code missing");
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/product/?code=${code}`);
        const data = await res.json();

        if (!data.success) {
            console.error(data.message);
            return;
        }

        const product = data.product;

        const price = parseFloat(product.price) || 0;
        const discount = parseFloat(product.discount_price) || 0;

        PRODUCT.id = Number(product.id);
        PRODUCT.price = price;
        PRODUCT.discount_price = discount;
        PRODUCT.title = product.title;
        PRODUCT.loaded = true;

        const finalPrice = discount > 0 ? discount : price;

        const topPrice = document.getElementById("topPrice");

        if (topPrice) {
            topPrice.innerHTML = `
                ${finalPrice}৳
                ${
                    discount > 0
                        ? `<span class="text-[15px] md:text-xs text-gray-400 line-through ml-1">${price}৳</span>`
                        : ""
                }
            `;
        }

        const heroImg = document.querySelector(".hero-img");
        if (heroImg && product.images?.length) {
            heroImg.src = product.images[0];
        }

        document.title = product.title + " | Buyolex";

        calculateTotal();

        setTimeout(() => calculateTotal(), 300);
    } catch (err) {
        console.log("Product load error:", err);
    }
}

// ================= FORM SUBMIT =================
document.addEventListener("DOMContentLoaded", () => {
    loadDistricts();
    loadProductByCode();

    const citySelect = document.getElementById("city");
    if (citySelect) {
        citySelect.addEventListener("change", calculateTotal);
    }

    const form = document.querySelector("#orderModal form");
    if (form) {
        let isSubmitting = false;
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            if (isSubmitting) return;

            if (!PRODUCT.loaded || !PRODUCT.id) {
                alert("Product load হয়নি");
                return;
            }

            const name = document.getElementById("name");
            const phone = document.getElementById("phone");
            const address = document.querySelector("#orderModal textarea");
            const city = document.getElementById("city");
            const qty = parseInt(document.getElementById("qty").value) || 1;

            if (!name.value.trim()) return alert("নাম দিন");
            if (!isValidBDPhone(phone.value)) return alert("সঠিক নাম্বার দিন");
            if (!address.value.trim()) return alert("ঠিকানা দিন");
            if (!city.value) return alert("জেলা দিন");

            const normalizedPhone = normalizePhone(phone.value);
            const deliveryCharge = getDeliveryCharge(city.value);

            isSubmitting = true;

            try {
                const res = await fetch("http://127.0.0.1:8000/api/order-create/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_id: Number(PRODUCT.id),
                        name: name.value.trim(),
                        phone: normalizedPhone,
                        qty: Number(qty),
                        delivery_charge: Number(deliveryCharge),
                        district: city.value,
                        address: address.value.trim()
                    })
                });

                const data = await res.json();

                if (data.success) {
                    closeModal();
                    document.getElementById("successPopup").classList.remove("hidden");

                    let count = 5;
                    let counter = document.getElementById("countdown");

                    let interval = setInterval(() => {
                        count--;
                        counter.innerText = count;

                        if (count === 0) {
                            clearInterval(interval);
                            window.location.reload();
                        }
                    }, 1000);

                } else {
                    alert(data.message || "Order failed");
                    isSubmitting = false;
                }

            } catch (err) {
                console.log(err);
                alert("Order failed");
                isSubmitting = false;
            }
        });
    }
});