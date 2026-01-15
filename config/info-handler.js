fetch("./config/info-messages.json")
  .then(res => res.json())
  .then(infoData => {
    document.querySelectorAll(".info-icon").forEach(icon => {
      icon.addEventListener("click", () => {
        const key = icon.dataset.info;
        const info = infoData[key];

        if (!info) return;

        alert(`${info.title}\n\n${info.message}`);
      });
    });
  });
