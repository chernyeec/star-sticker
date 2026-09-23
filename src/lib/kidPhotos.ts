const KID_PHOTOS: Record<string, string> = {
  "xin yue": "/kids/xin-yue.jpg",
  "xin hui": "/kids/xin-hui.jpg",
  "pei jin": "/kids/pei-jin.jpg",
};

export function getKidPhoto(name: string): string | undefined {
  return KID_PHOTOS[name.trim().toLowerCase()];
}
