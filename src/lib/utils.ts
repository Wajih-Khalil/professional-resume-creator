export function getFontClass(fontName: string): string {
  const name = fontName.toLowerCase();
  if (name.includes("space") || name.includes("grotesk")) return "font-grotesk";
  if (name.includes("playfair")) return "font-playfair";
  if (name.includes("lora")) return "font-lora";
  if (name.includes("outfit")) return "font-outfit";
  if (name.includes("jakarta") || name.includes("plus")) return "font-jakarta";
  if (name.includes("mono") || name.includes("jetbrains")) return "font-mono-custom";
  return "font-sans-custom"; // Default Inter
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month] = dateStr.split("-");
  if (!year) return dateStr;
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = parseInt(month, 10) - 1;
  
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${months[monthIdx]} ${year}`;
  }
  return year;
}
