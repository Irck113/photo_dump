const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const imagesByDate = {};

async function fetchImages() {
  try {
    const response = await fetch("/api/images");
    const data = await response.json();
    Object.assign(imagesByDate, data);
    renderYear();
    highlightDaysWithImages();
  } catch (error) {
    console.error("Error al cargar las imágenes:", error);
  }
}

function renderYear() {
  const container = document.getElementById("yearContainer");
  months.forEach((month, index) => {
    const monthContainer = document.createElement("div");
    monthContainer.className = "month-container";

    const monthHeader = document.createElement("div");
    monthHeader.className = "month-header";
    monthHeader.innerText = month;
    monthHeader.onclick = () => {
      const monthNum = index + 1;
      window.location.href = `/month.html?month=${monthNum}`;
    };

    const monthCalendar = document.createElement("div");
    monthCalendar.className = "month-calendar";

    weekdays.forEach((day) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "weekday-header";
      dayHeader.innerText = day;
      monthCalendar.appendChild(dayHeader);
    });

    const firstDay = new Date(2025, index, 1).getDay();
    const daysInMonth = new Date(2025, index + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "empty-day";
      monthCalendar.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";
      dayDiv.innerText = day;
      dayDiv.onclick = () => {
        const monthNum = index + 1;
        window.location.href = `/day.html?month=${monthNum}&day=${day}`;
      };
      monthCalendar.appendChild(dayDiv);
    }

    monthContainer.appendChild(monthHeader);
    monthContainer.appendChild(monthCalendar);
    container.appendChild(monthContainer);
  });
}

function highlightDaysWithImages() {
  Object.keys(imagesByDate).forEach((date) => {
    const [year, month, day] = date.split("-").map((num) => parseInt(num));
    const monthIndex = month - 1;
    const monthContainer =
      document.querySelectorAll(".month-container")[monthIndex];
    const days = monthContainer.querySelectorAll(".day");
    const dayElement = days[parseInt(day) - 1];
    if (dayElement) {
      const imageCount = imagesByDate[date].length;
      if (imageCount > 1) {
        dayElement.classList.add("has-multiple-images");
      } else if (imageCount === 1) {
        dayElement.classList.add("has-single-image");
      }
    }
  });
}

// Iniciar la carga de imágenes cuando se carga la página
fetchImages();
