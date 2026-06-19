// god i hate javascript
// anything for the website i suppose

document.addEventListener("DOMContentLoaded", () => { // WHY THE FUCK IS IT SO NESTED
  document.querySelectorAll(".copy-ip").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      const text = "connect " + btn.dataset.copy;
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);

        const old = btn.textContent;
        btn.textContent = "Copied!";

        setTimeout(() => {
          btn.textContent = old;
        }, 1000);
      } catch (err) {
        console.log("failure", err);
      }

    })
  })
}) // THIS FILE HAS TWELVE CURLY BRACES

// i know past spark. it does indeed have 12 {}s.
// but im not porting this unholy file to typescript. continue suffering.