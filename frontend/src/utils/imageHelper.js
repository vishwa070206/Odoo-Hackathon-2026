export function getAssetFallbackImage(categoryName, assetName = "") {
  const nameLower = assetName.toLowerCase();
  const catLower = (categoryName || "").toLowerCase();

  if (nameLower.includes("macbook") || nameLower.includes("laptop")) {
    return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("monitor") || nameLower.includes("ultrasharp")) {
    return "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("chair") || nameLower.includes("aeron")) {
    return "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("desk") || nameLower.includes("standing")) {
    return "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("camry") || catLower.includes("vehicle") || nameLower.includes("car")) {
    return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("server") || nameLower.includes("poweredge") || catLower.includes("it equip")) {
    return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("switch") || nameLower.includes("cisco")) {
    return "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600&auto=format&fit=crop&q=80";
  }
  if (catLower.includes("meeting") || catLower.includes("room") || nameLower.includes("conference")) {
    return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";
  }
  if (catLower.includes("lab") || nameLower.includes("oscilloscope")) {
    return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("projector")) {
    return "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("ipad") || nameLower.includes("tablet")) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80";
  }
  if (nameLower.includes("printer")) {
    return "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80";
  }

  // Fallback default
  return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80";
}
