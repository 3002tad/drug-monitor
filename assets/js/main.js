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

  // ====== CHECK DOSAGE (AJAX refresh) ======
  if (window.location.pathname === "/check-dosage") {
    async function refreshDosage() {
      try {
        const r = await fetch(`/api/dosage/check`, { headers: { 'Accept':'application/json' } });
        const json = await r.json();
        if (!json.ok) throw new Error(json.error || 'Failed');

        const tbody = document.querySelector('#dosageTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        (json.items || []).forEach((it, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${i+1}</td>
            <td><strong>${it.name || ''}</strong></td>
            <td><code>${it.dosage || ''}</code></td>
            <td style="color:${it.valid ? 'green' : 'red'};">${it.valid ? 'OK' : 'INVALID'}</td>
            <td>${it.morning ?? '-'}</td>
            <td>${it.afternoon ?? '-'}</td>
            <td>${it.night ?? '-'}</td>
            <td>${it.perDayFromDosage ?? '-'}</td>
            <td>
              <a class="btn btn-sm btn-outline-primary" href="/update-drug?id=${encodeURIComponent(it._id)}">Edit</a>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } catch (e) {
        alert(e.message || 'Refresh failed');
      }
    }
    refreshDosage();
    const btn = document.getElementById('refreshDosage');
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); refreshDosage(); });
  }

  // ====== PURCHASE PLAN (AJAX submit) ======
  if (window.location.pathname === "/purchase") {
    const form = document.querySelector('form[action="/purchase"]');
    async function loadPlan(days) {
      try {
        const r = await fetch(`/api/purchase/plan?days=${encodeURIComponent(days||30)}`, { headers:{'Accept':'application/json'} });
        const json = await r.json();
        if (!json.ok) throw new Error(json.error || 'Failed');
        const tbody = document.querySelector('#purchaseTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        (json.rows || []).forEach((d, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${i+1}</td>
            <td><strong>${d.name||''}</strong><div style="font-size:12px;color:#666;">(${d.pillsPerCard||0} pills/card, ${d.cardsPerPack||0} cards/pack)</div></td>
            <td><code>${d.dosage||''}</code></td>
            <td>${d.perDay||0}</td>
            <td>${d.pillsNeeded||0}</td>
            <td>${d.cardsBuy||0}</td>
            <td>${d.cardsLeftover||0}</td>
            <td>${d.cardsEff ? d.cardsEff.toFixed(1)+'%' : '0%'}</td>
            <td>${d.packsBuy||0}</td>
            <td>${d.packsLeftover||0}</td>
            <td>${d.packsEff ? d.packsEff.toFixed(1)+'%' : '0%'}</td>
            <td>
              <button class="btn btn-sm btn-success confirm-btn"
                      data-id="${d._id}"
                      data-name="${d.name||''}"
                      data-days="${json.days||days}"
                      data-perday="${d.perDay||0}"
                      data-pillsneeded="${d.pillsNeeded||0}"
                      data-cardsbuy="${d.cardsBuy||0}"
                      data-packsbuy="${d.packsBuy||0}">
                Confirm
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } catch (e) {
        alert(e.message || 'Load plan failed');
      }
    }
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const days = document.getElementById('days')?.value || 30;
        loadPlan(days);
      });
    }
    const daysInit = document.getElementById('days')?.value || 30;
    loadPlan(daysInit);
  }
  // Xử lý nút Confirm trong bảng Purchase Plan
    // ====== PURCHASE Confirm popup ======
  $(document).on('click', '.confirm-btn', function () {
    const $btn = $(this);
    const name = $btn.data('name');
    const id = $btn.data('id');
    const days = $btn.data('days') || $('#days').val() || 30;
    const perDay = $btn.data('perday');
    const pillsNeeded = $btn.data('pillsneeded');
    const cardsBuy = $btn.data('cardsbuy');
    const packsBuy = $btn.data('packsbuy');

    const msg = [
      `Confirm purchase plan:`,
      `- Drug: ${name} (${id})`,
      `- Days: ${days}`,
      `- Per day: ${perDay} pill(s)`,
      `- Total needed: ${pillsNeeded} pill(s)`,
      `- Option A: Buy ${cardsBuy} card(s)`,
      `- Option B: Buy ${packsBuy} pack(s)`
    ].join('\n');

    alert(msg);
  });
});