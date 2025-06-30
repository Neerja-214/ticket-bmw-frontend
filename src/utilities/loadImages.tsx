// utils/loadImages.ts
function importAll(r: any) {
    let images: Record<string, string> = {};
    r.keys().forEach((item: string) => {
      const key = item.replace('./', '');
      images[key] = r(item);
    });
    return images;
  }
  
  export const images: Record<string, string> = importAll(require.context('../assets', false, /\.(png|jpe?g|svg)$/));
  