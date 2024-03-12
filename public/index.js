// onDownload
const onDownload = async e => {
  const filename = e.target.getAttribute("data-filename");
  if (filename == null || filename === "") {
    alert("Filename is required");
    return;
  }

  const response = await fetch(`/api/file`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });

  if (response.status !== 200) {
    alert("Failed to download file");
    return;
  }

  const data = await response.blob();

  const file = window.URL.createObjectURL(data);
  window.location.assign(file);
};

const saveButtons = document.getElementsByClassName("save-btn");
for (const btn of saveButtons) {
  btn.addEventListener("click", onDownload);
}

// onDelete
const onDelete = async e => {
  const filename = e.target.getAttribute("data-filename");
  if (filename == null || filename === "") {
    alert("Filename is required");
    return;
  }

  const hasConfirmed = confirm(`Are you sure you want to delete ${filename}?`);
  if (!hasConfirmed) {
    return;
  }

  const response = await fetch(`/api/file`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });

  if (response.status !== 200) {
    alert("Failed to delete file");
    return;
  }

  window.location.reload();
};

const deleteButtons = document.getElementsByClassName("delete-btn");
for (const btn of deleteButtons) {
  btn.addEventListener("click", onDelete);
}
