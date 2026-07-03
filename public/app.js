const tabs = document.querySelectorAll(".tab");
const forms = {
  daily: document.querySelector("#dailyForm"),
  calendar: document.querySelector("#calendarForm"),
  image: document.querySelector("#imageForm")
};
const result = document.querySelector("#result");
const loading = document.querySelector("#loading");
const outputTitle = document.querySelector("#outputTitle");
const copyButton = document.querySelector("#copyButton");

let lastOutput = "";

function formDataToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
}

function setError(message) {
  outputTitle.textContent = "Error";
  result.className = "result";
  result.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
  lastOutput = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTags(tags) {
  return `<div class="tag-row">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function renderDailyPost(data) {
  outputTitle.textContent = "Daily Post";
  result.className = "result post-card";
  result.innerHTML = `
    <article class="item">
      <h3>Caption</h3>
      <p>${escapeHtml(data.caption)}</p>
    </article>
    <article class="item">
      <h3>Hashtags</h3>
      ${renderTags(data.hashtags || [])}
    </article>
    <article class="item">
      <h3>Call to action</h3>
      <p>${escapeHtml(data.call_to_action)}</p>
    </article>
    <article class="item">
      <h3>Image prompt</h3>
      <p>${escapeHtml(data.image_prompt)}</p>
    </article>
  `;
}

function renderCalendar(data) {
  outputTitle.textContent = "30-Day Calendar";
  result.className = "result calendar-grid";
  result.innerHTML = (data.posts || [])
    .map(
      (post) => `
        <article class="item">
          <h3>Day ${escapeHtml(post.day)}: ${escapeHtml(post.post_idea)}</h3>
          <p>${escapeHtml(post.caption)}</p>
          ${renderTags(post.hashtags || [])}
          <p><strong>Image:</strong> ${escapeHtml(post.image_prompt)}</p>
        </article>
      `
    )
    .join("");
}

function renderImage(data) {
  outputTitle.textContent = "Generated Image";
  result.className = "result";
  result.innerHTML = `<img class="generated-image" src="${data.generated_image_url}" alt="Generated social media post" />`;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const mode = tab.dataset.mode;
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    Object.entries(forms).forEach(([name, form]) => {
      form.classList.toggle("hidden", name !== mode);
    });
  });
});

forms.daily.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading(true);
  try {
    const data = await postJson("/api/daily-post", formDataToObject(forms.daily));
    lastOutput = JSON.stringify(data, null, 2);
    renderDailyPost(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
});

forms.calendar.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading(true);
  try {
    const data = await postJson("/api/calendar", formDataToObject(forms.calendar));
    lastOutput = JSON.stringify(data, null, 2);
    renderCalendar(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
});

forms.image.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading(true);
  try {
    const data = await postJson("/api/image", formDataToObject(forms.image));
    lastOutput = JSON.stringify(data, null, 2);
    renderImage(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
});

copyButton.addEventListener("click", async () => {
  if (!lastOutput) return;
  await navigator.clipboard.writeText(lastOutput);
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1000);
});
