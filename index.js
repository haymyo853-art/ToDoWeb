/** @format */

const payBtn = document.querySelector("#pay-with-crypto");
const modal = document.querySelector("#modal");
const content = document.querySelector("#content");
const modalContent = document.querySelector("#modalContent");

// Stores cart state items as: { id, name, price, currency, image, quantity }
let addToCarts = [];

const createCard = (product) => {
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("cardContainer");
  cardContainer.dataset.productId = product.id;

  const productName = document.createElement("p");
  productName.classList.add("text-xs");
  productName.textContent = product.title;

  const productImageContainer = document.createElement("div");
  productImageContainer.classList.add("flex", "justify-center");
  productImageContainer.innerHTML = `<img src="${product.thumbnail}" class="w-52 h-60" />`;

  const cardFooter = document.createElement("div");
  cardFooter.classList.add("flex", "justify-between", "items-center");
  cardFooter.innerHTML = `
    <p class="text-xs">$${product.price.toLocaleString()} </p>
    <div class="flex items-center gap-3">
      <button class="btn-minus size-8 border rounded-sm border-[#E5E7EB]">-</button>
      <p class="text-sm font-medium" id="price-${product.id}">0</p>
      <button class="btn-plus size-8 border rounded-sm border-[#E5E7EB]">+</button>
    </div>
  `;

  cardContainer.appendChild(productName);
  cardContainer.appendChild(productImageContainer);
  cardContainer.appendChild(cardFooter);
  content.appendChild(cardContainer);

  // Scoped Event Target Selection
  const addBtn = cardFooter.querySelector(".btn-plus");
  const minusBtn = cardFooter.querySelector(".btn-minus");

  addBtn.addEventListener("click", () => {
    changeQuantity(product, 1);
  });

  minusBtn.addEventListener("click", () => {
    changeQuantity(product, -1);
  });
};

// Unified state modifier function handles addition and reduction cleanly
const changeQuantity = (product, change) => {
  const cartItem = addToCarts.find((item) => item.id === product.id);

  if (cartItem) {
    cartItem.quantity += change;
    // Remove completely from array if quantity hits zero
    if (cartItem.quantity <= 0) {
      addToCarts = addToCarts.filter((item) => item.id !== product.id);
    }
  } else if (change > 0) {
    // If it's a new item and we are adding, push to cart configuration
    addToCarts.push({ ...product, quantity: 1 });
  }

  // Synchronize main page display counters
  const updatedItem = addToCarts.find((item) => item.id === product.id);
  const displayValue = updatedItem ? updatedItem.quantity : 0;
  document.querySelector(`#price-${product.id}`).textContent = displayValue;

  // Sync up the checkout overlay window layout
  renderModal();
};

// Generates structural template content dynamically based on standard data state
const renderModal = () => {
  // Clears out previous items but retains standard wrapper elements safely
 modalContent.innerHTML = `
  <div class="flex items-center justify-between">
    <h3 class="text-base font-bold">Checkout Cart</h3>

    <div class=" py-2.5 flex h-8 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs" id="cancle">
      X
    </div>
  </div>
`;
modalContent.querySelector("#cancle").onclick = onCancel;

  if (addToCarts.length === 0) {
    modalContent.innerHTML += `<p class="text-sm text-gray-500 py-4 text-center">Your cart is empty.</p>`;
    return;
  }

  addToCarts.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add(
      "flex",
      "justify-between",
      "gap-4",
      "mt-4",
      "border-b",
      "pb-2"
    );
    card.innerHTML = ` 
      <div>
        <p class="text-sm font-medium">${item.name}</p>
        <div class="flex items-center gap-2 mt-1">
          <img src="${item.thumbnail}" class="w-10" />
          <span class="text-xs text-gray-500">Qty: ${item.quantity}</span>
        </div>
      </div>
      <div class="flex justify-between gap-3 items-center">
        <p class="text-sm font-semibold">$${(
          item.price * item.quantity
        ).toLocaleString()}</p>
        <div class="flex items-center gap-3">
          <button class="btn-modal-minus size-8 border rounded-sm border-border flex items-center justify-center font-bold">
            -
          </button>
        </div>
      </div>`;

    // Hook up minus controls internally inside checkout overview container layout targets
    card.querySelector(".btn-modal-minus").addEventListener("click", () => {
      changeQuantity(item, -1);
    });

    modalContent.appendChild(card);
  });
};

// const skeletonCard = `<div class="cardContainer animate-pulse">

const showLoading = () => {
  content.classList.remove("grid");
  content.innerHTML = ` <div id="loading" class="grid grid-cols-2 gap-3">
   <div class="h-80 w-full bg-slate-50 rounded-lg"></div>
    <div class="h-80 w-full bg-slate-50 rounded-lg"></div>
      <div class="h-80 w-full bg-slate-50 rounded-lg"></div>
        <div class="h-80 w-full bg-slate-50 rounded-lg"></div>
          <div class="h-80 w-full bg-slate-50 rounded-lg"></div>
            <div class="h-80 w-full bg-slate-50 rounded-lg"></div>
  </div>`;
};

const hideLoading = () => {
  document.querySelector("#loading").remove();
  content.classList.add("grid");
};

const showError = () => {
  content.innerHTML = `<p class="text-sm text-gray-500 py-4 text-center">Failed to load products. Please try again later.</p>`;
  content.classList.remove("grid");
  throw new Error("Network response was not ok");
};

const showEmpty = () => {
  content.innerHTML = `<p class="text-sm text-gray-500 py-4 text-center">No products available at the moment.</p>`;
  content.classList.remove("grid");
};

const getProducts = async () => {
  showLoading();
  const response = await fetch("https://dummyjson.com/products");
  if (!response.ok) {
    showError();
  }

  hideLoading();

  const data = await response.json();
  if (data.products.length === 0) {
    showEmpty();
  }
  return data;
};



window.onload = async () => {
  

  const { products } = await getProducts();

  products.forEach((product) => {
    createCard(product);
  });
  renderModal();
};

payBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
});



modal.addEventListener("click", () => {
  onCancel();
});

modalContent.addEventListener("click", (event) => {
  event.stopPropagation();
});

const onCancel = () => {
  modal.classList.remove("flex");
  modal.classList.add("hidden");
};
modalContent.addEventListener("click", (event) => {
  if (event.target.closest("#cancle")) {
    onCancel();
  }
});