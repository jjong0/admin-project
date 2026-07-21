export function formatCustomerCode(id: number) {
  return `U${String(id).padStart(4, "0")}`;
}

export function formatProductCode(id: number) {
  return `P${String(id).padStart(4, "0")}`;
}

export function formatOrderCode(id: number) {
  return `O${String(id).padStart(6, "0")}`;
}
