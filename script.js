`use strict`;
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const btnAdds = $$(".btn--add");
const modal = $(".modal");
const form = $(".form");
const select = $(".dropdown__select");
const option = $(".dropdown__option");
const icon = $(".dropdown__select i");
const dropdown = $(".dropdown");
const cols = $$(".todo__col");
const area = $(".area textarea");
const todoContainer = $$(".todo__container");

class todoItem {
  id = (Date.now() + "").slice(-10);
  constructor(status, type, content) {
    this.status = status;
    this.type = type;
    this.content = content;
  }
  _getId() {
    return this.id;
  }
}

class Script {
  #type = ["design", "development", "bugfix"];
  #status = ["todo", "inProcess", "completed"];
  #list = [];
  constructor() {
    this._renderType();
    select.addEventListener("click", function () {
      option.classList.toggle("show");
      icon.classList.toggle("fa-chevron-up");
    });

    btnAdds.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        modal.classList.add("show");
        const col = e.target.closest(".todo__col");
        form.dataset.status = col.dataset.status;
      });
    });
    //on off model
    modal.addEventListener("click", function (e) {
      if (e.target.closest(".modal__content")) return;
      modal.classList.remove("show");
    });
    // get value dropdown
    option.addEventListener("click", function (e) {
      if (!e.target.closest(".option")) return;
      option.classList.remove("show");
      icon.classList.remove("fa-chevron-up");
      const opt = e.target.dataset.option;
      select.querySelector("span").innerHTML = opt;
      dropdown.dataset.value = opt;
    });

    //submit
    form.addEventListener("submit", this._handleSubmit.bind(this));
    //remove
    todoContainer.forEach((cur) => {
      cur.addEventListener("click", this._handleDelete.bind(this));
      cur.addEventListener("click", this._handleEdit.bind(this));
    });
    //Editttt

  }

  _handleEdit(e) {
    if (!e.target.closest('.fa-edit')) return;
    
  }

  _renderNewBox(status, el) {
    cols.forEach((col) => {
      if (col.dataset.status === status) return;
      const todoContainer = col.querySelector(".todo__container");
      const newBox = document.createElement("div");
      newBox.className = "new__box";
      newBox.style.height = getComputedStyle(el).height;
      newBox.style.width = getComputedStyle(el).width;
      todoContainer.insertAdjacentElement("beforeend", newBox);
    });
  }
  _handleDelete(e) {
    if (!e.target.closest(".fa-trash")) return;
    const item = e.target.closest(".todo__item");
    const id = item.dataset.id;
    const status = item.closest(".todo__col").dataset.status;
    this.#list.filter((x) => x.id !== id);
    this._rederListByStatus(status);
  }
  _handleSubmit(e) {
    e.preventDefault();
    const type = dropdown.dataset.value;
    const content = area.value;
    const status = form.dataset.status;
    const item = new todoItem(status, type, content);
    this.#list.push(item);
    this._rederListByStatus(status);
    dropdown.dataset.value = "";
    area.value = "";
    select.querySelector("span").innerHTML = "Choose Todo Type";
    modal.classList.remove("show");
  }
  _rederListByStatus(status) {
    const col = cols[this.#status.indexOf(status)];
    const count = col.querySelector(".todo__counter");
    const todoContainer = col.querySelector(".todo__container");
    todoContainer.innerHTML = "";
    this.#list
      .filter((item) => item.status === status)
      .forEach((item, _, cur) => {
        count.innerHTML = cur.length;
        this._renderItem(todoContainer, item);
      });
  }
  _renderItem(todoContainer, item) {
    const color = this._getColorByType(item.type);
    const html = `
    <div class ="todo__box">
    <div class="todo__item" draggable="true" data-id='${item._getId()}'>
    <div class="todo__top">
    <div class="todo__dot todo__dot--r${color}"></div>
    <div class="todo__type">${item.type}</div>
    <div class="todo__icons">
    <i class="far fa-edit"></i>
    <i class="fas fa-trash"></i>
    </div>
    </div>
    <div class="todo__content">
    <p>${item.content}</p>
    </div>
    </div>
    </div>`;
    todoContainer.insertAdjacentHTML("beforeend", html);
  }
  _getColorByType(type) {
    if (type === "Design") return "red";
    if (type === "Development") return "green";
    if (type === "Bugfix") return "orange";
    return "black";
  }
  _renderType() {
    this.#type.forEach((item) => {
      option.insertAdjacentHTML(
        "beforeend",
        `
          <li class="option" data-option="${item}">${item}</li>
          `
      );
    });
  }
}

const script = new Script();
