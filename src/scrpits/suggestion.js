class Coffee {
  constructor(title, description, ingredients, image, id) {
    this.title = title;
    this.description = description;
    this.ingredients = ingredients;
    this.image = image;
    this.id = id;
  }
}

const coffeeList = [];

suggestionSection();

async function fetchData() {
  const url = new URL(`https://api.sampleapis.com/coffee/hot`);

  const response = await fetch(url);
  if (response.status === 200) {
    const jsonResponse = await response.json();
    jsonResponse.forEach((coffee) => {
      coffeeList.push(
        new Coffee(
          coffee.title,
          coffee.decription,
          coffee.ingredients,
          coffee.image,
          coffee.id
        )
      );
    });
  }
}

async function getRandomCoffee() {
  if (coffeeList.length <= 0) {
    await fetchData();
  }

  const randomIndex = Math.floor(Math.random() * coffeeList.length);

  return coffeeList[randomIndex];
}

function suggestionSection() {
  const suggestionSection = document.getElementById("suggestion");

  const title = document.createElement("h2");
  const decription = document.createElement("p");
  const suggestionBtn = document.createElement("button");

  const imageName = document.createElement("h3");
  const image = document.createElement("img");
  const body = document.createElement("div");

  imageName.classList.add("mb-4");
  image.id = "suggestedImage";
  image.alt = "Suggested item";

  body.classList.add(
    "d-flex",
    "flex-column",
    "m-5",
    "align-items-center",
    "justify-content-center"
  );

  title.textContent = "Some suggestion";
  decription.classList.add("lead");
  decription.textContent =
    "You took your time for visit us so we want to suggest you some hot beverage.\n Press the button to get one";

  suggestionBtn.type = "button";
  suggestionBtn.id = "suggestionBtn";
  suggestionBtn.classList.add("btn", "btn-secondary", "mb-3", "mx-auto");
  suggestionBtn.textContent = "Suggestion";

  suggestionSection.append(title, decription, suggestionBtn, body);
  suggestionBtn.onclick = async () => {
    suggestionBtn.disabled = true;
    let randomCoffee;
    while (true) {
      randomCoffee = await getRandomCoffee();
      if (
        randomCoffee.image !== null &&
        randomCoffee.image.includes("https://") &&
        randomCoffee.image !== image.src
      ) {
        break;
      }
    }

    imageName.textContent = randomCoffee.title;
    image.src = randomCoffee.image;

    body.append(imageName, image);
    suggestionBtn.disabled = false;
  };
  suggestionSection.append(title, decription, suggestionBtn, body);
}
