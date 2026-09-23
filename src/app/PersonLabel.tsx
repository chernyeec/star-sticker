import { getKidPhoto } from "@/lib/kidPhotos";

export default function PersonLabel({
  name,
  avatar,
  size = 28,
}: {
  name: string;
  avatar?: string | null;
  size?: number;
}) {
  const photo = getKidPhoto(name);

  if (!photo) {
    return (
      <>
        {avatar ? `${avatar} ` : ""}
        {name}
      </>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt=""
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          objectFit: "cover",
          verticalAlign: "middle",
          marginRight: "0.4rem",
        }}
      />
      {name}
    </>
  );
}
