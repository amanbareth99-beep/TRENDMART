const products = [
  { id: 1, name: "Mini LED Desk Lamp", price: 599, oldPrice: 999, category: "Home & Kitchen", icon: "💡", badge: "BESTSELLER" },
  { id: 2, name: "Cleaning Brush", price: 349, oldPrice: 699, category: "Home & Kitchen", icon: "🧹", badge: "TRENDING" },
  { id: 3, name: "Wireless Mini Earbuds", price: 799, oldPrice: 1499, category: "Gadgets", icon: "🎧", badge: "POPULAR" },
  { id: 4, name: "Portable Travel Bottle", price: 299, oldPrice: 499, category: "Lifestyle", icon: "🧴", badge: "NEW" },
  { id: 5, name: "Smart Phone Stand", price: 399, oldPrice: 799, category: "Gadgets", icon: "📱", badge: "SMART PICK" },
  { id: 6, name: "LED Night Light", price: 449, oldPrice: 899, category: "Home & Kitchen", icon: "🌙", badge: "NEW" },
  { id: 7, name: "Travel Organizer", price: 499, oldPrice: 899, category: "Lifestyle", icon: "🧳", badge: "POPULAR" },
  { id: 8, name: "Wireless Charging Pad", price: 699, oldPrice: 1199, category: "Gadgets", icon: "⚡", badge: "HOT" }
];

let cart = JSON.parse(localStorage.getItem("trendmart_cart") || "[]");
let activeCategory = "All";
let selectedPayment = "UPI / QR";

const $ = id => document.getElementById(id);

function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function saveCart() {
  localStorage.setItem("trendmart_cart", JSON.stringify(cart));
  updateCart();
}

function cartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

function cartTotal() {
  return cart.reduce((total, item) => total + item.price * item.qty, 0);
}

function renderProducts() {
  const grid = $("productGrid");
  const search = $("searchInput").value.trim().toLowerCase();

  let list = products;

  if (activeCategory !== "All") {
    list = list.filter(product => product.category === activeCategory);
  }

  if (search) {
    list = list.filter(product =>
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
    );
  }

  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;color:#777">
        No products found.
      </div>`;
    return;
  }

  grid.innerHTML = list.map(product => {
    const discount = Math.round((1 - product.price / product.oldPrice) * 100);

    return `
      <article class="card">
        <div class="productVisual">${product.icon}</div>

        <div class="productInfo">
          <span class="productBadge">${product.badge}</span>
          <h3>${product.name}</h3>
          <div class="category">${product.category}</div>

          <div class="price">
            <span class="current">${money(product.price)}</span>
            <span class="old">${money(product.oldPrice)}</span>
            <span class="discount">${discount}% OFF</span>
          </div>

          <button class="buy" data-buy="${product.id}">
            BUY NOW
          </button>
        </div>
      </article>`;
  }).join("");
}

function updateCart() {
  $("cartCount").textContent = cartCount();
  $("cartTotal").textContent = money(cartTotal());

  const container = $("cartItems");

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty">
        <div style="font-size:45px">🛒</div>
        <p>Your cart is empty.</p>
      </div>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cartItem">
      <div class="cartEmoji">${item.icon}</div>

      <div class="cartItemInfo">
        <h4>${item.name}</h4>
        <p>${money(item.price)}</p>

        <div class="qty">
          <button data-minus="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-plus="${item.id}">+</button>
          <button class="remove" data-remove="${item.id}">
            Remove
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      icon: product.icon,
      qty: 1
    });
  }

  saveCart();
  openCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(product => product.id !== id);
  }

  saveCart();
}

function removeItem(id) {
  cart = cart.filter(product => product.id !== id);
  saveCart();
}

function openCart() {
  $("cartDrawer").classList.add("show");
  $("overlay").classList.add("show");
}

function closeCart() {
  $("cartDrawer").classList.remove("show");
  $("overlay").classList.remove("show");
}

function openCheckout() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  closeCart();

  const total = cartTotal();

  $("summaryItems").textContent = cartCount();
  $("summarySubtotal").textContent = money(total);
  $("summaryTotal").textContent = money(total);
  $("payButton").textContent = "PAY " + money(total);

  $("checkoutModal").classList.add("show");
}

function closeCheckout() {
  $("checkoutModal").classList.remove("show");
}

function selectPayment(button) {
  document.querySelectorAll(".payment").forEach(item => {
    item.classList.remove("selected");
  });

  button.classList.add("selected");
  selectedPayment = button.dataset.method;
}

function placeOrder(event) {
  event.preventDefault();

  const name = $("customerName").value.trim();
  const mobile = $("customerMobile").value.trim();
  const address = $("customerAddress").value.trim();

  if (!name || !mobile || !address) {
    alert("Please fill all required details.");
    return;
  }

  if (mobile.replace(/\D/g, "").length < 10) {
    alert("Please enter a valid mobile number.");
    return;
  }

  const total = cartTotal();
  const orderNumber = "TM-" + Date.now().toString().slice(-8);

  $("orderNumber").textContent = orderNumber;
  $("successTotal").textContent = money(total);

  // DEMO PAYMENT ONLY.
  // Real payment requires a legitimate payment gateway
  // and secure backend/order verification.

  cart = [];
  saveCart();

  $("checkoutModal").classList.remove("show");
  $("successModal").classList.add("show");

  $("checkoutForm").reset();

  selectedPayment = "UPI / QR";

  document.querySelectorAll(".payment").forEach((button, index) => {
    button.classList.toggle("selected", index === 0);
  });
}

function goHome() {
  $("home").scrollIntoView({ behavior: "smooth" });
  $("navLinks").classList.remove("open");
}

function goAbout() {
  $("about").scrollIntoView({ behavior: "smooth" });
  $("navLinks").classList.remove("open");
}

function setCategory(category) {
  activeCategory = category;

  document.querySelectorAll(".catBtn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === category
    );
  });

  renderProducts();

  $("products").scrollIntoView({ behavior: "smooth" });
  $("navLinks").classList.remove("open");
}

$("productGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-buy]");
  if (!button) return;

  addToCart(Number(button.dataset.buy));
});

$("cartItems").addEventListener("click", event => {
  const plus = event.target.closest("[data-plus]");
  const minus = event.target.closest("[data-minus]");
  const remove = event.target.closest("[data-remove]");

  if (plus) {
    changeQuantity(Number(plus.dataset.plus), 1);
  }

  if (minus) {
    changeQuantity(Number(minus.dataset.minus), -1);
  }

  if (remove) {
    removeItem(Number(remove.dataset.remove));
  }
});

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.filter);
  });
});

document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.category);
  });
});

document.querySelectorAll('[data-action="home"]').forEach(button => {
  button.addEventListener("click", goHome);
});

document.querySelectorAll('[data-action="about"]').forEach(button => {
  button.addEventListener("click", goAbout);
});

$("searchInput").addEventListener("input", renderProducts);

$("cartBtn").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);

$("checkoutBtn").addEventListener("click", openCheckout);
$("continueBtn").addEventListener("click", closeCart);

$("closeCheckout").addEventListener("click", closeCheckout);

document.querySelectorAll(".payment").forEach(button => {
  button.addEventListener("click", () => {
    selectPayment(button);
  });
});

$("checkoutForm").addEventListener("submit", placeOrder);

$("successContinue").addEventListener("click", () => {
  $("successModal").classList.remove("show");
  goHome();
});

$("shopBtn").addEventListener("click", () => {
  $("products").scrollIntoView({ behavior: "smooth" });
});

$("menuBtn").addEventListener("click", () => {
  $("navLinks").classList.toggle("open");
});

renderProducts();
updateCart();
