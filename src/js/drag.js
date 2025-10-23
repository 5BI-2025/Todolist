let dragged = null;

export function handleDragStart(e) {
  dragged = this;
  this.classList.add(
    "opacity-50",
    "rotate-1",
    "shadow-md",
    "scale-105",
    "z-10"
  );
  e.dataTransfer.effectAllowed = "move";
  try {
    e.dataTransfer.setData("text/todo", this.dataset.id);
  } catch (err) {
    e.dataTransfer.setData("text/plain", this.dataset.id);
  }
}

export function handleDragEnd() {
  this.classList.remove(
    "opacity-50",
    "rotate-1",
    "shadow-md",
    "scale-105",
    "z-10"
  );
  document
    .querySelectorAll(".board-column")
    .forEach((c) =>
      c.classList.remove(
        "bg-blue-50",
        "border-2",
        "border-dashed",
        "border-blue-300"
      )
    );
}
