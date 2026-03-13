const itemsBody = document.getElementById("itemsBody");
const previewItemsBody = document.getElementById("previewItemsBody");

const currencySymbols = {
  BDT: "৳",
  USD: "$",
  AUD: "A$",
  GBP: "£",
  EUR: "€",
};

function setDefaultDates() {
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 7);

  document.getElementById("invoiceDate").value = formatDateForInput(today);
  document.getElementById("dueDate").value = formatDateForInput(due);
}

function formatDateForInput(date) {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCurrency() {
  return document.getElementById("currency").value;
}

function getCurrencySymbol() {
  return currencySymbols[getCurrency()] || "";
}

function formatMoney(value) {
  const num = Number(value || 0);
  return `${getCurrencySymbol()}${num.toFixed(2)}`;
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function createItemRow(item = {}) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" class="item-input desc" placeholder="Product / Service" value="${item.desc || ""}"></td>
    <td><input type="number" class="item-input qty" min="1" step="1" value="${item.qty || 1}"></td>
    <td><input type="number" class="item-input price" min="0" step="0.01" value="${item.price || 0}"></td>
    <td class="line-total">${formatMoney(0)}</td>
    <td><button type="button" class="remove-btn">Remove</button></td>
  `;

  tr.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updateInvoice);
  });

  tr.querySelector(".remove-btn").addEventListener("click", () => {
    tr.remove();
    updateInvoice();
  });

  itemsBody.appendChild(tr);
  updateInvoice();
}

function getItems() {
  const rows = [...itemsBody.querySelectorAll("tr")];

  return rows.map((row) => {
    const desc = row.querySelector(".desc").value.trim();
    const qty = parseFloat(row.querySelector(".qty").value) || 0;
    const price = parseFloat(row.querySelector(".price").value) || 0;
    const total = qty * price;

    row.querySelector(".line-total").textContent = formatMoney(total);

    return { desc, qty, price, total };
  });
}

function updateInvoice() {
  const invoiceNumber = document.getElementById("invoiceNumber").value;
  const invoiceDate = document.getElementById("invoiceDate").value;
  const dueDate = document.getElementById("dueDate").value;
  const currency = document.getElementById("currency").value;

  const fromName = document.getElementById("fromName").value;
  const fromEmail = document.getElementById("fromEmail").value;
  const fromPhone = document.getElementById("fromPhone").value;
  const fromAddress = document.getElementById("fromAddress").value;

  const clientName = document.getElementById("clientName").value;
  const clientEmail = document.getElementById("clientEmail").value;
  const clientPhone = document.getElementById("clientPhone").value;
  const clientAddress = document.getElementById("clientAddress").value;

  const paymentMethod = document.getElementById("paymentMethod").value;
  const bankName = document.getElementById("bankName").value;
  const bankDetails = document.getElementById("bankDetails").value;
  const note = document.getElementById("note").value;

  const taxPercent = parseFloat(document.getElementById("tax").value) || 0;
  const discount = parseFloat(document.getElementById("discount").value) || 0;
  const shipping = parseFloat(document.getElementById("shipping").value) || 0;

  document.getElementById("pInvoiceNumber").textContent = invoiceNumber || "-";
  document.getElementById("pInvoiceDate").textContent = formatDisplayDate(invoiceDate);
  document.getElementById("pDueDate").textContent = formatDisplayDate(dueDate);
  document.getElementById("pCurrency").textContent = currency;

  document.getElementById("pFromName").textContent = fromName || "-";
  document.getElementById("pFromEmail").textContent = fromEmail || "-";
  document.getElementById("pFromPhone").textContent = fromPhone || "-";
  document.getElementById("pFromAddress").textContent = fromAddress || "-";

  document.getElementById("pClientName").textContent = clientName || "Client Name";
  document.getElementById("pClientEmail").textContent = clientEmail || "client@email.com";
  document.getElementById("pClientPhone").textContent = clientPhone || "-";
  document.getElementById("pClientAddress").textContent = clientAddress || "Client address";

  document.getElementById("pPaymentMethod").textContent = paymentMethod || "-";
  document.getElementById("pBankName").textContent = bankName || "-";
  document.getElementById("pBankDetails").textContent = bankDetails || "-";
  document.getElementById("pNote").textContent = note || "Thank you for your business.";

  const items = getItems();
  previewItemsBody.innerHTML = "";

  let subtotal = 0;

  items.forEach((item) => {
    subtotal += item.total;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.desc || "-")}</td>
      <td>${item.qty}</td>
      <td>${formatMoney(item.price)}</td>
      <td>${formatMoney(item.total)}</td>
    `;
    previewItemsBody.appendChild(row);
  });

  const taxAmount = subtotal * (taxPercent / 100);
  const grandTotal = subtotal + taxAmount + shipping - discount;

  document.getElementById("pSubtotal").textContent = formatMoney(subtotal);
  document.getElementById("pTax").textContent = formatMoney(taxAmount);
  document.getElementById("pDiscount").textContent = formatMoney(discount);
  document.getElementById("pShipping").textContent = formatMoney(shipping);
  document.getElementById("pGrandTotal").textContent = formatMoney(grandTotal);
}

function setupInputs() {
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("input", updateInvoice);
    el.addEventListener("change", updateInvoice);
  });
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("msdev_invoice_theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light Mode";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("msdev_invoice_theme", isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
  });
}

async function downloadPDF() {
  const invoice = document.getElementById("invoicePreview");
  const { jsPDF } = window.jspdf;

  const oldShadow = invoice.style.boxShadow;
  const oldRadius = invoice.style.borderRadius;

  invoice.style.boxShadow = "none";
  invoice.style.borderRadius = "0";

  const canvas = await html2canvas(invoice, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  invoice.style.boxShadow = oldShadow;
  invoice.style.borderRadius = oldRadius;

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  pdf.addImage(imgData, "PNG", 0, 0, 210, 297);

  const fileName = `${document.getElementById("invoiceNumber").value || "invoice"}.pdf`;
  pdf.save(fileName);
}

document.getElementById("addItemBtn").addEventListener("click", () => {
  createItemRow({ desc: "", qty: 1, price: 0 });
});

document.getElementById("downloadPdf").addEventListener("click", downloadPDF);

setDefaultDates();
setupInputs();
setupTheme();

createItemRow({ desc: "Website Design", qty: 1, price: 5000 });
createItemRow({ desc: "Hosting & Maintenance", qty: 1, price: 2000 });

updateInvoice();
