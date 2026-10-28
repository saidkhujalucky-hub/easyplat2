import EasyPlast from "./EasyPlast";
import { getSiteUser } from "./auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSiteUser();
  return <EasyPlast user={user ? { displayName: user.displayName, email: user.email } : null} />;
}
