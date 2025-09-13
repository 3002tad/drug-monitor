// assets/js/main.js
// Helper: chuẩn hóa base URL để chạy cả http lẫn https
const baseUrl = `${window.location.protocol}//${window.location.host}`;

function handleAjaxError(xhr) {
  let msg = 'Something went wrong.';
  try { msg = (xhr.responseJSON && xhr.responseJSON.error) || xhr.responseText || msg; } catch {}
  alert(msg);
}

// ====== CREATE (nếu form #add_drug tồn tại) ======
$(document).ready(function () {
  const $addForm = $("#add_drug");
  if ($addForm.length) {
    $addForm.on("submit", function (e) {
      e.preventDefault();
      const form = this;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      $.ajax({
        url: `${baseUrl}/api/drugs`,
        method: "POST",
        data,
      })
        .done(() => {
          alert("Drug created successfully!");
          window.location.assign("/manage");
        })
        .fail(handleAjaxError);
    });
  }

  // ====== UPDATE (nếu form #update_drug tồn tại) ======
  const $updateForm = $("#update_drug");
  if ($updateForm.length) {
    $updateForm.on("submit", function (e) {
      e.preventDefault();
      const form = this;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const id = data.id;

      $.ajax({
        url: `${baseUrl}/api/drugs/${id}`,
        method: "PUT",
        data,
      })
        .done(() => {
          alert("Drug updated successfully!");
          window.location.assign("/manage");
        })
        .fail(handleAjaxError);
    });
  }

  // ====== DELETE (ở trang /manage) ======
  if (window.location.pathname === "/manage") {
    $(".delete").on("click", function () {
      const id = $(this).attr("data-id");
      if (!id) return;

      if (confirm("Do you really want to delete this drug?")) {
        $.ajax({
          url: `${baseUrl}/api/drugs/${id}`,
          method: "DELETE",
        })
          .done(() => {
            alert("Drug deleted successfully!");
            location.reload();
          })
          .fail(handleAjaxError);
      }
    });
  }
});