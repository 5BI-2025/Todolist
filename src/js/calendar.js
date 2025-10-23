let currentDate = new Date();

function initCalendar(todos, getP, updateViews, switchView) {
  const calendarView = document.getElementById("calendar-view");
  const currentMonthEl = document.getElementById("current-month");
  const calendarDaysEl = document.getElementById("calendar-days");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const viewBoardBtn = document.getElementById("view-board");
  const viewCalendarBtn = document.getElementById("view-calendar");
  const searchInput = document.getElementById("search");
  const filterPriority = document.getElementById("filter-priority");
  const board = document.getElementById("board");

  function getMonthName(date) {
    return date.toLocaleString("it-IT", { month: "long" });
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentMonthEl.textContent = `${
      getMonthName(currentDate).charAt(0).toUpperCase() +
      getMonthName(currentDate).slice(1)
    } ${year}`;

    calendarDaysEl.innerHTML = "";

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Calculate how many empty cells before first day of month
    let firstDayIndex = firstDay.getDay(); // 0 = Sunday

    // Create empty cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      calendarDaysEl.appendChild(
        el("div", {
          cls: "h-28 p-1 text-center text-gray-400 border border-gray-100",
        })
      );
    }

    // Filter todos for current view
    const term = (searchInput.value || "").toLowerCase();
    const pref = filterPriority.value || "all";
    // Normalize date strings to local YYYY-MM-DD for comparison
    function normalizeDate(dateStr) {
      if (!dateStr) return null;
      // Already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const d = new Date(dateStr);
      if (isNaN(d)) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    }
    const filteredTodos = todos
      .filter((i) => {
        const matchText =
          i.title.toLowerCase().includes(term) ||
          (i.description && i.description.toLowerCase().includes(term));
        const matchP = pref === "all" || i.priority === pref;
        return matchText && matchP;
      })
      .map((t) => ({ ...t, _normDue: normalizeDate(t.dueDate) }));

    // Create days with todos
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Build a local YYYY-MM-DD string to match the format produced by <input type="date">
      const yr = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, "0");
      const da = String(date.getDate()).padStart(2, "0");
      const dateStr = `${yr}-${mo}-${da}`;

      const todosForDay = filteredTodos.filter((t) => t._normDue === dateStr);

      date.setHours(0, 0, 0, 0);

      let cellClass =
        "day-cell h-28 p-1 border border-gray-100 bg-white hover:bg-gray-50 transition-colors overflow-auto";

      if (todosForDay.length > 0) {
        // Has todos - add a subtle background
        cellClass += " bg-indigo-50";

        // If past due and has todos, make it more obvious
        if (isPast) {
          cellClass += " bg-red-50";
        }
      }

      const dayCell = el("div", {
        cls: cellClass,
      });

      // Add date number
      const dayHeader = el("div", {
        cls: "text-right font-medium text-gray-700 mb-1 sticky top-0 bg-white z-10 p-1",
        text: day.toString(),
      });
      dayCell.appendChild(dayHeader);

      // Mark today
      if (
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()
      ) {
        dayHeader.classList.add(
          "text-black",
          "bg-indigo-600",
          "rounded-full",
          "w-6",
          "h-6",
          "flex",
          "items-center",
          "justify-center",
          "ml-auto"
        );
      }

      // Add todos for this day
      if (todosForDay.length) {
        todosForDay.forEach((todo) => {
          const p = getP(todo.priority);
          // Use a left border with priority color (e.g. 'border-l-4 border-l-green-500')
          const borderClass = `border-l-4 ${p.border}`.trim();
          const todoItem = el("div", {
            cls: `text-xs p-1 mb-1 rounded ${p.bg} ${borderClass} truncate cursor-pointer`,
            text: todo.title,
            ds: { id: todo.id },
          });

          todoItem.addEventListener("click", () => {
            // Find the appropriate column for this todo and scroll to it
            switchView("board");
            setTimeout(() => {
              const todoEl = document.querySelector(
                `.todo-card[data-id="${todo.id}"]`
              );
              if (todoEl) {
                todoEl.scrollIntoView({ behavior: "smooth", block: "center" });
                todoEl.classList.add("highlighted-todo");
                setTimeout(() => {
                  todoEl.classList.remove("highlighted-todo");
                }, 2000);
              }
            }, 300);
          });

          dayCell.appendChild(todoItem);
        });
      }

      calendarDaysEl.appendChild(dayCell);
    }
  }

  function handleSwitchView(view) {
    if (view === "board") {
      board.classList.remove("hidden");
      calendarView.classList.add("hidden");
      viewBoardBtn.classList.add("active", "bg-indigo-100", "text-indigo-700");
      viewBoardBtn.classList.remove("bg-white", "text-gray-700");
      viewCalendarBtn.classList.remove(
        "active",
        "bg-indigo-100",
        "text-indigo-700"
      );
      viewCalendarBtn.classList.add("bg-white", "text-gray-700");
    } else if (view === "calendar") {
      board.classList.add("hidden");
      calendarView.classList.remove("hidden");
      viewCalendarBtn.classList.add(
        "active",
        "bg-indigo-100",
        "text-indigo-700"
      );
      viewCalendarBtn.classList.remove("bg-white", "text-gray-700");
      viewBoardBtn.classList.remove(
        "active",
        "bg-indigo-100",
        "text-indigo-700"
      );
      viewBoardBtn.classList.add("bg-white", "text-gray-700");
      renderCalendar();
    }
  }

  // Helper function for creating elements
  function el(
    tag,
    { cls, html, text, attrs = {}, ds = {}, children = [] } = {}
  ) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    if (text) n.textContent = text;
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    Object.entries(ds).forEach(([k, v]) => (n.dataset[k] = v));
    children.forEach((c) => n.appendChild(c));
    return n;
  }

  // Calendar navigation
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // View toggle events
  viewBoardBtn.addEventListener("click", () => handleSwitchView("board"));
  viewCalendarBtn.addEventListener("click", () => handleSwitchView("calendar"));

  const style = document.createElement("style");
  style.textContent = `
    .view-btn.active {
      font-weight: 600;
    }

    #calendar-days .day-cell:hover {
      background-color: #f9fafb;
    }

    .highlighted-todo {
      animation: highlight-pulse 2s ease-in-out;
    }
    @keyframes highlight-pulse {
      0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
      50% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }
    
    /* Scrollbar styling for calendar day cells */
    .day-cell {
      scrollbar-width: thin;
      scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
    }

    .day-cell::-webkit-scrollbar {
      width: 4px;
    }

    .day-cell::-webkit-scrollbar-track {
      background: transparent;
    }

    .day-cell::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 20px;
    }
  `;
  document.head.appendChild(style);

  renderCalendar();
  handleSwitchView("board");

  return {
    renderCalendar,
    switchView: handleSwitchView,
  };
}

export { initCalendar };
