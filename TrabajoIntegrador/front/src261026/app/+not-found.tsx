import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function NotFound() {
  const { user } = useAuth();
  return <Redirect href={user ? "/home" : "/login"} />;
}