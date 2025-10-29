import Image from "next/image";
import HomePage from "./home/page";
import Navbar from "@/components/navbar/page";

export default function Home() {
  return (
    <>
    <Navbar/>
    <HomePage />
    </>
  );
}
