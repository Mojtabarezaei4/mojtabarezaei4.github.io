class Product {
  constructor(id, title, img, shipping, price, ingredients) {
    this.id = id;
    this.title = title;
    this.img = img;
    this.shipping = shipping;
    this.price = price;
    this.ingredients = ingredients;
  }
}

class CartItem {
  constructor(product, amount) {
    this.product = product;
    this.amount = amount;
  }
}

let cart = [];

if (
  sessionStorage.getItem("cart") !== null &&
  sessionStorage.getItem("cart").length > 0
) {
  cart = JSON.parse(sessionStorage.getItem("cart"));
  cart.forEach((item) => {
    createCartElement(item);
  });
  if (cart.length === 0) {
    printEmpty();
  }
}

function printEmpty() {
  const emptyLi = document.createElement("li");
  const empty = document.createElement("h6");
  emptyLi.id = "empty";
  empty.textContent = "Empty";
  emptyLi.append(empty);
  const cartUl = document.getElementById("cart-ul");
  cartUl.append(emptyLi);
}

const products = new Map();

productCreation();

if (document.URL.includes("products.html")) {
  cardMaker();

  const modal = document.getElementById("exampleModal");
  modal.addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-product-id");

    let title = modal.querySelector("#title");
    let body = modal.querySelector("#body");

    let currentProduct = null;

    currentProduct = products.get(id);

    title.textContent = currentProduct.title;

    body.textContent = "";
    currentProduct.ingredients.forEach((ingredient) => {
      if (
        currentProduct.ingredients[currentProduct.ingredients.length - 1] ===
        ingredient
      ) {
        body.textContent += ingredient;
      } else {
        body.textContent += `${ingredient}, `;
      }
    });
  });
}

function increament(product) {
  let indexOfItem = 0;
  cart.forEach((item) => {
    if (item.product.id === product.id) {
      indexOfItem = cart.indexOf(item);
    }
  });
  cart[indexOfItem].amount++;

  document.getElementById(`${product.id}`).textContent =
    cart[indexOfItem].amount;

  sessionStorage.setItem("cart", JSON.stringify(cart));
}
function decreament(product) {
  const cartUl = document.getElementById("cart-ul");
  let indexOfItem = 0;
  cart.forEach((item) => {
    if (item.product === product) {
      indexOfItem = cart.indexOf(item);
    }
  });
  cart[indexOfItem].amount--;

  if (cart[indexOfItem].amount === 0) {
    cart.splice(indexOfItem, 1);
    cartUl.removeChild(cartUl.children[`li-${product.id}`]);
    sessionStorage.setItem("cart", JSON.stringify(cart));
    if (cart.length === 0) {
      printEmpty();
    }
    return;
  }

  document.getElementById(`${product.id}`).textContent =
    cart[indexOfItem].amount;

  sessionStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(product) {
  if (productExists(product)) {
    increament(product);
    return;
  } else {
    let cartItem = new CartItem(product, 1);
    cart.push(cartItem);
    createCartElement(cartItem);

    sessionStorage.setItem("cart", JSON.stringify(cart));
  }
}

function createCartElement(cartItem) {
  const cartUl = document.getElementById("cart-ul");

  const emptyLi = document.getElementById("empty");

  if (emptyLi !== null) {
    cartUl.removeChild(cartUl.children["empty"]);
  }

  const li = document.createElement("li");
  const itemContainer = document.createElement("div");
  const img = document.createElement("img");
  const title = document.createElement("p");
  const amountDiv = document.createElement("div");
  const decreaseBtn = document.createElement("button");
  const amountNumber = document.createElement("p");
  const increaseBtn = document.createElement("button");
  const itemPrice = document.createElement("p");

  itemContainer.classList.add(
    "d-flex",
    "flex-row",
    "mb-4",
    "justify-content-between",
    "align-items-center"
  );
  img.src = cartItem.product.img;
  img.alt = "...";
  img.style.width = "50px";
  title.textContent = cartItem.product.title;
  amountDiv.classList.add("d-flex", "justify-content-evenly");
  decreaseBtn.type = "button";
  decreaseBtn.classList.add("btn");
  decreaseBtn.textContent = "-";
  amountNumber.id = `${cartItem.product.id}`;
  amountNumber.textContent = cartItem.amount;
  increaseBtn.type = "button";
  increaseBtn.classList.add("btn");
  increaseBtn.textContent = "+";
  itemPrice.innerText = `${cartItem.product.price} kr`;

  amountDiv.append(decreaseBtn, amountNumber, increaseBtn);
  itemContainer.append(img, title, amountDiv, itemPrice);

  li.id = `li-${cartItem.product.id}`;
  li.append(itemContainer);
  cartUl.append(li);

  increaseBtn.onclick = () => {
    increament(cartItem.product);
  };

  decreaseBtn.onclick = () => {
    decreament(cartItem.product);
  };
}

function productExists(product) {
  let res = false;
  cart.forEach((item) => {
    if (item.product.id == product.id) {
      res = true;
      return res;
    }
  });
  return res;
}

function productCreation() {
  products.set(
    "1",
    new Product(1, "Cake One", "../images/first.webp", 4, 1500, [
      "Whipped cream",
    ])
  );
  products.set(
    "2",
    new Product(2, "Cake Two", "../images/second.webp", 2, 1100, [
      "Whipped cream",
      "flour",
    ])
  );
  products.set(
    "3",
    new Product(3, "Cake Three", "../images/third.webp", 5, 1600, [
      "Whipped cream",
      "flour",
      "eggs",
    ])
  );
  products.set(
    "4",
    new Product(4, "Cake Four", "../images/fourth.webp", 5, 1600, ["someThing"])
  );
}
function cardMaker() {
  products.forEach((product) => {
    const container = document.createElement("div");
    const col = document.createElement("div");
    const card = document.createElement("div");
    const cardImg = document.createElement("img");
    const cardBody = document.createElement("div");
    const cardTitle = document.createElement("h2");
    const cardList = document.createElement("ul");
    const listItemOne = document.createElement("li");

    const timeIcon = document.createElement("img");

    const shippingDiv = document.createElement("div");
    const shippingDays = document.createElement("h4");
    const listItemTwo = document.createElement("li");

    const priceIcon = document.createElement("img");

    const priceDiv = document.createElement("div");
    const priceAmount = document.createElement("h4");

    const ingredientsBtn = document.createElement("button");
    const addToCartBtn = document.createElement("button");

    container.classList.add(
      "row",
      "row-cols-1",
      "row-cols-md-2",
      "g-4",
      "justify-content-center"
    );
    col.classList.add("col");
    card.classList.add("card", "product", "align-items-center");

    cardImg.src = product.img;
    cardImg.classList.add("img-style");
    cardImg.alt = "Product image";

    cardBody.classList.add("card-body");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = product.title;

    cardList.classList.add("d-grid", "gap-4", "my-5", "list-unstyled");
    listItemOne.classList.add("d-flex", "gap-5");

    timeIcon.src = "../images/clock-history.svg";
    timeIcon.alt = "clock-icon";
    timeIcon.id = "svg";

    shippingDays.classList.add("mb-0");
    shippingDays.textContent = `${product.shipping} days`;

    listItemTwo.classList.add("d-flex", "gap-5");

    priceIcon.src = "../images/currency-dollar.svg";
    priceIcon.alt = "currency-icon";
    priceIcon.id = "svg";

    priceAmount.classList.add("mb-0");
    priceAmount.textContent = `${product.price} kr`;

    ingredientsBtn.type = "button";
    ingredientsBtn.classList.add(
      "btn",
      "btn-secondary",
      "mb-3",
      "ingredients-btn"
    );
    ingredientsBtn.setAttribute("data-bs-toggle", "modal");
    ingredientsBtn.setAttribute("data-bs-target", "#exampleModal");
    ingredientsBtn.setAttribute("data-product-id", `${product.id}`);
    ingredientsBtn.textContent = "Ingredients";

    addToCartBtn.type = "button";
    addToCartBtn.id = "addToCartBtn";
    addToCartBtn.classList.add("btn", "btn-primary", "mb-3");
    addToCartBtn.setAttribute("data-product-id", `${product.id}`);
    addToCartBtn.textContent = "Add to cart";
    addToCartBtn.onclick = () => {
      addToCart(product);
    };

    priceDiv.append(priceAmount);
    listItemTwo.append(priceIcon, priceDiv);

    shippingDiv.append(shippingDays);
    listItemOne.append(timeIcon, shippingDiv);

    cardList.append(listItemOne, listItemTwo);
    cardBody.append(cardTitle, cardList);

    card.append(cardImg, cardBody, ingredientsBtn, addToCartBtn);

    col.append(card);

    container.append(col);

    const productContainer = document.getElementById("productItems");
    productContainer.append(container);
  });
}
