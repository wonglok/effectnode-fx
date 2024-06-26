import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    location.assign("/dev");
  }, []);
  return <></>;
}
