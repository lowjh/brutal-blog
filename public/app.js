const form = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const contentInput = document.getElementById("comment-content");
const list = document.getElementById("comment-list");

async function loadComments() {
  try {
    const res = await fetch("/api/comments");
    const comments = await res.json();
    renderComments(comments);
  } catch {
    list.innerHTML = '<div class="comment-empty">留言加载失败</div>';
  }
}

function renderComments(comments) {
  if (!comments.length) {
    list.innerHTML = '<div class="comment-empty">还没有留言，来抢沙发</div>';
    return;
  }
  list.innerHTML = comments
    .map(
      (c) => `
    <div class="comment">
      <div class="comment-header">
        <span class="comment-name">${escapeHtml(c.name)}</span>
        <span class="comment-date">${formatDate(c.createdAt)}</span>
      </div>
      <div class="comment-content">${escapeHtml(c.content)}</div>
    </div>`
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const content = contentInput.value.trim();
  if (!name || !content) return;
  try {
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });
    nameInput.value = "";
    contentInput.value = "";
    loadComments();
  } catch {
    alert("提交失败，重试");
  }
});

loadComments();
