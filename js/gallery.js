async function loadImages() {
  const urlParams = new URLSearchParams(window.location.search);
  const date = urlParams.get("date");

  const response = await fetch("/api/images");
  const imagesByDate = await response.json();

  const images = imagesByDate[date] || [];
  const container = document.querySelector(".image-grid");

  images.forEach((image) => {
    const div = document.createElement("div");
    div.className = "image-container";

    const img = document.createElement("img");
    img.src = `/images/${image.path.split("/").pop()}`;
    div.appendChild(img);

    const info = document.createElement("div");
    info.className = "image-info";
    info.innerHTML = `
            <div>Camera: ${image.metadata.camera}</div>
            <div>ISO: ${image.metadata.iso}</div>
            <div>Exposure: ${image.metadata.exposure}</div>
            <div>Aperture: ${image.metadata.aperture}</div>
        `;
    div.appendChild(info);

    container.appendChild(div);
  });
}
