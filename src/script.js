const productList = document.getElementById("product-list");
const cartTitle = document.getElementById('cart-title');
const emptyCart = document.getElementById('empty-cart');
const cartItems = document.getElementById('cart-items');
const cartItemsContainer = document.getElementById('cart-items-container');
const totalPriceElement = document.getElementById('total-price');
const confirmOrderBtn = document.getElementById('confirm-order-btn');
const orderConfirmation = document.getElementById('order-confirmation');
const confirmationItems = document.getElementById('confirmation-items');
const confirmationTotal = document.getElementById('confirmation-total');
const newOrderBtn = document.getElementById('new-order-btn');

async function getData() {
    try {
        const response = await fetch("data.json");
        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const products = await response.json();
        showProducts(products);
        attachEventListeners(products);
        
    } catch (error) {
        console.error(error);
        productList.innerHTML = `
            <div class="col-span-full text-center p-8 bg-red-50 rounded-lg text-red-700">
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

getData(); 

function showProducts(products) {
    productList.innerHTML = products.map(product => `
        <div class="">
            <!-- Product Image -->
            <div class="relative">
                <picture>
                    <source srcset="${product.image.desktop}" media="(min-width: 1024px)" />
                    <source srcset="${product.image.tablet}" media="(min-width: 768px)" />
                    <source srcset="${product.image.mobile}" media="(min-width: 300px)" />
                     <img src="${product.image.thumbnail}" alt="${product.name}" class="rounded-lg w-full h-auto" />
            </picture>
                <div class="product-actions relative bottom-5 left-20">
                    <!-- Initial Add to Cart Button (visible by default) -->
                    <button class="add-to-cart-btn flex justify-between bg-white border-2 border-secondary-text rounded-full py-2 px-8 hover:text-heading-text hover:border-heading-text transition duration-300 ease-in-out" data-id="${product.id}">
                        <img src="images/icon-add-to-cart.svg" alt="">
                        <span class="text-secondary-text font-medium hover:text-heading-text ml-2">Add to Cart</span>
                    </button>
                    
                    <!-- Quantity Controls (hidden by default) -->
                    <div class="quantity-controls justify-between hidden flex items-center bg-red-500  rounded-full py-2 px-4" data-id="${product.id}" style="width: 150px; background-color: #d9480f;">
                        <button class="decrease-btn border-2 w-6 h-6 flex items-center justify-center rounded-full  font-bold text-xl px-2 text-white"><img src="images/icon-decrement-quantity.svg" alt=""></button>
                        <span class="quantity-display text-white mx-3 font-medium">1</span>
                        <button class="increase-btn border-2 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xl px-2 text-white"><img src="images/icon-increment-quantity.svg" alt=""></button>
                    </div>
                </div>
            </div>
            
            <!-- Product Info -->
            <div class="mb-2">
                <p class="text-primary-text">${product.category}</p>
                <h3 class="text-secondary-text font-bold text-2xl">${product.name}</h3>
                <p class="text-heading-text font-semibold">$${product.price}</p>
            </div>
        </div>
    `).join("");
}

function attachEventListeners(products) {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  
    addToCartButtons.forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.getAttribute("data-id");
            const selectedProduct = products.find(p => p.id == productId);
            
            // Switch to quantity controls
            button.classList.add('hidden');
            const quantityControls = button.parentElement.querySelector('.quantity-controls');
            quantityControls.classList.remove('hidden');
            
            addToCart(selectedProduct);
        });
    });

    // Add event listeners for quantity controls
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.closest('.quantity-controls').getAttribute('data-id');
            const selectedProduct = products.find(p => p.id == productId);
            addToCart(selectedProduct);
        });
    });

    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.closest('.quantity-controls').getAttribute('data-id');
            decreaseQuantity(productId);
        });
    });

    // Add event listener for the new order button
    newOrderBtn.addEventListener('click', () => {
        orderConfirmation.classList.add('hidden');
        cart = [];
        resetAllQuantityControls();
        updateCartUI();
    });
}

// Cart structure changed to store product IDs and quantities
let cart = [];

function addToCart(product) {
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
        // Increment quantity if product already in cart
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new product with quantity 1
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Update the quantity display
    updateQuantityDisplay(product.id);
    updateCartUI();
}

function decreaseQuantity(productId) {
    const existingItemIndex = cart.findIndex(item => item.id == productId);
    
    if (existingItemIndex >= 0) {
        if (cart[existingItemIndex].quantity > 1) {
            // Decrease quantity if more than 1
            cart[existingItemIndex].quantity -= 1;
        } else {
            // Remove item if quantity would become 0
            cart.splice(existingItemIndex, 1);
            
            // Reset to Add to Cart button
            const productActions = document.querySelector(`.quantity-controls[data-id="${productId}"]`).parentElement;
            productActions.querySelector('.quantity-controls').classList.add('hidden');
            productActions.querySelector('.add-to-cart-btn').classList.remove('hidden');
        }
        
        updateQuantityDisplay(productId);
        updateCartUI();
    }
}

function updateQuantityDisplay(productId) {
    const quantityControls = document.querySelector(`.quantity-controls[data-id="${productId}"]`);
    if (quantityControls) {
        const quantityDisplay = quantityControls.querySelector('.quantity-display');
        const existingItem = cart.find(item => item.id == productId);
        
        if (existingItem) {
            quantityDisplay.textContent = existingItem.quantity;
        } else {
            quantityDisplay.textContent = '0';
        }
    }
}

function resetAllQuantityControls() {
    // Hide all quantity controls and show all add to cart buttons
    document.querySelectorAll('.quantity-controls').forEach(control => {
        control.classList.add('hidden');
        control.querySelector('.quantity-display').textContent = '1';
        
        const addButton = control.parentElement.querySelector('.add-to-cart-btn');
        addButton.classList.remove('hidden');
    });
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        emptyCart.classList.remove("hidden");
        cartItems.classList.add("hidden");
        cartTitle.textContent = "Your Cart (0)";
    } else {
        emptyCart.classList.add("hidden");
        cartItems.classList.remove("hidden");

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center mb-2">
                <div>
                    <h4 class="font-medium text-secondary-text">${item.name}</h4>
                    <p class="text-heading-text">$${item.price} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="remove-item-btn text-heading-text hover:text-red-500" data-id="${item.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `).join("");

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                removeItemCompletely(productId);
            });
        });

        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        cartTitle.textContent = `Your Cart (${totalItems})`;
    }
}

function removeItemCompletely(productId) {
    // Remove item from cart
    cart = cart.filter(item => item.id != productId);
    
    // Reset the product's UI to show Add to Cart button
    const productActions = document.querySelector(`.quantity-controls[data-id="${productId}"]`).parentElement;
    productActions.querySelector('.quantity-controls').classList.add('hidden');
    productActions.querySelector('.add-to-cart-btn').classList.remove('hidden');
    
    updateCartUI();
}

confirmOrderBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    orderConfirmation.classList.remove('hidden');
    
    confirmationItems.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-4">
                <img src="${item.image.thumbnail}" alt="${item.name}" class="w-16 h-16 rounded-lg">
            </div>    
            <div>
                <h4 class="font-medium text-secondary-text">${item.name}</h4>
                <div class="flex items-start gap-6">
                <p class="text-heading-text font-bold">${item.quantity}x</p>
                <p class="text-primary-text">@$${item.price}</p>
                </div>
            </div>
             <div>
             <p class="text-heading-text font-semibold">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </div>
    `).join("");
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    confirmationTotal.textContent = `$${totalPrice.toFixed(2)}`;
});