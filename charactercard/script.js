const character = {
  name: "Snortleblat",
  class: "Swamp Beast Diplomat",
  level: 5,
  health: 100,
  image: "https://andejuli.github.io/wdd131/character_card/snortleblat.webp",

  attacked() {
    this.health = Math.max(0, this.health - 20);
    return this.health;
  },

  levelUp() {
    this.level += 1;
    return this.level;
  },
};

const characterName = document.querySelector("#character-name");
const characterClass = document.querySelector("#class-value");
const portrait = document.querySelector(".image");
const healthValue = document.querySelector("#health-value");
const levelValue = document.querySelector("#level-value");
const attackButton = document.querySelector("#attack-button");
const levelUpButton = document.querySelector("#level-up-button");

function renderCharacter() {
  characterName.textContent = character.name;
  characterClass.textContent = character.class;
  portrait.src = character.image;
  healthValue.textContent = character.health;
  levelValue.textContent = character.level;
  attackButton.disabled = character.health === 0;
}

attackButton.addEventListener("click", () => {
  const remainingHealth = character.attacked();

  if (remainingHealth === 0) {
    alert("Character Died");
  }

  renderCharacter();
});

levelUpButton.addEventListener("click", () => {
  character.levelUp();
  renderCharacter();
});

renderCharacter();
