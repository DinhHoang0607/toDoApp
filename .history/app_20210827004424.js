"use strict";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const cols = $$(".todo__col");
const todoContainer = $$(".todo__container");

const modal = $(".modal");
const btnAdds = $$(".btn--add");

const form = $(".form");
const dropdown = $(".dropdown");
const select = $(".dropdown__select");
const option = $(".dropdown__option");
const area = $(".area textarea");

const icon = document.querySelector(".dropdown__select i");

class todoItem {
  id = (Date.now() + "").slice(-10);
  constructor(status, type, content) {
    //status: todo,progess, done
    this.status = status;
    this.type = type;
    this.content = content;
  }
  _getId() {
    return this.id;
  }
  _setId(id) {
    this.id = id;
  }
}

class App {
  #type = ["design", "development", "bugfix"];
  #status = ["todo", "inProcess", "completed"];
  #list = [];
  itemDrag;
  idEdit;
  addTodo = false;
  constructor() {
    //render list
    this._getLocalStorage();
    this._renderType();
    //add event
    select.addEventListener("click", function () {
      option.classList.toggle("show");
      icon.classList.toggle("fa-chevron-up");
    });

    btnAdds.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.addTodo = true;
        const col = e.target.closest(".todo__col");
        modal.classList.add("show");
        form.dataset.status = col.dataset.status;
      });
    });
    //on off modal
    modal.addEventListener("click", (e) => {
      if (e.target.closest(".modal__content")) return;
      modal.classList.remove("show"); // this evenListener=> this=DOM element maf handle event dc gan vao
      this.addTodo = false;
    });
    //get value drop down
    option.addEventListener("click", function (e) {
      if (!e.target.closest(".option")) return;
      const opt = e.target.dataset.option;
      option.classList.remove("show");
      select.querySelector("span").innerHTML = opt;
      dropdown.dataset.value = opt;
      icon.classList.remove("fa-chevron-up");
    });
    //Submit
    form.addEventListener("submit", this._handleSubmit.bind(this));
    //remove
    todoContainer.forEach((cur) => {
      cur.addEventListener("click", this._handleEdit.bind(this));
      cur.addEventListener("click", this._handleDelete.bind(this));
      cur.addEventListener("dragstart", (e) => {
        if (!e.target.closest(".todo__item")) return;
        setTimeout(() => e.target.classList.add("visible"), 0);
        const status = cur.closest(".todo__col").dataset.status;
        this.itemDrag = e.target;
        this._renderNewBox(status, e.target);
      });
      cur.addEventListener("dragend", (e) => {
        if (!e.target.closest(".todo__item")) return;
        e.target.classList.remove("visible");
        const newStatus = e.target.closest(".todo__col").dataset.status;
        this._getItemById(e.target.dataset.id).status = newStatus;
        this._renderList();
      });
      //add Drop
    });
    //edit
  }

  _handleEdit(e) {
    if (!e.target.closest(".fa-edit")) return;
    const curItemId = e.target.closest(".todo__item").dataset.id;
    this.idEdit = curItemId;
    const item = this._getItemById(curItemId);
    modal.classList.add("show");
    form.dataset.status = item.status;
    area.value = item.content;
    select.querySelector("span").innerHTML = item.type;
  }
  _renderNewBox(status, el) {
    cols.forEach((col) => {
      if (col.dataset.status === status) return;
      const todoContainer = col.querySelector(".todo__container");
      const newBox = document.createElement("div");
      newBox.className = "todo__box";
      //add in-line style
      newBox.style.height = getComputedStyle(el).height;
      newBox.style.width = getComputedStyle(el).width;
      todoContainer.insertAdjacentElement("beforeend", newBox);
      newBox.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      newBox.addEventListener("dragenter", function (e) {
        e.preventDefault();
        if (!e.target.closest(".todo__box")) return;
        e.target.classList.add("hovered");
      });
      newBox.addEventListener("dragleave", function (e) {
        if (!e.target.closest(".todo__box")) return;
        e.target.classList.remove("hovered");
      });
      newBox.addEventListener("drop", (e) => {
        if (!e.target.closest(".todo__box")) return;
        e.target.append(this.itemDrag);
        e.target.classList.remove("hovered");
      });
    });
  }
  _handleDelete(e) {
    if (!e.target.closest(".fa-trash")) return;
    const item = e.target.closest(".todo__item");
    const id = item.dataset.id;
    const status = item.closest(".todo__col").dataset.status;
    this.#list = this.#list.filter((item) => item.id !== id);
    this._renderListByStatus(status);
  }
  _getItemById(id) {
    return this.#list.filter((item) => item.id === id)[0];
  }
  _handleSubmit(e) {
    e.preventDefault();
    console.log(this.addTodo);
    if (this.addTodo) this._addTodo();
    else this._editTodo(this.idEdit);
    //reset data
    form.dataset.status = "";
    area.value = "";
    select.querySelector("span").innerHTML = "Choose todo type";
    modal.classList.remove("show");
  }
  _editTodo(id) {
    let status;
    this.#list = this.#list.map((item) => {
      if (item.id !== id) return item;
      status = item.status;
      console.log(status);
      item.type = dropdown.dataset.value;
      item.content = area.value;
      return item;
    });
    this._renderListByStatus(status);
  }
  _addTodo() {
    const type = dropdown.dataset.value;
    const content = area.value;
    const status = form.dataset.status;
    const item = new todoItem(status, type, content);
    this.#list.push(item);
    this._renderListByStatus(status);
    this.addTodo = false;
  }
  _renderList() {
    this.#status.forEach((s) => {
      this._renderListByStatus(s);
    });
  }
  _renderListByStatus(status) {
    const col = cols[this.#status.indexOf(status)];
    let counter = col.querySelector(".todo__counter");
    const todoContainer = col.querySelector(".todo__container");
    todoContainer.innerHTML = "";
    this.#list
      .filter((item) => item.status === status)
      .forEach((item, _, cur) => {
        //counter item
        counter.innerHTML = cur.length;
        this._renderItem(todoContainer, item);
      });
    this._setLocalStorage("todoList", this.#list);
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

    //set localStorage
  }
  _setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  _getLocalStorage() {
    const listTodo = JSON.parse(localStorage.getItem("todoList"));
    listTodo.forEach((item) => {
      const newTodo = new todoItem(item.status, item.type, item.content);
      newTodo._setId(item.id);
      this.#list.push(newTodo);
    });
    this._renderList();
  }
  _getColorByType(type) {
    if (type === "design") return "red";
    if (type === "development") return "green";
    if (type === "bugfix") return "orange";
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
const app = new App();
