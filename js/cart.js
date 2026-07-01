document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSummary = document.getElementById("cart-summary");
  const subtotalElement = document.getElementById("subtotal");
  const checkoutBtn = document.getElementById("checkout-btn");
  
  let isInitialLoad = true;

  renderCart();

  checkoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/buy.html";
  });

  function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      cartSummary.classList.add("hidden");
      cartItemsContainer.innerHTML = `
        <div class="text-center py-10">
          <p class="text-gray-500">Your cart is empty</p>
          <a href="/" class="text-[#0066C0] hover:underline mt-2 inline-block">Continue shopping</a>
        </div>
      `;
      return;
    }

    cartItemsContainer.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
      subtotal += item.price * (item.quantity || 1);

      const itemElement = document.createElement("div");
      itemElement.className = `cart-item flex items-start py-4${isInitialLoad ? '' : ' no-animation'}`;
      // Responsive inline styles
      itemElement.style.cssText = `
        display: flex !important;
        opacity: 1 !important;
        visibility: visible !important;
        position: relative !important;
        flex-wrap: wrap !important;
        gap: -0.5rem !important;
        ${isInitialLoad ? '' : 'animation: none !important; margin-top: -30px; margin-bottom: 50px;'}
      `;
      
      itemElement.innerHTML = `
        <div class="flex-shrink-0" style="display: block !important; width: clamp(60px, 15vw, 80px) !important; height: clamp(60px, 15vw, 80px) !important; background-color: #000 !important; border-radius: 0.375rem !important; overflow: hidden !important; margin-bottom: -30px;">
          <img src="${item.image}" alt="${item.name}" style="display: block !important; width: 100% !important; height: 100% !important; object-fit: contain !important;">
        </div>
        <div id="naam" style="display: flex !important; flex-direction: column !important; flex: 1 !important; min-width: 200px !important; gap: 0.5rem !important; margin-left: 2vw;">
          <h3 style="display: block !important; font-weight: 500 !important;  color: white !important;">${item.name}</h3>
          <div style="display: flex !important; flex-wrap: wrap !important; align-items: center !important; gap: 1rem !important; margin-top: 0.5rem !important;">
            <span style="color: white !important; font-size: clamp(18px, 4vw, 28px) !important; font-weight: bold !important; display: inline-block !important;">₹${item.price}</span>
            <div style="display: flex !important; align-items: center !important; gap: 0.5rem !important; margin-left: auto !important; flex-wrap: wrap !important;">
              <div style="display: flex !important; align-items: center !important; gap: 0.5rem !important; background: rgba(255,255,255,0.1) !important; padding: 0.25rem 0.5rem !important; border-radius: 0.5rem !important;">
                <button type="button" class="quantity-btn" data-index="${index}" data-action="decrease" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: clamp(28px, 6vw, 36px) !important; height: clamp(28px, 6vw, 36px) !important; padding: 0 !important; background-color: #e5e7eb !important; border-radius: 0.375rem !important; cursor: pointer !important; border: none !important; font-size: clamp(16px, 3vw, 20px) !important; font-weight: bold !important;">-</button>
                <span style="color: white !important; font-size: clamp(16px, 3.5vw, 24px) !important; font-weight: bold !important; display: inline-block !important; min-width: clamp(20px, 5vw, 30px) !important; text-align: center !important;">${item.quantity || 1}</span>
                <button type="button" class="quantity-btn" data-index="${index}" data-action="increase" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: clamp(28px, 6vw, 36px) !important; height: clamp(28px, 6vw, 36px) !important; padding: 0 !important; background-color: #e5e7eb !important; border-radius: 0.375rem !important; cursor: pointer !important; border: none !important; font-size: clamp(16px, 3vw, 20px) !important; font-weight: bold !important;">+</button>
              </div>
              <button type="button" class="remove-btn" data-index="${index}" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: clamp(32px, 7vw, 40px) !important; height: clamp(32px, 7vw, 40px) !important; color: #ef4444 !important; cursor: pointer !important; background: rgba(239, 68, 68, 0.1) !important; border-radius: 0.375rem !important; border: 1px solid rgba(239, 68, 68, 0.3) !important; transition: all 0.3s !important;">
                <i class="fas fa-trash" style="font-size: clamp(14px, 3vw, 16px) !important;"></i>
              </button>
            </div>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemElement);
    });

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    cartSummary.classList.remove("hidden");

    if (isInitialLoad) {
      isInitialLoad = false;
    }

    attachEventListeners();
  }

  function attachEventListeners() {
    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", updateQuantity);
    });

    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", removeItem);
    });
  }

  function updateQuantity(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.target.closest('.quantity-btn');
    if (!button) return;
    
    const index = parseInt(button.dataset.index);
    const action = button.dataset.action;
    
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (action === "increase") {
      cart[index].quantity = (cart[index].quantity || 1) + 1;
    } else if (action === "decrease") {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  function removeItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.target.closest('.remove-btn');
    if (!button) return;
    
    const index = parseInt(button.dataset.index);
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
});