document.addEventListener("DOMContentLoaded", () => {
  const orderItemsContainer = document.getElementById("order-items");
  const orderSubtotal = document.getElementById("order-subtotal");
  const orderTotal = document.getElementById("order-total");
  const orderDetailsInput = document.getElementById("order-details-input");
  const checkoutForm = document.getElementById("checkout-form");
  const upiIdDisplay = document.getElementById("upi-id-display");

  if (!checkoutForm) {
    console.error("checkout-form not found in DOM.");
    return;
  }

  // Load cart from localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // If cart empty, send user to cart page (change path as needed)
  if (cart.length === 0) {
    // go to cart or home — avoid blank URL
    window.location.href = "/cart.html";
    return;
  }

  // Render order items
  let subtotal = 0;
  orderItemsContainer.innerHTML = "";

  cart.forEach((item) => {
    const quantity = item.quantity || 1;
    const itemTotal = (Number(item.price) || 0) * quantity;
    subtotal += itemTotal;

    const itemElement = document.createElement("div");
    itemElement.className = "flex justify-between py-2 border-b border-gray-100";
    itemElement.innerHTML = `
      <div style="color: white;">
        <h4 class="font-medium">
          <i class="fas fa-shopping-bag"></i> ${item.name}
        </h4>
        <p class="text-sm text-gray-500">
          <i class="fas fa-box"></i> Qty: ${quantity}
        </p>
      </div>
      <span style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 14px;"><i class="fas fa-coins"></i> ₹${itemTotal.toFixed(2)}</span>
    `;
    orderItemsContainer.appendChild(itemElement);
  });

  // Update totals
  orderSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
  orderTotal.textContent = `₹${subtotal.toFixed(2)}`;

  // Set up UPI ID display
  if (upiIdDisplay) upiIdDisplay.textContent = "yourstore@upi"; // Replace with actual UPI ID

  // Prepare order details for form submission (string)
  const orderDetails = {
    items: cart,
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(subtotal.toFixed(2)),
    date: new Date().toISOString(),
  };

  // Put JSON into hidden field (hidden inputs are submitted)
  orderDetailsInput.value = JSON.stringify(orderDetails, null, 2);

  // Helper: validate form values
  function validateForm() {
    const upiEl = document.getElementById("upi");
    const phoneEl = document.getElementById("phone");
    if (!upiEl || !phoneEl) {
      alert("Form elements missing.");
      return false;
    }

    const upiId = upiEl.value.trim();
    const phone = phoneEl.value.trim();

    // Basic UPI ID validation
    if (!upiId || !upiId.includes("@")) {
      alert("Please enter a valid UPI ID (e.g., yourname@upi)");
      return false;
    }

    // Basic phone number validation
    // if (phone.length < 10 || !/^\d+$/.test(phone)) {
    //   alert("Please enter a valid 10-digit phone number");
    //   return false;
    // }

    return true;
  }

  // Submit handler (uses fetch to Web3Forms)
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // optional: if you have hCaptcha on page, require it; otherwise skip
    const captchaResponse = document.querySelector("textarea[name='h-captcha-response']");
    if (captchaResponse) {
      if (!captchaResponse.value || !captchaResponse.value.trim()) {
        alert("Please complete the CAPTCHA before submitting.");
        // do not submit
        return;
      }
    }

    if (!validateForm()) return;

    // Build formData from the form (includes hidden fields)
    const formData = new FormData(checkoutForm);

    // If you want to include JSON order details separately (already in hidden input)
    // formData.set('order_details', JSON.stringify(orderDetails));

    // Show a simple loading state (optional)
    const submitBtn = checkoutForm.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Placing order...";
    }

    fetch(checkoutForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        // restore button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Place Order";
        }
        if (response.ok) {
          // // Clear cart on successful submission
          // localStorage.removeItem("cart");

          // Try to read JSON response (Web3Forms usually returns JSON)
          let data;
          try {
            data = await response.json();
          } catch (err) {
            data = null;
          }

          // If Web3Forms returns a redirect URL in 'redirect' input, use it.
          // You set <input name="redirect" value="https://zamaz.netlify.app/payment.html" />
          // So perform a client-side redirect to that value:
          const redirectInput = checkoutForm.querySelector("input[name='redirect']");
          const redirectUrl = redirectInput ? redirectInput.value : null;

          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else if (data && data.success && data.redirect) {
            // some APIs return redirect in JSON
            window.location.href = data.redirect;
          } else {
            // fallback: show a success message
            alert("Order placed successfully.");
            // optionally send to a success page:
            // window.location.href = '/payment.html';
          }
        } else {
          // non-200
          let text = await response.text();
          console.error("Form submission failed:", response.status, text);
          alert("There was an error submitting your order. Please try again.");
        }
      })
      .catch((error) => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Place Order";
        }
        alert("There was an error submitting your order. Please try again.");
        console.error("Error:", error);
      });
  });

  // Defensive: guard redirectBtn (if present)
  const redirectBtn = document.getElementById("redirectBtn");
  if (redirectBtn) {
    redirectBtn.addEventListener("click", () => {
      window.location.href = "payment.html";
    });
  }
});
